import React, { useState } from 'react';
import {Text, TextInput, View, TouchableOpacity} from 'react-native';
import {Formik} from 'formik';
import * as yup from 'yup';
import styles from '../screens/styles/Styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { Base_url } from '../utils/ApiKey';
import { ActivityIndicator } from 'react-native';

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
});

const ForgetPassword = ({navigation}) => {

  const [loading,setLoading] = useState(false);
  // Handle form submission
  const handleSubmit = async(values)=>{
    setLoading(true);
    try {
      const res = await axios({
        method:'post',
        url:Base_url.passwordotp,
        data:{
          email:values.email
        }
      })
      if(res.data.success === true){
        setLoading(false);
        alert('OTP sent to your email');
        console.log(res.data.message);
        console.log(res.data.data);
        navigation.navigate('ForgetPasswordOtp',{email:values.email})
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{
          email: '',
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
          <View style={{flex:1}}>
            {/* Title */}
            <View style={{paddingTop:50,flex:1}}>
              <Text style={[styles.h1, {textAlign: 'center'}]}>
                Forget Password
              </Text>
              <Text
                style={[styles.text, {textAlign: 'center', marginTop: 10}]}>
                No worries, we'll send you reset instructions
              </Text>
            </View>

           <View style={{flex:3,justifyContent:'center'}}>
             {/* Email Input */}
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

            {/* Submit Button */}
            <TouchableOpacity onPress={handleSubmit} style={[styles.btn,{marginTop:20}]}
            disabled={loading}
            >
              {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.btntxt}>Send</Text>
                )}
              
            </TouchableOpacity>
           </View>
           {/* BackTo Login */}
           <TouchableOpacity style={{flex:1,flexDirection:'row',justifyContent:'center'}} onPress={()=>navigation.navigate('Login')}>
           <MaterialIcons name="arrow-back" size={25} color="#000000" />
            <Text style={[styles.btntxt,{color:'#000000',paddingLeft:10}]}>Back to Login</Text>
           </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
};

export default ForgetPassword;
