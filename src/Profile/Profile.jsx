import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import styles from '../screens/styles/Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const validationSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phonenumber: yup.string().required('Phone number is required'),
  zipcode: yup.string().required('Zip code is required'),
});

const Profile = ({ navigation }) => {
  const [profilePic, setProfilePic] = useState('');
  const [initialValues, setInitialValues] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phonenumber: '',
    zipcode: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      const json = await AsyncStorage.getItem('user_data');
      if (json) {
        const data = JSON.parse(json);
        setInitialValues({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          username: data.user_name || '',
          email: data.email || '',
          phonenumber: data.phone_number || '',
          zipcode: data.zipcode || '',
        });
        if (data.profile_image) setProfilePic(data.profile_image);
      }
    };
    loadUserData();
  }, []);

  const handleSubmit = async values => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      const formData = new FormData();
      formData.append('zipcode', values.zipcode);
      formData.append('first_name', values.first_name);
      formData.append('last_name', values.last_name);
      formData.append('phone_number', values.phonenumber);
      formData.append('user_name', values.username);

      if (profilePic && !profilePic.startsWith('http')) {
        const filename = profilePic.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        formData.append('profile_image', {
          uri: profilePic,
          name: filename,
          type,
        });
      }

      const response = await axios.post(
        'https://firefighter.a1professionals.net/api/v1/update/profile',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', response.data.message);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.data));
      } else {
        Alert.alert('Error', response.data.message || 'Update failed.');
      }
    } catch (error) {
      console.log('API Error:', error.response?.data || error.message);
      Alert.alert('Error', 'Something went wrong while updating profile.');
    }
  };

  const handleLogout = async () => {
    try {
      Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.navigate('Login');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Logout Error', 'Something went wrong while logging out.');
    }
  };

  const handleEditProfileImage = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () =>
            launchCamera({}, response => {
              if (response.assets?.length > 0) {
                setProfilePic(response.assets[0].uri);
              }
            }),
        },
        {
          text: 'Gallery',
          onPress: () =>
            launchImageLibrary({}, response => {
              if (response.assets?.length > 0) {
                setProfilePic(response.assets[0].uri);
              }
            }),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      <View style={{ alignItems: 'center', backgroundColor: '#942420' }}>
        <Text style={styles.h3}>Profile</Text>
        <View style={{ position: 'relative' }}>
          <Image
            source={
              profilePic
                ? { uri: profilePic }
                : require('../assets/dummy-user-profile.png')
            }
            style={{
              width: 120,
              height: 120,
              marginTop: 30,
              marginBottom: 10,
              borderRadius: 20,
            }}
          />
          <TouchableOpacity
            style={styles.editIcon}
            onPress={handleEditProfileImage}>
            <Icon name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Formik
            enableReinitialize
            initialValues={initialValues}
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
              <View style={{ flex: 1, alignItems: 'center', marginTop: 30 }}>
                {[
                  { name: 'first_name', label: 'First Name', placeholder: 'Enter first name' },
                  { name: 'last_name', label: 'Last Name', placeholder: 'Enter last name' },
                  { name: 'username', label: 'User Name', placeholder: 'Enter user name' },
                  { name: 'email', label: 'Email', placeholder: 'Enter email', editable: false },
                  { name: 'phonenumber', label: 'Phone No', placeholder: 'Enter phone number', keyboardType: 'phone-pad' },
                  { name: 'zipcode', label: 'Zip Code', placeholder: 'Enter zip code' },
                ].map(field => (
                  <View key={field.name} style={styles.textfieldwrapper}>
                    <Text style={styles.label}>{field.label}</Text>
                    <TextInput
                      placeholder={field.placeholder}
                      style={styles.textfield}
                      onChangeText={handleChange(field.name)}
                      onBlur={handleBlur(field.name)}
                      value={values[field.name]}
                      editable={field.editable !== false}
                      keyboardType={field.keyboardType || 'default'}
                    />
                    {touched[field.name] && errors[field.name] && (
                      <Text style={styles.errortext}>{errors[field.name]}</Text>
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.btn, { width: '100%', marginTop: 20, marginBottom: 20 }]}
                  onPress={handleSubmit}>
                  <Text style={styles.btntxt}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, { width: '100%', marginTop: 10, marginBottom: 20 }]} onPress={handleLogout}>
                  <Text style={styles.btntxt}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </>
  );
};

export default Profile;
