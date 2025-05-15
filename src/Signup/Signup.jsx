import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
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
  firstname: yup.string().required('First name is requried'),
  lastname: yup.string().required('Last name is requried'),
  username: yup
    .string()
    .required('User name is required')
    .min(3, 'User name must be at least 3 characters')
    .max(20, 'User name must be at most 20 characters')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'User name can only contain letters, numbers, and underscores',
    ), // Alphanumeric and underscores only
  email: yup.string().email('Invalid email').required('Email is required'),
  phonenumber: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Signup = ({navigation}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  //   handleSubmit furncttion
  const handleSubmit = async (values, {resetForm}) => {
    try {
      console.log('Submitting form values:', values);
      setLoading(true);
      const res = await axios({
        method: 'post',
        url: Base_url.register,
        data: {
          first_name: values.firstname,
          last_name: values.lastname,
          user_name: values.username,
          email: values.email,
          phone_number: values.phonenumber,
          password: values.password,
          role: 'Viewer',
        },
      });
      if (res.data.success === true) {
        await AsyncStorage.setItem('email', values.email);
        setLoading(false);
        resetForm();
        alert(res.data.message);
        // navigation.navigate('Login');
        navigation.navigate('OTPScreen');
        console.log(res.data.message);
      } else {
        alert(res.data.message);
        console.log(res.data.message);
      }
    } catch (error) {
      setLoading(false);
      if (error.response) {
        console.log('Error Response:', error.response.data);
        console.log('Error Status:', error.response.status);
        alert(error.response.data.message);
      }
    }
  };

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        style={{padding: 0, margin: 0}}>
        <View style={[styles.container, {paddingBottom: 40}]}>
          <View style={{alignItems: 'center'}}>
            <Text
              style={[
                styles.h1,
                {textAlign: 'center', paddingTop: 30, paddingBottom: 20},
              ]}>
              Sign Up
            </Text>
            <Image source={require('../assets/logo.png')} />
          </View>
          <Formik
            initialValues={{
              firstname: '',
              lastname: '',
              username: '',
              email: '',
              phonenumber: '',
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
              <View style={{flex: 1, alignItems: 'center', marginTop: 30}}>
                {/* FirstName */}
                <View style={styles.textfieldwrapper}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    placeholder="Enter first name"
                    placeholderTextColor="#BABFC5"
                    style={styles.textfield}
                    onChangeText={handleChange('firstname')}
                    onBlur={handleBlur('firstname')}
                    value={values.firstname}
                  />
                  {touched.firstname && errors.firstname && (
                    <Text style={styles.errortext}>{errors.firstname}</Text>
                  )}
                </View>
                {/* LastName */}
                <View style={styles.textfieldwrapper}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    placeholder="Enter last name"
                    placeholderTextColor="#BABFC5"
                    style={styles.textfield}
                    onChangeText={handleChange('lastname')}
                    onBlur={handleBlur('lastname')}
                    value={values.lastname}
                  />
                  {touched.lastname && errors.lastname && (
                    <Text style={styles.errortext}>{errors.lastname}</Text>
                  )}
                </View>
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
                {/* Email */}
                <View style={styles.textfieldwrapper}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    placeholder="Enter email"
                    placeholderTextColor="#BABFC5"
                    style={styles.textfield}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errortext}>{errors.email}</Text>
                  )}
                </View>
                {/* PhoneNumber */}
                <View style={styles.textfieldwrapper}>
                  <Text style={styles.label}>Phone.No</Text>
                  <TextInput
                    placeholder="Enter phone number"
                    placeholderTextColor="#BABFC5"
                    keyboardType="phone-pad"
                    style={styles.textfield}
                    onChangeText={handleChange('phonenumber')}
                    onBlur={handleBlur('phonenumber')}
                    value={values.phonenumber}
                  />
                  {touched.phonenumber && errors.phonenumber && (
                    <Text style={styles.errortext}>{errors.phonenumber}</Text>
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
                {/* LoginButton */}
                <TouchableOpacity
                  style={[styles.btn, {width: '100%', marginTop: 20}]}
                  onPress={handleSubmit}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.btntxt}>Sign up</Text>
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
                    Already have an account?
                  </Text>
                  <TouchableOpacity
                    style={{marginLeft: 8}}
                    onPress={() => navigation.navigate('Login')}>
                    <Text
                      style={{
                        color: '#21252C',
                        fontWeight: '500',
                        fontSize: 15,
                      }}>
                      Signin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default Signup;
