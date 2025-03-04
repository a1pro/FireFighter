import axios from 'axios';
import React, {useState, useRef} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import styles from '../screens/styles/Styles';
import {Base_url} from '../utils/ApiKey';

const OTPScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // Create an array of refs for each OTP input
  const otpInputs = useRef([]);

  // Function to handle OTP input and focus the next input field
  const handleOtpChange = (text, index) => {
    let otpCopy = [...otp];
    otpCopy[index] = text;
    setOtp(otpCopy);

    // Automatically move to the next input field if the current one is filled
    if (text && index < otp.length - 1) {
      // Focus on the next input field
      otpInputs.current[index + 1]?.focus();
    }
  };

  // Function to verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');

    // Check if OTP is 6 digits
    if (otpString.length !== 6) {
      Alert.alert('Error', 'OTP must be 6 digits long.');
      return;
    }

    try {
      setLoading(true);
      const email = await AsyncStorage.getItem('email');

      if (!email) {
        Alert.alert('Error', 'Email is missing.');
        return;
      }
      console.log('Email retrieved from AsyncStorage:', email);

      const response = await axios.post(Base_url.registerotp, {
        email: email,
        otp: otpString,
      });

      if (response.data.success === true) {
        setLoading(false);
        const token = response.data.token;
        Alert.alert('Success', 'OTP verified successfully!');
        navigation.navigate('Home');
        if (token) {
          await AsyncStorage.setItem('token', token);
        }
      } else {
        setLoading(false);
        Alert.alert('Error', 'Invalid OTP.');
      }
    } catch (error) {
      setLoading(false);
      console.error(
        'Error verifying OTP:',
        error.response ? error.response.data : error.message,
      );
      Alert.alert('Error', 'Failed to verify OTP. Please try again later.');
    }
  };

  return (
    <>
      <View style={{justifyContent: 'center', alignItems: 'center'}}></View>
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
        <Text style={styles.header}>Enter OTP</Text>
        <View style={styles.otpWrapper}>
          <Text style={styles.subHeader}>
            Enter OTP for email verification :
          </Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => (otpInputs.current[index] = el)}
                style={styles.otpBox}
                maxLength={1}
                keyboardType="numeric"
                value={digit}
                onChangeText={text => handleOtpChange(text, index)}
                autoFocus={index === 0}
              />
            ))}
          </View>
          <TouchableOpacity
            style={[styles.btn, {margin: 'auto', marginTop: 20}]}
            onPress={handleVerifyOtp}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btntxt}>Verify OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default OTPScreen;
