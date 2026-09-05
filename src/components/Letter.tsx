import { StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

type LetterProps = { foldProgress: SharedValue<number>; compact?: boolean };

export function Letter({ foldProgress, compact = false }: LetterProps) {
  const topFoldStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateX: `${interpolate(foldProgress.value, [0, 0.5, 1], [0, 0, -168], Extrapolation.CLAMP)}deg` }],
  }));
  const bottomFoldStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateX: `${interpolate(foldProgress.value, [0, 0.42, 1], [0, 168, 168], Extrapolation.CLAMP)}deg` }],
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(foldProgress.value, [0, 1], [1, compact ? 0.86 : 0.94]) }],
  }));
  const writtenLayersStyle = useAnimatedStyle(() => ({
    opacity: interpolate(foldProgress.value, [0.992, 0.996], [1, 0], Extrapolation.CLAMP),
  }));
  const foldedBlankStyle = useAnimatedStyle(() => ({
    opacity: interpolate(foldProgress.value, [0.992, 0.996], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[styles.letter, compact && styles.compactLetter, bodyStyle]}>
      <Animated.View style={[styles.writtenLayers, writtenLayersStyle]}>
        <Animated.View style={[styles.foldPanel, styles.topPanel, topFoldStyle]}>
          <View style={[styles.foldFace, styles.topFace]}>
            <View style={styles.letterMeta}><Text style={styles.eyebrow}>A SMALL NOTE</Text><Text style={styles.date}>04 · 09 · 26</Text></View>
            <Text style={styles.salutation}>Hello Chris,</Text>
            <Text style={styles.bodyCopy}>My mother sends her regards.</Text>
          </View>
          <View style={[styles.foldFace, styles.foldBack]}><View style={styles.reversePaperMark} /></View>
        </Animated.View>
        <View style={[styles.panel, styles.middlePanel]}>
          <Text style={styles.bodyCopy}>We hope to see you again soon.</Text>
          <Text style={styles.bodyCopy}>Until then, take good care.</Text>
        </View>
        <Animated.View style={[styles.foldPanel, styles.bottomPanel, bottomFoldStyle]}>
          <View style={[styles.foldFace, styles.bottomFace]}>
            <Text style={styles.closing}>With love,</Text>
            <Text style={styles.signoff}>J.</Text>
            <View style={styles.paperMark} />
          </View>
          <View style={[styles.foldFace, styles.foldBack]}><View style={styles.reversePaperMark} /></View>
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.foldedBlank, foldedBlankStyle]} pointerEvents="none">
        <View style={styles.foldedCreaseTop} />
        <View style={styles.foldedCreaseBottom} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  letter: { width: 286, height: 354, borderRadius: 8, backgroundColor: 'transparent', shadowColor: '#3C342B', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.16, shadowRadius: 28, elevation: 10 },
  compactLetter: { shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  writtenLayers: { width: 286, height: 354 },
  panel: { height: 118, paddingHorizontal: 28, backgroundColor: '#FFFDF7', overflow: 'hidden' },
  foldPanel: { height: 118 },
  foldFace: { position: 'absolute', inset: 0, paddingHorizontal: 28, backgroundColor: '#FFFDF7', backfaceVisibility: 'hidden', overflow: 'hidden' },
  topPanel: { transformOrigin: 'bottom' },
  topFace: { borderTopLeftRadius: 8, borderTopRightRadius: 8, paddingTop: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DED8CC' },
  middlePanel: { justifyContent: 'center', gap: 9 },
  bottomPanel: { transformOrigin: 'top' },
  bottomFace: { borderBottomLeftRadius: 8, borderBottomRightRadius: 8, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#DED8CC' },
  foldBack: { backgroundColor: '#FAF5EA', transform: [{ rotateX: '180deg' }], borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2D8C9', alignItems: 'center', justifyContent: 'center' },
  reversePaperMark: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: '#E4D9C9', opacity: 0.65 },
  foldedBlank: { position: 'absolute', left: 0, top: 118, width: 286, height: 118, zIndex: 30, backgroundColor: '#FFFFFF', borderWidth: StyleSheet.hairlineWidth, borderColor: '#E8E4DD', overflow: 'hidden' },
  foldedCreaseTop: { position: 'absolute', left: 0, right: 0, top: 3, height: 1, backgroundColor: '#E6DDCF' },
  foldedCreaseBottom: { position: 'absolute', left: 0, right: 0, bottom: 3, height: 1, backgroundColor: '#E6DDCF' },
  letterMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  eyebrow: { color: '#A17C51', fontSize: 8, fontWeight: '800', letterSpacing: 1.6 },
  date: { color: '#B2A89A', fontSize: 8, letterSpacing: 0.8 },
  salutation: { color: '#2A2825', fontFamily: 'serif', fontSize: 21, fontStyle: 'italic', marginBottom: 8 },
  bodyCopy: { color: '#5A534B', fontFamily: 'serif', fontSize: 14, lineHeight: 20, letterSpacing: 0.15 },
  closing: { color: '#655D54', fontFamily: 'serif', fontSize: 13, fontStyle: 'italic' },
  signoff: { color: '#4B443D', fontFamily: 'serif', fontStyle: 'italic', fontSize: 25, marginTop: 3, transform: [{ rotate: '-5deg' }] },
  paperMark: { position: 'absolute', right: 22, bottom: 18, width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#E8DED0', opacity: 0.8 },
});
