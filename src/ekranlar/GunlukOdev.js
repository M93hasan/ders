import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import VERI from '../../data/dersler.json';
import { oku, yaz, K, bugun, soruId } from '../depo';
import { RENK, ortak } from '../ortak';
import Konfeti from '../Konfeti';

const GUN_SAYISI = Math.floor(Date.now() / 86400000); // gün sayacı

export default function GunlukOdev() {
  // Her gün farklı ünite + ders: deterministik döngü
  const gorev = useMemo(() => {
    const toplam = VERI.dersler.length;
    const ders = VERI.dersler[GUN_SAYISI % toplam];
    const unite = ders.uniteler[GUN_SAYISI % ders.uniteler.length];
    const sorular = unite.sorular.slice(0, Math.min(10, unite.sorular.length));
    return { ders, unite, sorular };
  }, []);

  const [ozetOkundu, setOzetOkundu] = useState(false);
  const [cevaplar, setCevaplar] = useState({});
  const [tamam, setTamam] = useState(false);
  const [kayitli, setKayitli] = useState(false);

  if (VERI.dersler.length === 0) {
    return (
      <View style={ortak.kapsayici}>
        <Text style={ortak.baslik}>📝 Günün Görevi</Text>
        <View style={ortak.kart}>
          <Text style={{ fontSize: 40, textAlign: 'center' }}>📚</Text>
          <Text style={{ textAlign: 'center', marginTop: 8, color: RENK.soluk, lineHeight: 20 }}>
            Henüz ders verisi yok.{'\n'}PDF ekleyip{'\n'}
            <Text style={{ fontWeight: '700' }}>python tools/pdf_to_json.py</Text>{'\n'}çalıştırın.
          </Text>
        </View>
      </View>
    );
  }

  useEffect(() => {
    (async () => {
      const odevler = await oku(K.ODEV, {});
      if (odevler[bugun()]) { setKayitli(true); setTamam(true); }
    })();
  }, []);

  const biten = Object.keys(cevaplar).length;

  const sec = async (s, harf) => {
    if (cevaplar[s.no]) return;
    const yeni = { ...cevaplar, [s.no]: harf };
    setCevaplar(yeni);
    const id = soruId(gorev.ders.id, gorev.unite.no, s.no);
    const cozulen = await oku(K.COZULEN, {});
    cozulen[id] = { dogruMu: harf === s.dogru, tarih: bugun() };
    await yaz(K.COZULEN, cozulen);
    if (harf !== s.dogru) {
      const yanlislar = await oku(K.YANLIS, []);
      if (!yanlislar.some(y => y.soruId === id)) {
        yanlislar.push({ soruId: id, dersAd: gorev.ders.ad, unite: gorev.unite.baslik, ...s });
        await yaz(K.YANLIS, yanlislar);
      }
    }
    const hepsiOkundu = ozetOkundu && Object.keys(yeni).length === gorev.sorular.length;
    if (hepsiOkundu && !kayitli) {
      const odevler = await oku(K.ODEV, {});
      odevler[bugun()] = true;
      await yaz(K.ODEV, odevler);
      setTamam(true);
    }
  };

  return (
    <ScrollView style={ortak.kapsayici}>
      <Konfeti aktif={tamam} />
      <Text style={ortak.baslik}>📝 Günün Görevi</Text>
      <Text style={ortak.altBaslik}>
        {gorev.ders.ad} • {gorev.unite.no}. Ünite: {gorev.unite.baslik}
      </Text>

      {tamam ? (
        <View style={[ortak.kart, st.tebrikKart]}>
          <Text style={{ fontSize: 44, textAlign: 'center' }}>🎉</Text>
          <Text style={st.tebrikBaslik}>Tebrikler, görev tamamlandı!</Text>
          <Text style={st.tebrikYazi}>
            "{gorev.unite.baslik}" ünitesini bugün tamamladın. Yarın yeni görev seni bekliyor!
          </Text>
        </View>
      ) : (
        <>
          {/* Adım 1: Özet oku */}
          <View style={ortak.kart}>
            <Text style={ortak.etiket}>Adım 1 • Hızlı Özet Oku</Text>
            <Text style={{ marginVertical: 8, lineHeight: 20 }}>{gorev.unite.ozet}</Text>
            <TouchableOpacity
              style={[ortak.buton, ozetOkundu && { backgroundColor: RENK.yesil }]}
              onPress={async () => {
                setOzetOkundu(true);
                const odevler = await oku(K.ODEV, {});
                if (Object.keys(cevaplar).length === gorev.sorular.length) {
                  odevler[bugun()] = true;
                  await yaz(K.ODEV, odevler);
                  setTamam(true);
                }
              }}>
              <Text style={ortak.butonYazi}>{ozetOkundu ? '✓ Okundu' : 'Özeti Okudum'}</Text>
            </TouchableOpacity>
          </View>

          {/* Adım 2: Sorular */}
          <View style={ortak.kart}>
            <Text style={ortak.etiket}>Adım 2 • {gorev.sorular.length} Soruyu Çöz</Text>
            <Text style={{ color: RENK.soluk, marginVertical: 6, fontSize: 13 }}>
              İlerleme: {biten}/{gorev.sorular.length}
            </Text>
            {gorev.sorular.map(s => (
              <View key={s.no} style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: '600', color: RENK.metin }}>{s.no}. {s.soru}</Text>
                {['A', 'B', 'C', 'D'].map(h => {
                  const secim = cevaplar[s.no];
                  let renk = '#eef2f7', kalem = RENK.metin;
                  if (secim) {
                    if (h === s.dogru) { renk = RENK.yesil; kalem = '#fff'; }
                    else if (h === secim) { renk = RENK.kirmizi; kalem = '#fff'; }
                  }
                  return (
                    <TouchableOpacity key={h} disabled={!!secim}
                      onPress={() => sec(s, h)}
                      style={[st.sik, { backgroundColor: renk }]}>
                      <Text style={{ color: kalem }}>{h}) {s[h]}</Text>
                    </TouchableOpacity>
                  );
                })}
                {cevaplar[s.no] && (
                  <View style={st.aciklama}>
                    <Text style={{ fontSize: 12, color: RENK.soluk, lineHeight: 18 }}>
                      💡 {s.aciklama}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  sik: { padding: 10, borderRadius: 10, marginTop: 6 },
  aciklama: { backgroundColor: '#fefce8', borderRadius: 8, padding: 8, marginTop: 6 },
  tebrikKart: { alignItems: 'center', paddingVertical: 28 },
  tebrikBaslik: { fontSize: 18, fontWeight: '800', color: RENK.metin, marginVertical: 8 },
  tebrikYazi: { color: RENK.soluk, textAlign: 'center', lineHeight: 20 },
});
