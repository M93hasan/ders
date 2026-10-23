import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import VERI from '../../data/dersler.json';
import { KATALOG } from '../dersKatalogu';
import { oku, K, bugun } from '../depo';
import { RENK, ortak } from '../ortak';

const ROZETLER = [
  { id: 'caylak', ad: 'Çaylak', kosul: n => n >= 10, aciklama: '10 soru çöz' },
  { id: 'caliskan', ad: 'Çalışkan', kosul: n => n >= 50, aciklama: '50 soru çöz' },
  { id: 'uzman', ad: 'Uzman', kosul: n => n >= 100, aciklama: '100 soru çöz' },
  { id: 'mukemmel', ad: 'Mükemmel Seri', kosul: (n, t) => t.odevGun >= 3, aciklama: '3 ödev tamamla' },
];

export default function AnaSayfa({ git }) {
  const [ist, setIst] = useState({ cozulen: 0, bugun: 0, odevGun: 0 });
  const [arama, setArama] = useState('');

  useEffect(() => {
    (async () => {
      const cozulen = await oku(K.COZULEN, {});
      const odevler = await oku(K.ODEV, {});
      const bugunku = Object.values(cozulen).filter(c => c.tarih === bugun()).length;
      setIst({
        cozulen: Object.keys(cozulen).length,
        bugun: bugunku,
        odevGun: Object.values(odevler).filter(Boolean).length,
      });
    })();
  }, []);

  const yuzde = Math.min(100, Math.round((ist.bugun / K.HEDEF) * 100));

  // Katalogdaki her ders icin yuklu PDF verisi var mi?
  const dersKartlari = KATALOG.map(k => {
    const yuklu = VERI.dersler.filter(d => d.id === k.id || d.id.startsWith(k.id + '_'));
    const soruSayisi = yuklu.reduce((t, d) => t + d.uniteler.reduce((a, u) => a + u.soru_sayisi, 0), 0);
    const uniteSayisi = yuklu.reduce((t, d) => t + d.uniteler.length, 0);
    return { ...k, yuklu: yuklu.length > 0, uniteSayisi, soruSayisi };
  }).filter(k => k.ad.toLocaleLowerCase('tr').includes(arama.toLocaleLowerCase('tr')));

  return (
    <ScrollView style={ortak.kapsayici}>
      <Text style={ortak.baslik}>Merhaba, Öğrenci! 👋</Text>
      <Text style={ortak.altBaslik}>Açık Öğretim Lisesi çalışma arkadaşın</Text>

      {/* Günlük ilerleme */}
      <View style={ortak.kart}>
        <Text style={ortak.etiket}>Günlük Ödev İlerlemesi</Text>
        <View style={st.ilerlemeDis}>
          <View style={[st.ilerlemeIc, { width: yuzde + '%' }]} />
        </View>
        <Text style={st.ilerlemeYazi}>Bugün {ist.bugun}/{K.HEDEF} soru çözüldü (%{yuzde})</Text>
        <Text style={st.toplam}>Toplam çözülen soru: {ist.cozulen}</Text>
      </View>

      {/* Hızlı işlemler */}
      <View style={st.grid}>
        <TouchableOpacity style={[st.hizli, { backgroundColor: RENK.ana }]} onPress={() => git('odev')}>
          <Text style={st.hizliEmoji}>📝</Text>
          <Text style={st.hizliYazi}>Günün Görevi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[st.hizli, { backgroundColor: RENK.yesil }]} onPress={() => git('kitap')}>
          <Text style={st.hizliEmoji}>📖</Text>
          <Text style={st.hizliYazi}>Akıllı Kitap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[st.hizli, { backgroundColor: RENK.kirmizi }]} onPress={() => git('yanlis')}>
          <Text style={st.hizliEmoji}>📦</Text>
          <Text style={st.hizliYazi}>Yanlış Kutusu</Text>
        </TouchableOpacity>
      </View>

      {/* Ders arama */}
      <TextInput
        style={st.arama}
        placeholder="Ders ara... (örn: tarih, matematik)"
        placeholderTextColor="#94a3b8"
        value={arama}
        onChangeText={setArama}
      />

      {/* Tüm AÖL dersleri */}
      <Text style={[ortak.etiket, { marginTop: 4 }]}>
        AÖL Dersleri ({dersKartlari.filter(d => d.yuklu).length}/{KATALOG.length} yüklü)
      </Text>
      {dersKartlari.map(d => (
        <TouchableOpacity key={d.id} style={[ortak.kart, !d.yuklu && { opacity: 0.55 }]}
          disabled={!d.yuklu}
          onPress={() => git('test', { dersId: d.id })}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[st.ikonKutu, { backgroundColor: d.renk + '22' }]}>
              <Text style={{ fontSize: 22 }}>{d.ikon}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={st.dersAd}>{d.ad}</Text>
              <Text style={st.dersBilgi}>
                {d.yuklu
                  ? `${d.uniteSayisi} ünite • ${d.soruSayisi} soru`
                  : 'PDF bekleniyor — pdf_kitaplar/ klasörüne ekleyin'}
              </Text>
            </View>
            {d.yuklu && <Text style={st.git}>Test →</Text>}
          </View>
        </TouchableOpacity>
      ))}

      {/* Rozetler */}
      <Text style={[ortak.etiket, { marginTop: 8 }]}>Rozetlerim</Text>
      <View style={ortak.kart}>
        {ROZETLER.map(r => {
          const kazanildi = r.kosul(ist.cozulen, ist);
          return (
            <View key={r.id} style={st.rozetSatir}>
              <Text style={{ fontSize: 20 }}>{kazanildi ? '🏅' : '🔒'}</Text>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={[st.rozetAd, !kazanildi && { color: RENK.soluk }]}>{r.ad}</Text>
                <Text style={st.rozetAciklama}>{r.aciklama}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  ilerlemeDis: { height: 14, backgroundColor: '#e2e8f0', borderRadius: 8, marginTop: 10, overflow: 'hidden' },
  ilerlemeIc: { height: '100%', backgroundColor: RENK.ana, borderRadius: 8 },
  ilerlemeYazi: { marginTop: 8, fontWeight: '600', color: RENK.metin },
  toplam: { marginTop: 4, fontSize: 12, color: RENK.soluk },
  grid: { flexDirection: 'row', gap: 10 },
  hizli: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  hizliEmoji: { fontSize: 28 },
  hizliYazi: { color: '#fff', fontWeight: '700', marginTop: 6, fontSize: 13 },
  arama: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 14,
    fontSize: 14, color: RENK.metin, elevation: 2 },
  ikonKutu: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dersAd: { fontSize: 16, fontWeight: '700', color: RENK.metin },
  dersBilgi: { fontSize: 12, color: RENK.soluk, marginTop: 2 },
  git: { color: RENK.ana, fontWeight: '700' },
  rozetSatir: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  rozetAd: { fontWeight: '700', color: RENK.metin },
  rozetAciklama: { fontSize: 12, color: RENK.soluk },
});
