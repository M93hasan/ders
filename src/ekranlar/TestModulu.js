import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import VERI from '../../data/dersler.json';
import { KATALOG } from '../dersKatalogu';
import { oku, yaz, K, bugun, soruId } from '../depo';
import { RENK, ortak } from '../ortak';

export default function TestModulu({ dersId }) {
  const [secDers, setSecDers] = useState(dersId || VERI.dersler[0].id);
  const [uIdx, setUIdx] = useState(0);
  const [cevaplar, setCevaplar] = useState({});

  const ders = VERI.dersler.find(d => d.id === secDers || d.id.startsWith(secDers + '_'));
  const katalogBilgi = KATALOG.find(k => k.id === secDers);
  if (!ders) {
    return (
      <View style={ortak.kapsayici}>
        <Text style={ortak.baslik}>🧪 Test Modülü</Text>
        <View style={ortak.kart}>
          <Text style={{ fontSize: 40, textAlign: 'center' }}>{katalogBilgi?.ikon || '📚'}</Text>
          <Text style={{ textAlign: 'center', marginTop: 8, fontWeight: '700', fontSize: 16, color: RENK.metin }}>
            {katalogBilgi?.ad || secDers}
          </Text>
          <Text style={{ textAlign: 'center', marginTop: 6, color: RENK.soluk, lineHeight: 20 }}>
            Bu dersin PDF'i henüz eklenmedi.{'\n'}
            1) pdf_kitaplar/ klasörüne <Text style={{ fontWeight: '700' }}>{secDers}_1.pdf</Text> koyun{'\n'}
            2) <Text style={{ fontWeight: '700' }}>python tools/pdf_to_json.py</Text> çalıştırın
          </Text>
        </View>
      </View>
    );
  }
  const unite = ders.uniteler[uIdx];
  const dogruSayisi = Object.entries(cevaplar).filter(([no, h]) =>
    unite.sorular.find(s => s.no === Number(no))?.dogru === h).length;

  const sec = async (s, harf) => {
    if (cevaplar[s.no]) return;
    setCevaplar(c => ({ ...c, [s.no]: harf }));
    const id = soruId(ders.id, unite.no, s.no);
    const cozulen = await oku(K.COZULEN, {});
    cozulen[id] = { dogruMu: harf === s.dogru, tarih: bugun() };
    await yaz(K.COZULEN, cozulen);
    if (harf !== s.dogru) {
      const yanlislar = await oku(K.YANLIS, []);
      if (!yanlislar.some(y => y.soruId === id)) {
        yanlislar.push({ soruId: id, dersAd: ders.ad, unite: unite.baslik, ...s });
        await yaz(K.YANLIS, yanlislar);
      }
    }
  };

  return (
    <ScrollView style={ortak.kapsayici}>
      <Text style={ortak.baslik}>🧪 Test Modülü</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 6 }}>
        {VERI.dersler.map(d => (
          <TouchableOpacity key={d.id} onPress={() => { setSecDers(d.id); setUIdx(0); setCevaplar({}); }}
            style={[st.chip, d.id === secDers && { backgroundColor: RENK.ana }]}>
            <Text style={{ color: d.id === secDers ? '#fff' : RENK.metin, fontWeight: '700' }}>{d.ad}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        {ders.uniteler.map((u, i) => (
          <TouchableOpacity key={u.no} onPress={() => { setUIdx(i); setCevaplar({}); }}
            style={[st.chip, i === uIdx && { backgroundColor: RENK.koyu }]}>
            <Text style={{ color: i === uIdx ? '#fff' : RENK.metin, fontSize: 12 }}>
              {u.no}. Ünite ({u.soru_sayisi})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={ortak.kart}>
        <Text style={ortak.etiket}>{unite.baslik}</Text>
        <Text style={{ marginTop: 6, color: RENK.metin, fontWeight: '600' }}>
          Skor: {dogruSayisi}/{Object.keys(cevaplar).length || 0} cevaplanan
        </Text>
      </View>

      {unite.sorular.map(s => (
        <View key={s.no} style={ortak.kart}>
          <Text style={{ fontWeight: '700', color: RENK.metin, lineHeight: 20 }}>{s.no}. {s.soru}</Text>
          {['A', 'B', 'C', 'D'].map(h => {
            const secim = cevaplar[s.no];
            let renk = '#eef2f7', kalem = RENK.metin;
            if (secim) {
              if (h === s.dogru) { renk = RENK.yesil; kalem = '#fff'; }
              else if (h === secim) { renk = RENK.kirmizi; kalem = '#fff'; }
            }
            return (
              <TouchableOpacity key={h} disabled={!!secim} onPress={() => sec(s, h)}
                style={[st.sik, { backgroundColor: renk }]}>
                <Text style={{ color: kalem }}>{h}) {s[h]}</Text>
              </TouchableOpacity>
            );
          })}
          {cevaplar[s.no] && (
            <View style={st.aciklama}>
              <Text style={{ fontSize: 12, color: RENK.soluk, lineHeight: 18 }}>💡 {s.aciklama}</Text>
            </View>
          )}
        </View>
      ))}
      {unite.sorular.length === 0 && (
        <Text style={{ textAlign: 'center', color: RENK.soluk, marginTop: 30 }}>
          Bu ünitede ayıklanan soru yok. PDF'inizde şıklı sorular olmayabilir.
        </Text>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 8, marginBottom: 8 },
  sik: { padding: 10, borderRadius: 10, marginTop: 6 },
  aciklama: { backgroundColor: '#fefce8', borderRadius: 8, padding: 8, marginTop: 6 },
});
