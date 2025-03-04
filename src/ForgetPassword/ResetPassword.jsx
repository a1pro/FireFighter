import React, {useState} from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Formik} from 'formik';
import * as yup from 'yup';
import styles from '../screens/styles/Styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { Base_url } from '../utils/ApiKey';

const validationSchema = yup.object().shape({
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = ({navigation, route}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {email} = route.params;

  // Handle form submission
  const handleSubmit = async values => {
    setLoading(true);
    try {
      const res = await axios({
        method: 'post',
        url: Base_url.resetpasswprd,
        data: {
          password: values.password,
          email: email,
        },
      });
      if (res.data.success === true) {
        setLoading(false);
        alert(res.data.message);
        console.log(res.data.message);
        navigation.navigate('Login');
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{
          password: '',
          confirmPassword: '',
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
        }) => (
          <View style={{flex: 1}}>
            {/* Title */}
            <View style={{paddingTop: 50, flex: 1}}>
              <Text style={[styles.h1, {textAlign: 'center'}]}>
                Set New Password
              </Text>
            </View>

            <View style={{flex: 3, justifyContent: 'center'}}>
              {/* Password */}
              <View style={styles.textfieldwrapper}>
                <Text style={styles.label}>New Password</Text>
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

              {/* Confirm Password */}
              <View style={styles.textfieldwrapper}>
                <Text style={styles.label}>Confirm Password</Text>
                <View
                  style={[
                    styles.textfield,
                    {flexDirection: 'row', alignItems: 'center'},
                  ]}>
                  <TextInput
                    placeholder="Confirm Password"
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="#BABFC5"
                    style={[
                      styles.textfield,
                      {flex: 1, borderWidth: 0, paddingLeft: 0, marginTop: 0},
                    ]}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    value={values.confirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{marginRight: 10}}>
                    <Icon
                      name={
                        showConfirmPassword ? 'visibility' : 'visibility-off'
                      }
                      size={30}
                    />
                  </TouchableOpacity>
                </View>
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errortext}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.btn, {marginTop: 20}]}
                disabled={loading}
                >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.btntxt}>Send</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Back to Login */}
            <TouchableOpacity
              style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}
              onPress={() => navigation.navigate('Login')}>
              <MaterialIcons name="arrow-back" size={25} color="#000000" />
              <Text
                style={[styles.btntxt, {color: '#000000', paddingLeft: 10}]}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
};

export default ResetPassword;
