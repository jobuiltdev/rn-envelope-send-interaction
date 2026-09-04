# Postal / 01 — Envelope Send Interaction

A standalone React Native interaction experiment that turns sending a message into a tactile, physical sequence: fold a letter, place it in an envelope, seal and stamp it, then flick it away yourself.

The experience is intentionally narrow and polished for an 8–12 second screen recording. It is not attached to another product and contains no navigation, backend, authentication, or app-specific state.

## Run it

Requirements: Node.js, npm, and Expo Go on an iOS or Android device.

```bash
npm install
npm start
```

Scan the QR code with Expo Go. The project uses only Expo SDK-compatible modules and does not require a development build.

Useful checks:

```bash
npm run typecheck
npx expo-doctor
```

## Interaction flow

1. Tap **Send message**.
2. The note folds into thirds using perspective transforms.
3. The envelope rises, the folded note enters a clipped pocket, and the flap closes.
4. A light haptic lands with the **SENT ✓** stamp.
5. Flick the sealed envelope upward and right. Distance or velocity can satisfy the send threshold; an incomplete gesture springs back.
6. A successful gesture accelerates off-screen and reveals **Delivered**.
7. Tap **Replay** to reset every animated value and record another take.

The pre-flick choreography runs in roughly 3.3 seconds. The user controls the pause before the final send, making a natural 8–12 second recording easy.

## Architecture

- `App.tsx` installs the gesture-handler root and hosts the experiment screen.
- `src/screens/SendLetterScreen.tsx` owns the phase machine, timing, gesture qualification, haptics, accessibility, reduced motion, and replay behavior.
- `src/components/Letter.tsx` renders the reusable three-panel letter and its 3D fold transforms.
- `src/components/Envelope.tsx` renders the reusable SVG envelope, clipped insertion pocket, animated flap, address, and stamp.

The screen only permits `idle → folding → packing → ready → sending → delivered`. Entry points check the current phase before acting, preventing double taps and duplicate sends. Timers are cleared on reset and unmount.

## Motion and accessibility

- Gesture success accepts either a deliberate diagonal distance or sufficiently strong upward/right velocity.
- Failed flicks use a damped spring to return to rest.
- Haptics mark sealing, failed release, send, and delivery.
- When the operating system's **Reduce Motion** setting is enabled, transforms resolve nearly instantly and the flow advances without long animation waits.
- Primary actions have accessibility labels. Assistive-technology users can double-tap the sealed envelope to trigger the same guarded send path without performing the flick.

## Recording a demo

1. Use a portrait device or simulator with notifications hidden.
2. Open the app and wait a moment on the initial frame.
3. Start recording, tap **Send message**, then pause briefly when the stamp settles.
4. Flick firmly toward the upper-right corner.
5. Hold on **Delivered** for about one second, then stop the recording.
6. Use **Replay** between takes; no reload is necessary.

A clean take is usually 8–10 seconds. For the strongest visual result, record on a physical device so the haptics influence the performer's timing even though they are not captured in the video.

## Notes

The experiment avoids Skia and custom native code. Reanimated, Gesture Handler, SVG, and Expo Haptics are all supported by Expo Go for the SDK version pinned in `package.json`.
