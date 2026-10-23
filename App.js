import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import AnaSayfa from './src/ekranlar/AnaSayfa';
import GunlukOdev from './src/ekranlar/GunlukOdev';
import KitapOkuyucu from './src/ekranlar/KitapOkuyucu';
import TestModulu from './src/ekranlar/TestModulu';
import YanlisKutusu from './src/ekranlar/YanlisKutusu';

const SEKMELER = [
  { id: 'anasayfa', ad: 'Ana Sayfa', ikon: '🏠', renk: '#4f46e5' },
  { id: 'odev', ad: 'Ödevim', ikon: '📝', renk: '#4f46e5' },
  { id: 'kitap', ad: 'Kitap', ikon: '📖', renk: '#16a34a' },
  { id: 'test', ad: 'Test', ikon: '🧪', renk: '#dc2626' },
  { id: 'yanlis', ad: 'Yanlışlar', ikon: '📦', renk: '#f59e0b' },
];

export default function App() {
  const [ekran, setEkran] = useState('anasayfa');
  const [param, setParam] = useState({});

  const git = (id, p = {}) => { setParam(p); setEkran(id); };

  // Her ekran değişiminde yeniden mount olur -> AsyncStorage'dan taze veri okunur
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6fb' }}>
      <View style={{ flex: 1 }}>
        {ekran === 'anasayfa' && <AnaSayfa git={git} />}
        {ekran === 'odev' && <GunlukOdev key="odev" />}
        {ekran === 'kitap' && <KitapOkuyucu key="kitap" />}
        {ekran === 'test' && <TestModulu key={'test' + (param.dersId || '')} dersId={param.dersId} />}
        {ekran === 'yanlis' && <YanlisKutusu key="yanlis" />}
      </View>

      <View style={st.menu}>
        {SEKMELER.map(s => (
          <TouchableOpacity key={s.id} style={st.menuItem} onPress={() => git(s.id)}>
            <Text style={{ fontSize: 22, opacity: ekran === s.id ? 1 : 0.45 }}>{s.ikon}</Text>
            <Text style={[st.menuYazi, { color: ekran === s.id ? s.renk : '#94a3b8' }]}>{s.ad}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  menu: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: '#e2e8f0', elevation: 10 },
  menuItem: { flex: 1, alignItems: 'center' },
  menuYazi: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
