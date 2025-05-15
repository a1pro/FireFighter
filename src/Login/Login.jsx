import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from '../screens/styles/Styles';
import {Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Formik} from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import {Base_url} from '../utils/ApiKey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const API_URL = 'http://firefighter.a1professionals.com/public/api/v1/login';

const validationSchema = yup.object().shape({
  username: yup
    .string()
    .required('User name is required')
    .min(3, 'User name must be at least 3 characters')
    .max(20, 'User name must be at most 20 characters')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'User name can only contain letters, numbers, and underscores',
    ), // Alphanumeric and underscores only
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = ({navigation}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async values => {
    setLoading(true);
    try {
      const res = await axios.post(Base_url.login, {
        user_name: values.username,
        password: values.password,
      });

      if (res.data.success) {
        const {token, data} = res.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('role', data.role || '');
        await AsyncStorage.setItem('user_data', JSON.stringify(data));
        Alert.alert('Success', res.data.message);
        navigation.replace('Home');
      } else {
        Alert.alert('Error', res.data.message || 'Login failed');
      }
    } catch (error) {
      setLoading(false);

      if (error.response) {
        Alert.alert(
          'Login Failed',
          error.response.data.message || 'Something went wrong',
        );
      } else if (error.request) {
        Alert.alert('Network Error', 'Please check your internet connection');
      } else {
        Alert.alert('Error', 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        navigation.navigate('Home');
      }
    };
    checkToken();
  }, [navigation]);
  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <View style={{alignItems: 'center'}}>
              <Text
                style={[
                  styles.h1,
                  {textAlign: 'center', paddingTop: 30, paddingBottom: 20},
                ]}>
                Sign In
              </Text>
              <Image source={require('../assets/logo.png')} />
            </View>
            <Formik
              initialValues={{
                username: '',
                password: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                resetForm,
              }) => (
                <View style={{flex: 1, alignItems: 'center', marginTop: 50}}>
                  {/* UserName */}
                  <View style={styles.textfieldwrapper}>
                    <Text style={styles.label}>User Name</Text>
                    <TextInput
                      placeholder="Enter user name"
                      placeholderTextColor="#BABFC5"
                      style={styles.textfield}
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      value={values.username}
                    />
                    {touched.username && errors.username && (
                      <Text style={styles.errortext}>{errors.username}</Text>
                    )}
                  </View>
                  {/* Password */}
                  <View style={styles.textfieldwrapper}>
                    <Text style={styles.label}>Password</Text>
                    <View
                      style={[
                        styles.textfield,
                        {flexDirection: 'row', alignItems: 'center'},
                      ]}>
                      <TextInput
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        placeholderTextColor="#BABFC5"
                        style={[
                          // styles.textfield,
                          {
                            flex: 1,
                            borderWidth: 0,
                            paddingLeft: 0,
                            marginTop: 0,
                          },
                        ]}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{marginRight: 10}}>
                        <Icon
                          name={showPassword ? 'visibility' : 'visibility-off'}
                          size={30}
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password && (
                      <Text style={styles.errortext}>{errors.password}</Text>
                    )}
                  </View>
                  {/* Forgotpassword */}
                  <TouchableOpacity
                    style={{
                      alignSelf: 'flex-end',
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                    onPress={() => navigation.navigate('Forgetpassword')}>
                    <Text
                      style={{
                        color: '#21252C',
                        fontSize: 15,
                        fontWeight: '400',
                      }}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                  {/* LoginButton */}
                  <TouchableOpacity
                    style={[styles.btn, {width: '100%', marginTop: 20}]}
                    onPress={handleSubmit}
                    disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.btntxt}>Log in</Text>
                    )}
                  </TouchableOpacity>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      marginTop: 12,
                    }}>
                    <Text
                      style={{
                        color: '#76889A',
                        fontSize: 15,
                        fontWeight: '400',
                      }}>
                      Don't have an account?
                    </Text>
                    <TouchableOpacity
                      style={{marginLeft: 8}}
                      onPress={() => navigation.navigate('Signup')}>
                      <Text
                        style={{
                          color: '#21252C',
                          fontWeight: '500',
                          fontSize: 15,
                        }}>
                        Signup
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </>
  );
};
export default Login;
