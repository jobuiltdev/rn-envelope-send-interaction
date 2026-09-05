import { StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Letter } from './Letter';

type EnvelopeProps = { foldProgress: SharedValue<number>; insertProgress: SharedValue<number>; sealProgress: SharedValue<number>; stampProgress: SharedValue<number> };
export const ENVELOPE_WIDTH = 326;
export const ENVELOPE_HEIGHT = 218;

export function Envelope({ foldProgress, insertProgress, sealProgress, stampProgress }: EnvelopeProps) {
  const letterStyle = useAnimatedStyle(() => ({
    opacity: interpolate(insertProgress.value, [0.6, 0.61], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateX: -143 }, { translateY: interpolate(insertProgress.value, [0.61, 1], [16, 110], Extrapolation.CLAMP) }, { scale: interpolate(insertProgress.value, [0.61, 1], [0.7, 0.67], Extrapolation.CLAMP) }],
  }));
  const flapStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateX: `${interpolate(sealProgress.value, [0, 1], [178, 0], Extrapolation.CLAMP)}deg` }],
    zIndex: sealProgress.value > 0.55 ? 8 : 1,
  }));
  const stampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(stampProgress.value, [0, 0.35], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(stampProgress.value, [0, 1], [-28, 0]) }, { rotate: `${interpolate(stampProgress.value, [0, 1], [-9, -4])}deg` }, { scale: interpolate(stampProgress.value, [0, 0.7, 1], [1.45, 0.93, 1]) }],
  }));

  return (
    <View style={styles.shell} pointerEvents="none">
      <View style={styles.back} />
      <Animated.View style={[styles.insertClip, letterStyle]}><Letter foldProgress={foldProgress} compact /></Animated.View>
      <Animated.View style={[styles.flap, flapStyle]}>
        <Svg width={ENVELOPE_WIDTH} height={124} viewBox={`0 0 ${ENVELOPE_WIDTH} 124`}>
          <Path d={`M 0 0 L ${ENVELOPE_WIDTH / 2} 124 L ${ENVELOPE_WIDTH} 0 Z`} fill="#E9CBAA" />
          <Path d={`M 0 1 L ${ENVELOPE_WIDTH / 2} 123 L ${ENVELOPE_WIDTH} 1`} fill="none" stroke="#D8B58E" strokeWidth="2" />
        </Svg>
      </Animated.View>
      <View style={styles.frontFace}>
        <Svg width={ENVELOPE_WIDTH} height={ENVELOPE_HEIGHT} viewBox={`0 0 ${ENVELOPE_WIDTH} ${ENVELOPE_HEIGHT}`}>
          <Path d={`M 0 0 L ${ENVELOPE_WIDTH / 2} 121 L ${ENVELOPE_WIDTH} 0 L ${ENVELOPE_WIDTH} ${ENVELOPE_HEIGHT} L 0 ${ENVELOPE_HEIGHT} Z`} fill="#F2D6B8" />
          <Path d={`M 0 ${ENVELOPE_HEIGHT} L 122 104 Q ${ENVELOPE_WIDTH / 2} 78 204 104 L ${ENVELOPE_WIDTH} ${ENVELOPE_HEIGHT} Z`} fill="#F7DFC5" />
          <Path d={`M 0 ${ENVELOPE_HEIGHT} L 121 105 M ${ENVELOPE_WIDTH} ${ENVELOPE_HEIGHT} L 205 105`} fill="none" stroke="#DDBD9C" strokeWidth="2" />
        </Svg>
      </View>
      <View style={styles.address}><Text style={styles.to}>TO</Text><Text style={styles.name}>Chris</Text><View style={styles.addressLine} /></View>
      <Animated.View style={[styles.stamp, stampStyle]}><Text style={styles.stampText}>SENT ✓</Text></Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { width: ENVELOPE_WIDTH, height: ENVELOPE_HEIGHT, shadowColor: '#523821', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 13 },
  back: { position: 'absolute', inset: 0, backgroundColor: '#E8C7A5', borderRadius: 8 },
  insertClip: { position: 'absolute', left: ENVELOPE_WIDTH / 2, top: -100, width: 286, height: 278, overflow: 'hidden', zIndex: 2 },
  flap: { position: 'absolute', left: 0, top: 0, width: ENVELOPE_WIDTH, height: 124, transformOrigin: 'top' },
  frontFace: { position: 'absolute', inset: 0, zIndex: 4, overflow: 'hidden', borderRadius: 8 },
  address: { position: 'absolute', left: 32, bottom: 42, zIndex: 6 },
  to: { color: '#A67C57', fontSize: 8, fontWeight: '800', letterSpacing: 1.8, marginBottom: 3 },
  name: { color: '#765A42', fontFamily: 'serif', fontSize: 18 },
  addressLine: { width: 72, height: 1, backgroundColor: '#C9A886', marginTop: 6 },
  stamp: { position: 'absolute', right: 28, bottom: 38, zIndex: 10, borderWidth: 2, borderColor: '#8D4A42', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 7 },
  stampText: { color: '#8D4A42', fontSize: 12, fontWeight: '900', letterSpacing: 1.4 },
});
