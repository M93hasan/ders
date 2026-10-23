import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { oku, yaz, K, soruId, bugun } from '../depo';
import { RENK, ortak } from '../ortak';

export default function YanlisKutusu() {
  const [yanlislar, setYanlislar] = useState([]);
  const [cevaplar, setCevaplar] = useState({});

  const yukle = async () => setYanlislar(await oku(K.YANLIS, []));
  useEffect(() => { yukle(); }, []);

  const sec = async (y, harf) => {
    if (cevaplar[y.soruId]) return;
    setCevaplar(c => ({ ...c, [y.soruId]: harf }));
    if (harf === y.dogru) {
      // Doğruysa yanlış kutusundan çıkar, ilerlemeyi işaretle
      const kalan = yanlislar.filter(v => v.soruId !== y.soruId);
      setYanlislar(kalan);
      await yaz(K.YANLIS, kalan);
      const cozulen = await oku(K.COZULEN, {});
      cozulen[y.soruId] = { dogruMu: true, tekrar: true, tarih: bugun() };
      await yaz(K.COZULEN, cozulen);
    }
  };

  return (
    <ScrollView style={ortak.kapsayici}>
      <Text style={ortak.baslik}>📦 Yanlış Kutusu</Text>
      <Text style={ortak.altBaslik}>
        Zayıf noktaların burada birikir. Doğru çözünce otomatik kaldırılır!
      </Text>
      {yanlislar.length === 0 && (
        <View style={ortak.kart}>
          <Text style={{ textAlign: 'center', fontSize: 40 }}>🎊</Text>
          <Text style={{ textAlign: 'center', marginTop: 8, color: RENK.soluk }}>
            Harika! Yanlış yaptığın soru yok.
          </Text>
        </View>
      )}
      {yanlislar.map((y, i) => (
        <View key={y.soruId} style={ortak.kart}>
          <Text style={ortak.etiket}>{y.dersAd} • {y.unite}</Text>
          <Text style={{ fontWeight: '700', color: RENK.metin, marginTop: 8, lineHeight: 20 }}>
            {i + 1}. {y.soru}
          </Text>
          {['A', 'B', 'C', 'D'].map(h => {
            const secim = cevaplar[y.soruId];
            let renk = '#eef2f7', kalem = RENK.metin;
            if (secim) {
              if (h === y.dogru) { renk = RENK.yesil; kalem = '#fff'; }
              else if (h === secim) { renk = RENK.kirmizi; kalem = '#fff'; }
            }
            return (
              <TouchableOpacity key={h} disabled={!!secim} onPress={() => sec(y, h)}
                style={[st.sik, { backgroundColor: renk }]}>
                <Text style={{ color: kalem }}>{h}) {y[h]}</Text>
              </TouchableOpacity>
            );
          })}
          {cevaplar[y.soruId] && cevaplar[y.soruId] !== y.dogru && (
            <Text style={{ marginTop: 6, fontSize: 12, color: RENK.soluk }}>💡 {y.aciklama}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  sik: { padding: 10, borderRadius: 10, marginTop: 6 },
});
