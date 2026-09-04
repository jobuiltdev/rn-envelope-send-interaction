import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SendLetterScreen } from './src/screens/SendLetterScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <SendLetterScreen />
    </GestureHandlerRootView>
  );
}
