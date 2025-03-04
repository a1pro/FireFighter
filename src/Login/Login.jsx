import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

  //   handleSubmit furncttion
  const handleSubmit = async (values, {resetForm}) => {
    setLoading(true);
    try {
      const res = await axios({
        method: 'post',
        url: Base_url.login,
        data: {
          user_name: values.username,
          password: values.password,
        },
      });
      if (res.data.success === true) {
        setLoading(false);
        Alert.alert(res.data.message);
        const token = res.data.token;
        console.log('token', token);
        const role = res.data.data.role;
        console.log('role', role);
        if (role) {
          await AsyncStorage.setItem('role', role);
        }
        navigation.navigate('Home');
        if (token) {
          await AsyncStorage.setItem('token', token);
        }
      } else {
        setLoading(false);
        alert(res.data.message);
        console.log(res.data.message);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      if (error.response) {
        console.log('Error Response:', error.response.data);
        console.log('Error Status:', error.response.status);
        alert(error.response.data.message);
      }
    }
  };

  // Token exists, navigate to Home
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        // Token exists, navigate to Home
        navigation.navigate('Home');
      }
    };
    checkToken();
  }, [navigation]);
  return (
    <>
      <View style={styles.container}>
        <View style={{alignItems:'center'}}>
          <Text style={[styles.h1, {textAlign: 'center', paddingTop: 30,paddingBottom:20}]}>
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
            <View
              style={{flex: 1, alignItems: 'center',marginTop:50}}>
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
                      styles.textfield,
                      {flex: 1, borderWidth: 0, paddingLeft: 0, marginTop: 0},
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
                  style={{color: '#21252C', fontSize: 15, fontWeight: '400'}}>
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
                  style={{color: '#76889A', fontSize: 15, fontWeight: '400'}}>
                  Don't have an account?
                </Text>
                <TouchableOpacity
                  style={{marginLeft: 8}}
                  onPress={() => navigation.navigate('Signup')}>
                  <Text
                    style={{color: '#21252C', fontWeight: '500', fontSize: 15}}>
                    Signup
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </View>
    </>
  );
};
export default Login;
