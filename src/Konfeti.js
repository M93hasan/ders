import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const RENKLER = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#facc15'];

export default function Konfeti({ aktif }) {
  const { width } = Dimensions.get('window');
  const parcalar = useRef(
    [...Array(50)].map(() => ({
      x: Math.random() * width,
      anim: new Animated.Value(-40),
      renk: RENKLER[Math.floor(Math.random() * RENKLER.length)],
      sure: 2200 + Math.random() * 2200,
      boyut: 6 + Math.random() * 8,
    }))
  ).current;

  useEffect(() => {
    if (!aktif) return;
    parcalar.forEach(p => p.anim.setValue(-40));
    Animated.stagger(
      60,
      parcalar.map(p =>
        Animated.timing(p.anim, { toValue: 900, duration: p.sure, useNativeDriver: true })
      )
    ).start();
  }, [aktif]);

  if (!aktif) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 900, zIndex: 99 }}>
      {parcalar.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: p.x, top: 0,
          width: p.boyut, height: p.boyut * 1.6, backgroundColor: p.renk, borderRadius: 2,
          transform: [{ translateY: p.anim }, { rotate: '45deg' }],
        }} />
      ))}
    </View>
  );
}
