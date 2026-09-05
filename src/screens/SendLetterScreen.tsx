import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Envelope } from '../components/Envelope';
import { Letter } from '../components/Letter';

type Phase = 'idle' | 'folding' | 'packing' | 'ready' | 'sending' | 'delivered';
const COPY: Record<Phase, string> = { idle: 'A message worth sending', folding: 'Folding your note', packing: 'Sealing it carefully', ready: 'Flick up and right to send', sending: 'On its way', delivered: 'Delivered' };

export function SendLetterScreen() {
  const { width, height } = useWindowDimensions();
  const [phase, setPhase] = useState<Phase>('idle');
  const [reduceMotion, setReduceMotion] = useState(false);
  const phaseRef = useRef<Phase>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fold = useSharedValue(0), envelopeIn = useSharedValue(0), insert = useSharedValue(0);
  const seal = useSharedValue(0), stamp = useSharedValue(0), dragX = useSharedValue(0), dragY = useSharedValue(0);
  const sent = useSharedValue(0), complete = useSharedValue(0), guide = useSharedValue(0), dragging = useSharedValue(0);

  const updatePhase = useCallback((next: Phase) => { phaseRef.current = next; setPhase(next); }, []);
  const clearTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  const later = useCallback((fn: () => void, delay: number) => {
    timers.current.push(setTimeout(fn, reduceMotion ? Math.min(delay, 90) : delay));
  }, [reduceMotion]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { listener.remove(); clearTimers(); };
  }, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    fold.value = envelopeIn.value = insert.value = seal.value = stamp.value = 0;
    dragX.value = dragY.value = sent.value = complete.value = guide.value = dragging.value = 0;
    updatePhase('idle');
  }, [clearTimers, complete, dragX, dragY, dragging, envelopeIn, fold, guide, insert, seal, sent, stamp, updatePhase]);

  const begin = useCallback(() => {
    if (phaseRef.current !== 'idle') return;
    updatePhase('folding');
    fold.value = withTiming(1, { duration: reduceMotion ? 1 : 1050, easing: Easing.inOut(Easing.cubic) });
    later(() => { updatePhase('packing'); envelopeIn.value = withSpring(1, reduceMotion ? { duration: 1 } : { damping: 18, stiffness: 125, mass: 0.85 }); }, 900);
    later(() => { insert.value = withTiming(1, { duration: reduceMotion ? 1 : 900, easing: Easing.inOut(Easing.cubic) }); }, 1420);
    later(() => { seal.value = withTiming(1, { duration: reduceMotion ? 1 : 620, easing: Easing.inOut(Easing.cubic) }); }, 2280);
    later(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      stamp.value = withSpring(1, reduceMotion ? { duration: 1 } : { damping: 12, stiffness: 260, mass: 0.65 });
    }, 2860);
    later(() => { updatePhase('ready'); guide.value = withTiming(1, { duration: reduceMotion ? 1 : 450 }); }, 3340);
  }, [envelopeIn, fold, guide, insert, later, reduceMotion, seal, stamp, updatePhase]);

  const completeSend = useCallback(() => {
    if (phaseRef.current !== 'ready') return;
    updatePhase('sending');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sent.value = withTiming(1, { duration: reduceMotion ? 1 : 600, easing: Easing.in(Easing.cubic) });
    later(() => {
      updatePhase('delivered');
      complete.value = withTiming(1, { duration: reduceMotion ? 1 : 550 });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 570);
  }, [complete, later, reduceMotion, sent, updatePhase]);

  const canFlick = phase === 'ready';
  const pan = useMemo(() => Gesture.Pan().enabled(canFlick).activeOffsetX([-8, 8])
    .onBegin(() => { dragging.value = withTiming(1, { duration: 120 }); })
    .onUpdate((event) => { dragX.value = Math.max(-18, event.translationX); dragY.value = Math.min(18, event.translationY); })
    .onEnd((event) => {
      const farEnough = event.translationX > 72 && event.translationY < -58;
      const fastEnough = event.velocityX > 520 && event.velocityY < -520;
      if (farEnough || fastEnough) runOnJS(completeSend)();
      else { dragX.value = withSpring(0, { damping: 14, stiffness: 190 }); dragY.value = withSpring(0, { damping: 14, stiffness: 190 }); runOnJS(Haptics.selectionAsync)(); }
      dragging.value = withTiming(0, { duration: 220 });
    }), [canFlick, completeSend, dragX, dragY, dragging]);

  const sourceStyle = useAnimatedStyle(() => ({
    opacity: interpolate(insert.value, [0.5, 0.55], [1, 0]),
    transform: [
      { translateY: interpolate(insert.value, [0, 0.55], [0, 52]) },
      { scale: interpolate(insert.value, [0, 0.55], [1, 0.7]) },
    ],
  }));
  const envelopeStyle = useAnimatedStyle(() => ({ opacity: envelopeIn.value, transform: [{ translateX: dragX.value + interpolate(sent.value, [0, 1], [0, width * 1.05]) }, { translateY: interpolate(envelopeIn.value, [0, 1], [360, 0]) + dragY.value + interpolate(sent.value, [0, 1], [0, -height * 0.85]) }, { rotate: `${interpolate(dragX.value, [-20, 180], [-2, 8]) + interpolate(sent.value, [0, 1], [0, 12])}deg` }, { scale: interpolate(sent.value, [0, 1], [1, 0.72]) }] }));
  const introStyle = useAnimatedStyle(() => ({ opacity: 1 - envelopeIn.value * 0.55 }));
  const deliveredStyle = useAnimatedStyle(() => ({ opacity: complete.value, transform: [{ translateY: interpolate(complete.value, [0, 1], [14, 0]) }] }));
  const guideStyle = useAnimatedStyle(() => ({ opacity: guide.value * (1 - dragging.value) * (1 - sent.value), transform: [{ translateX: interpolate(guide.value, [0, 1], [-8, 0]) }, { translateY: interpolate(guide.value, [0, 1], [8, 0]) }] }));
  const shadowStyle = useAnimatedStyle(() => ({ opacity: interpolate(sent.value, [0, 1], [0.2, 0]) * envelopeIn.value, transform: [{ translateX: dragX.value * -0.08 }, { translateY: 24 - dragY.value * 0.05 }, { scaleX: interpolate(dragY.value, [-180, 18], [0.78, 1.04]) }, { scaleY: interpolate(dragY.value, [-180, 18], [0.7, 1]) }] }));
  const ambientStyle = useAnimatedStyle(() => ({ transform: [{ translateX: dragX.value * -0.025 }, { translateY: dragY.value * -0.02 }] }));

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.ambientOne, ambientStyle]} /><Animated.View style={[styles.ambientTwo, ambientStyle]} />
      <View style={styles.topBar}><Text style={styles.brand}>POSTAL / 01</Text><View style={styles.liveDot} /></View>
      <Animated.View style={[styles.heading, introStyle]}><Text style={styles.title}>{COPY[phase]}</Text><Text style={styles.subtitle}>{canFlick ? 'Give it a decisive gesture' : 'Made slowly. Sent quickly.'}</Text></Animated.View>
      <View style={styles.stage}>
        <Animated.View style={[styles.letterStage, sourceStyle]} pointerEvents="none"><Letter foldProgress={fold} /></Animated.View>
        <Animated.View style={[styles.surfaceShadow, shadowStyle]} pointerEvents="none" />
        {canFlick && <Animated.View style={[styles.flickGuide, guideStyle]} pointerEvents="none"><View style={styles.guideLine} /><View style={styles.guideArrow}><Text style={styles.guideArrowText}>↗</Text></View></Animated.View>}
        <GestureDetector gesture={pan}>
          <Animated.View accessible={canFlick} accessibilityRole="button" accessibilityLabel="Sealed letter, flick up and right to send" accessibilityHint="Double tap to send without a gesture" onAccessibilityTap={completeSend} style={[styles.envelopeStage, envelopeStyle]}>
            <Envelope foldProgress={fold} insertProgress={insert} sealProgress={seal} stampProgress={stamp} />
          </Animated.View>
        </GestureDetector>
        <Animated.View style={[styles.delivered, deliveredStyle]} pointerEvents="none"><View style={styles.check}><Text style={styles.checkText}>✓</Text></View><Text style={styles.deliveredTitle}>Delivered</Text><Text style={styles.deliveredCaption}>just now</Text></Animated.View>
      </View>
      <View style={styles.controls}>
        {phase === 'idle' && <Pressable accessibilityRole="button" accessibilityLabel="Send message" onPress={begin} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>Send message</Text><Text style={styles.arrow}>↗</Text></Pressable>}
        {canFlick && <Text style={styles.gestureHint}>DRAG  ·  RELEASE</Text>}
        {phase === 'delivered' && <Pressable accessibilityRole="button" accessibilityLabel="Done, reset interaction" onPress={reset} style={({ pressed }) => [styles.replayButton, pressed && styles.pressed]}><Text style={styles.replayText}>Done</Text></Pressable>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2EEE6', overflow: 'hidden' },
  ambientOne: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: '#E7D9C6', opacity: 0.48, top: -140, right: -120 }, ambientTwo: { position: 'absolute', width: 270, height: 270, borderRadius: 135, backgroundColor: '#E4CFB4', opacity: 0.22, bottom: -110, left: -90 },
  topBar: { position: 'absolute', top: 62, left: 28, right: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, brand: { color: '#85786A', fontSize: 10, fontWeight: '800', letterSpacing: 2.1 }, liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#A17150' },
  heading: { position: 'absolute', top: 112, left: 28, right: 28, alignItems: 'center' }, title: { color: '#28241F', fontFamily: 'serif', fontSize: 28, textAlign: 'center' }, subtitle: { color: '#8C8175', fontSize: 12, letterSpacing: 0.5, marginTop: 8 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 }, letterStage: { position: 'absolute', top: '24%' }, envelopeStage: { position: 'absolute', top: '43%', zIndex: 10 },
  surfaceShadow: { position: 'absolute', top: '66%', width: 286, height: 42, borderRadius: 143, backgroundColor: '#5E4734', zIndex: 2 },
  flickGuide: { position: 'absolute', top: '33%', right: 25, width: 126, height: 92, zIndex: 8, transform: [{ rotate: '-5deg' }] },
  guideLine: { position: 'absolute', left: 4, bottom: 8, width: 102, borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#A28F7E', transform: [{ rotate: '-38deg' }] },
  guideArrow: { position: 'absolute', right: 2, top: 0, width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#B7A798', backgroundColor: 'rgba(242,238,230,0.9)', alignItems: 'center', justifyContent: 'center' },
  guideArrowText: { color: '#745E4C', fontSize: 17 },
  delivered: { position: 'absolute', alignItems: 'center', top: '39%' }, check: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#2F4B3E', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, checkText: { color: '#FFFDF8', fontSize: 24, fontWeight: '700' }, deliveredTitle: { color: '#28241F', fontFamily: 'serif', fontSize: 34 }, deliveredCaption: { color: '#8C8175', fontSize: 12, marginTop: 7, letterSpacing: 0.6 },
  controls: { position: 'absolute', left: 28, right: 28, bottom: 48, minHeight: 62, alignItems: 'center', justifyContent: 'center' }, primaryButton: { width: '100%', height: 58, borderRadius: 29, backgroundColor: '#28241F', paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#28241F', shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 7 }, primaryText: { color: '#FFFDF7', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 }, arrow: { color: '#FFFDF7', fontSize: 20 },
  replayButton: { paddingHorizontal: 26, paddingVertical: 14, borderRadius: 24, borderWidth: 1, borderColor: '#B6AA9D' }, replayText: { color: '#514B44', fontSize: 14, fontWeight: '700' }, gestureHint: { color: '#86796C', fontSize: 10, fontWeight: '800', letterSpacing: 2.4 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
