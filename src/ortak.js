import { StyleSheet } from 'react-native';

export const RENK = {
  ana: '#4f46e5', koyu: '#3730a3', arka: '#f4f6fb', kart: '#ffffff',
  metin: '#1e293b', soluk: '#64748b', yesil: '#16a34a', kirmizi: '#dc2626',
  altin: '#f59e0b',
};

export const ortak = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENK.arka, padding: 16 },
  baslik: { fontSize: 22, fontWeight: '800', color: RENK.metin, marginBottom: 4 },
  altBaslik: { fontSize: 14, color: RENK.soluk, marginBottom: 14 },
  kart: { backgroundColor: RENK.kart, borderRadius: 16, padding: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  buton: { backgroundColor: RENK.ana, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  butonYazi: { color: '#fff', fontWeight: '700', fontSize: 15 },
  etiket: { fontSize: 12, fontWeight: '700', color: RENK.ana, textTransform: 'uppercase', letterSpacing: 0.5 },
});
