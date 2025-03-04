import { Image, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import styles from './styles/Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        // Token exists, navigate to Home
        navigation.navigate('Home');
      } else {
        // No token, navigate to Login
        navigation.navigate('Login');
      }
    };
    checkToken();
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={require('../assets/logo.png')}/>
        <Text style={{ fontSize: 40, color: '#000', fontWeight: '600' }}>
          FireFighter
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.btntxt}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SplashScreen;
