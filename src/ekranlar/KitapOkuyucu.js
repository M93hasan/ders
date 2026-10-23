import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, useWindowDimensions } from 'react-native';
import VERI from '../../data/dersler.json';
import { RENK } from '../ortak';

export default function KitapOkuyucu() {
  const [dersId, setDersId] = useState(VERI.dersler[0].id);
  const [uIdx, setUIdx] = useState(0);
  const [gece, setGece] = useState(false);
  const [boyut, setBoyut] = useState(16);
  const { width } = useWindowDimensions();

  if (VERI.dersler.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f4f6fb', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 40 }}>📚</Text>
        <Text style={{ marginTop: 8, color: '#64748b', textAlign: 'center' }}>
          Henüz PDF eklenmedi.{'\n'}pdf_kitaplar/ klasörüne PDF koyup{'\n'}veri dönüştürücüyü çalıştırın.
        </Text>
      </View>
    );
  }
  const ders = VERI.dersler.find(d => d.id === dersId);
  const unite = ders.uniteler[uIdx];
  const t = {
    arka: gece ? '#0f172a' : '#f4f6fb', kart: gece ? '#1e293b' : '#fff',
    metin: gece ? '#e2e8f0' : '#1e293b', soluk: gece ? '#94a3b8' : '#64748b',
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.arka }}>
      {/* Ünite / ders seçici */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, padding: 10, backgroundColor: t.kart }}>
        {VERI.dersler.map(d => (
          <TouchableOpacity key={d.id} onPress={() => { setDersId(d.id); setUIdx(0); }}
            style={[st.sec, d.id === dersId && { backgroundColor: RENK.ana }]}>
            <Text style={{ color: d.id === dersId ? '#fff' : t.metin, fontWeight: '700' }}>
              {d.ad}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, paddingHorizontal: 10, paddingBottom: 8, backgroundColor: t.kart }}>
        {ders.uniteler.map((u, i) => (
          <TouchableOpacity key={u.no} onPress={() => setUIdx(i)}
            style={[st.sec, i === uIdx && { backgroundColor: RENK.koyu }]}>
            <Text style={{ color: i === uIdx ? '#fff' : t.metin, fontSize: 12 }}>
              {u.no}. {u.baslik.slice(0, 22)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, width: width }}>
        {/* Hızlı özet kartı */}
        <View style={[st.ozet, { backgroundColor: gece ? '#312e81' : '#eef2ff' }]}>
          <Text style={{ color: gece ? '#c7d2fe' : RENK.koyu, fontWeight: '800' }}>⚡ 5 Dakikada Hızlı Özet</Text>
          <Text style={{ marginTop: 6, lineHeight: 20, color: gece ? '#e0e7ff' : RENK.metin, fontSize: boyut - 2 }}>
            {unite.ozet}
          </Text>
        </View>

        <Text style={{ fontSize: boyut + 6, fontWeight: '800', color: t.metin, marginVertical: 10 }}>
          {unite.no}. Ünite: {unite.baslik}
        </Text>
        <Text style={{ fontSize: boyut, lineHeight: boyut * 1.7, color: t.metin }}>
          {unite.icerik}
        </Text>
      </ScrollView>

      {/* Alt ayar çubuğu */}
      <View style={[st.altBar, { backgroundColor: t.kart }]}>
        <TouchableOpacity onPress={() => setBoyut(b => Math.max(12, b - 2))} style={st.ayarBtn}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: t.metin }}>A-</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setBoyut(b => Math.min(28, b + 2))} style={st.ayarBtn}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: t.metin }}>A+</Text>
        </TouchableOpacity>
        <Text style={{ color: t.soluk }}>Gece Modu</Text>
        <Switch value={gece} onValueChange={setGece} trackColor={{ true: RENK.ana }} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  sec: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eef2f7', marginRight: 8 },
  ozet: { borderRadius: 14, padding: 14, marginBottom: 6 },
  altBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingVertical: 8, paddingHorizontal: 16, elevation: 8 },
  ayarBtn: { paddingHorizontal: 12, paddingVertical: 4 },
});
