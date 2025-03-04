import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import StackNavigation from './src/navigation/StackNavigation';
import { Provider } from 'react-redux';
import store from './src/redux/store'


function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <SafeAreaProvider>
          <StatusBar backgroundColor="#942420" />
          <StackNavigation />
        </SafeAreaProvider>
      </NavigationContainer>
    </Provider>
  );
}
export default App;
