import axios from 'axios';
import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import styles from '../screens/styles/Styles';
import {Base_url} from '../utils/ApiKey';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ForgetPasswordOtp = ({route}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const {email} = route.params;
  console.log('email', email);

  // Create an array of refs for each OTP input
  const otpInputs = useRef([]);

  // Function to handle OTP input and focus the next input field
  const handleOtpChange = (text, index) => {
    let otpCopy = [...otp];
    otpCopy[index] = text;
    setOtp(otpCopy);

    // Automatically move to the next input field if the current one is filled
    if (text && index < otp.length - 1) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  // Function to verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');

    // Check if OTP is 4 digits
    if (otpString.length !== 4) {
      Alert.alert('Error', 'OTP must be 4 digits long.');
      return;
    }
    if (!email) {
      Alert.alert('Error', 'Email is missing.');
      return;
    }
    console.log('OTP String:', otpString);
    try {
      setLoading(true);

      // Sending request to verify OTP
      const res = await axios({
        method: 'post',
        url: Base_url.verifypasswordotp,
        data: {
          email: email,
          otp: otpString,
        },
      });

      console.log('API Response:', res.data);
      if (res.data.success=== true) {
        setLoading(false);
        Alert.alert(
          'Success',
          res.data.message || 'OTP verified successfully!',
        );
        navigation.navigate('ResetPassword', {email: email});
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
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 3}}>
        <Text style={styles.h1}>Password Reset</Text>
        <View style={styles.otpWrapper}>
          <Text style={[styles.subHeader, {paddingTop: 10, paddingBottom: 20}]}>
            We sent a code to {email}
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
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btntxt}>Verify OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {/* Back to Login */}
      <TouchableOpacity
        style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}
        onPress={() => navigation.navigate('Login')}>
        <MaterialIcons name="arrow-back" size={25} color="#000000" />
        <Text style={[styles.btntxt, {color: '#000000', paddingLeft: 10}]}>
          Back to Login
        </Text>
      </TouchableOpacity>
    </>
  );
};

export default ForgetPasswordOtp;
