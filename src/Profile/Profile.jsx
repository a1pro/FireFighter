import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import styles from '../screens/styles/Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Formik} from 'formik';
import * as yup from 'yup';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const validationSchema = yup.object().shape({
  username: yup
    .string()
    .required('User name is required')
    .min(3, 'User name must be at least 3 characters')
    .max(20, 'User name must be at most 20 characters')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'User name can only contain letters, numbers, and underscores',
    ),
  email: yup.string().email('Invalid email').required('Email is required'),
  phonenumber: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
});

const Profile = ({navigation}) => {
  const [profilePic, setProfilePic] = useState(''); // Store the image URI here

  const handleSubmit = async values => {
    console.log('Form values:', values);
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              navigation.navigate('Login');
            } catch (error) {
              console.log('Logout error', error);
              Alert.alert(
                'Logout Error',
                'Something went wrong while logging out.',
              );
            }
          },
        },
      ]);
    } catch (error) {
      console.log('Logout error', error);
      Alert.alert('Logout Error', 'Something went wrong while logging out.');
    }
  };

  // Handle profile image change (Camera or Gallery)
  const handleEditProfileImage = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () =>
            launchCamera({}, response => {
              if (response.assets && response.assets.length > 0) {
                const selectedImage = response.assets[0];
                setProfilePic(selectedImage.uri); // Update the state with the selected image URI
              }
            }),
        },
        {
          text: 'Gallery',
          onPress: () =>
            launchImageLibrary({}, response => {
              if (response.assets && response.assets.length > 0) {
                const selectedImage = response.assets[0];
                setProfilePic(selectedImage.uri); // Update the state with the selected image URI
              }
            }),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  return (
    <>
      <View style={{alignItems: 'center', backgroundColor: '#942420'}}>
        <Text style={styles.h3}>Profile</Text>
        <View style={{position: 'relative'}}>
          <Image
            source={
              profilePic
                ? {uri: profilePic}
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
      <View style={styles.container}>
        <Formik
          initialValues={{
            username: '',
            email: '',
            phonenumber: '',
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
            <View style={{flex: 1, alignItems: 'center', marginTop: 30}}>
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

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.btn, {width: '100%', marginTop: 20}]}
                onPress={handleSubmit}>
                <Text style={styles.btntxt}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        {/* Logout Button */}
        <TouchableOpacity style={styles.btn} onPress={handleLogout}>
          <Text style={styles.btntxt}>Logout</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default Profile;
