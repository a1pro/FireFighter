import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import styles from '../screens/styles/Styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Formik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Base_url } from '../utils/ApiKey';
import { launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const AddBuilding = ({ navigation }) => {
  const [totalFloors, setTotalFloors] = useState('');
  const [totalBasements, setTotalBasements] = useState('');
  const [floorFields, setFloorFields] = useState([]);
  const [basementFields, setBasementFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [floorImages, setFloorImages] = useState({});

  // Handle total floors input change
  const handleTotalFloorsChange = value => {
    setTotalFloors(value);

    const numberOfFloors = parseInt(value, 10);
    if (numberOfFloors && numberOfFloors > 0) {
      const newFloorFields = Array.from(
        { length: numberOfFloors },
        (_, index) => index + 1,
      );
      setFloorFields(newFloorFields);
    } else {
      setFloorFields([]);
    }
  };

  // Handle total basements input change
  const handleTotalBasementsChange = value => {
    setTotalBasements(value);

    const numberOfBasements = parseInt(value, 10);
    if (numberOfBasements && numberOfBasements > 0) {
      const newBasementFields = Array.from(
        { length: numberOfBasements },
        (_, index) => index + 1,
      );
      setBasementFields(newBasementFields);
    } else {
      setBasementFields([]);
    }
  };

  // Dynamically create initialValues based on floorFields and basementFields
  const getInitialValues = () => {
    const initialValues = {
      buildingname: '',
      suitenumber: '',
      buildingaddress: '',
      totalfloors: '',
      totalbasements: '',
    };

    floorFields.forEach(floor => {
      initialValues[`floor${floor}`] = '';
      initialValues[`floorImage${floor}`] = '';
    });

    basementFields.forEach(basement => {
      initialValues[`basement${basement}`] = '';
      initialValues[`basementImage${basement}`] = '';
    });

    return initialValues;
  };

  // Dynamically create validation schema based on floorFields and basementFields
  const getValidationSchema = () => {
    let floorValidation = {};
    let basementValidation = {};

    floorFields.forEach(floor => {
      floorValidation[`floor${floor}`] = yup
        .string()
        .required(`Floor ${floor} details are required`);
    });

    basementFields.forEach(basement => {
      basementValidation[`basement${basement}`] = yup
        .string()
        .required(`Basement ${basement} details are required`);
    });

    return yup.object().shape({
      buildingname: yup.string().required('Building name is required'),
      buildingaddress: yup.string().required('Building address is required'),
      // suitenumber: yup.string().required('Suite number is required'),
      totalfloors: yup
        .string()
        .required('Total floors are required')
        .matches(/^\d+$/, 'Total floors must be a number')
        .min(1, 'Total floors must be at least 1'),
      totalbasements: yup
        .string()
        .required('Total basements are required')
        .matches(/^\d+$/, 'Total basements must be a number')
        .min(0, 'Total basements must be at least 0'),
      ...floorValidation,
      ...basementValidation,
    });
  };

  // handleSubmit function
  const handleSubmit = async values => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Create FormData to send images and data
      const formData = new FormData();
      formData.append('building_name', values.buildingname);
      formData.append('suite_number', values.suitenumber);
      formData.append('building_address', values.buildingaddress);
      formData.append('total_floor', values.totalfloors);
      formData.append('total_basement', values.totalbasements);

      floorFields.forEach(floor => {
        formData.append('floor_name[]', values[`floor${floor}`]);

        const floorImage = floorImages[`floorImage${floor}`];
        if (floorImage) {
          formData.append('floor_image[]', {
            uri: floorImage.uri,
            type: floorImage.type || 'image/jpeg',
            name: floorImage.fileName || `floor${floor}.jpg`,
          });
        } else {
          Alert.alert(`Please select an image for floor ${floor}`);
          setLoading(false);
          return;
        }
      });

      basementFields.forEach(basement => {
        formData.append('basement_name[]', values[`basement${basement}`]);

        const basementImage = floorImages[`basementImage${basement}`];
        if (basementImage) {
          formData.append('basement_image[]', {
            uri: basementImage.uri,
            type: basementImage.type || 'image/jpeg',
            name: basementImage.fileName || `basement${basement}.jpg`,
          });
        } else {
          Alert.alert(`Please select an image for basement ${basement}`);
          setLoading(false);
          return;
        }
      });

      const res = await axios({
        method: 'POST',
        url: Base_url.addbuilding,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success === true) {
        setLoading(false);
        Alert.alert(res.data.message);
        console.log(res.data.message);
        navigation.navigate('Home');
      } else {
        setLoading(false);
        Alert.alert('Error', 'Failed to add building. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  // Function to select an image for each floor or basement
  const selectImageForFloorOrBasement = (index, type) => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

    check(permission)
      .then(result => {
        if (result === RESULTS.GRANTED) {
          openImagePicker(index, type);
        } else {
          request(permission).then(result => {
            if (result === RESULTS.GRANTED) {
              openImagePicker(index, type);
            } else {
              alert('Permission denied. Cannot access photo library.');
            }
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const openImagePicker = (index, type) => {
    const options = {
      mediaType: 'photo',
      quality: 0.5,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error(response.errorMessage);
        alert('Error selecting image: ' + response.errorMessage);
      } else {
        const selectedImage = response.assets[0];

        const updatedImages = type === 'floor'
          ? { ...floorImages, [`floorImage${index}`]: selectedImage }
          : { ...floorImages, [`basementImage${index}`]: selectedImage };

        setFloorImages(updatedImages);
      }
    });
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ paddingBottom: 0, margin: 0 }}>
      <View style={[styles.container, { paddingBottom: 30, paddingTop: 30 }]}>
        <Formik
          initialValues={getInitialValues()}
          validationSchema={getValidationSchema()}
          onSubmit={handleSubmit}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={{ flex: 1 }}>
              <View style={{ flex: 3 }}>
                {/* Building Address */}
                <View style={styles.textfieldwrapper}>
                  <Text style={styles.label}>Business Address</Text>
                  <TextInput
                    placeholder="Enter building address"
                    style={styles.textfield}
                    placeholderTextColor="#BABFC5"
                    value={values.buildingaddress}
                    onChangeText={handleChange('buildingaddress')}
                    onBlur={handleBlur('buildingaddress')}
                  />
                  {touched.buildingaddress && errors.buildingaddress && (
                    <Text style={styles.errortext}>
                      {errors.buildingaddress}
                    </Text>
                  )}
                </View>
                {/* Unit/Suite Name */}
                <View style={styles.textfieldwrapper}>
                  <Text style={styles.label}>Suite/ Unit Number</Text>
                  <TextInput
                    placeholder="Enter suite/unit number"
                    style={styles.textfield}
                    placeholderTextColor="#BABFC5"
                    value={values.suitenumber}
                    onChangeText={handleChange('suitenumber')}
                    onBlur={handleBlur('suitenumber')}   

                  />
                  {/* {touched.suitenumber && errors.suitenumber && (
                    <Text style={styles.errortext}>{errors.suitenumber}</Text>
                  )} */}
                </View>
                {/* Building Name */}
                <View style={styles.textfieldwrapper}>
                  <Text style={styles.label}>Business Name</Text>
                  <TextInput
                    placeholder="Enter building name"
                    style={styles.textfield}
                    placeholderTextColor="#BABFC5"
                    value={values.buildingname}
                    onChangeText={handleChange('buildingname')}
                    onBlur={handleBlur('buildingname')}
                  />
                  {touched.buildingname && errors.buildingname && (
                    <Text style={styles.errortext}>{errors.buildingname}</Text>
                  )}
                </View>

                {/* Total Floors */}
                <View style={styles.textfieldwrapper}>
                  <Text style={styles.label}>Total Floors</Text>
                  <TextInput
                    placeholder="Enter total floors"
                    style={styles.textfield}
                    placeholderTextColor="#BABFC5"
                    value={values.totalfloors}
                    onChangeText={value => {
                      handleChange('totalfloors')(value);
                      handleTotalFloorsChange(value);
                    }}
                    onBlur={handleBlur('totalfloors')}
                    keyboardType="numeric"
                  />
                  {touched.totalfloors && errors.totalfloors && (
                    <Text style={styles.errortext}>{errors.totalfloors}</Text>
                  )}
                </View>

                {/* Dynamically render floor input fields */}
                {floorFields.map((floor, index) => (
                  <View key={index} style={styles.textfieldwrapper}>
                    <Text style={styles.label}>Floor {floor}</Text>
                    <TextInput
                      placeholder={`Enter details for floor ${floor}`}
                      style={styles.textfield}
                      placeholderTextColor="#BABFC5"
                      value={values[`floor${floor}`]}
                      onChangeText={handleChange(`floor${floor}`)}
                      onBlur={handleBlur(`floor${floor}`)}
                    />
                    {touched[`floor${floor}`] && errors[`floor${floor}`] && (
                      <Text style={styles.errortext}>{errors[`floor${floor}`]}</Text>
                    )}

                    <TouchableOpacity
                      style={styles.btn}
                      onPress={() => selectImageForFloorOrBasement(floor, 'floor')}>
                      <Text style={styles.btntxt}>
                        Upload Image for Floor {floor}
                      </Text>
                    </TouchableOpacity>

                    {floorImages[`floorImage${floor}`] && (
                      <Image
                        source={{ uri: floorImages[`floorImage${floor}`].uri }}
                        style={{ width: 100, height: 100, marginTop: 10 }}
                      />
                    )}
                  </View>
                ))}

                {/* Total Basements */}
                <View style={styles.textfieldwrapper}>
                  <Text style={styles.label}>Total Basements</Text>
                  <TextInput
                    placeholder="Enter total basements"
                    style={styles.textfield}
                    placeholderTextColor="#BABFC5"
                    value={values.totalbasements}
                    onChangeText={value => {
                      handleChange('totalbasements')(value);
                      handleTotalBasementsChange(value);
                    }}
                    onBlur={handleBlur('totalbasements')}
                    keyboardType="numeric"
                  />
                  {touched.totalbasements && errors.totalbasements && (
                    <Text style={styles.errortext}>{errors.totalbasements}</Text>
                  )}
                </View>
                

                {/* Dynamically render basement input fields */}
                {basementFields.map((basement, index) => (
                  <View key={index} style={styles.textfieldwrapper}>
                    <Text style={styles.label}>Basement {basement}</Text>
                    <TextInput
                      placeholder={`Enter details for basement ${basement}`}
                      style={styles.textfield}
                      placeholderTextColor="#BABFC5"
                      value={values[`basement${basement}`]}
                      onChangeText={handleChange(`basement${basement}`)}
                      onBlur={handleBlur(`basement${basement}`)}
                    />
                    {touched[`basement${basement}`] && errors[`basement${basement}`] && (
                      <Text style={styles.errortext}>{errors[`basement${basement}`]}</Text>
                    )}

                    <TouchableOpacity
                      style={styles.btn}
                      onPress={() => selectImageForFloorOrBasement(basement, 'basement')}>
                      <Text style={styles.btntxt}>
                        Upload Image for Basement {basement}
                      </Text>
                    </TouchableOpacity>

                    {floorImages[`basementImage${basement}`] && (
                      <Image
                        source={{ uri: floorImages[`basementImage${basement}`].uri }}
                        style={{ width: 100, height: 100, marginTop: 10 }}
                      />
                    )}
                  </View>
                ))}

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.btn, { marginTop: 10 }]}
                  onPress={handleSubmit}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.btntxt}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Back to Home */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
                onPress={() => navigation.navigate('Home')}>
                <MaterialIcons name="arrow-back" size={25} color="#000000" />
                <Text
                  style={[styles.btntxt, { color: '#000000', paddingLeft: 10 }]}>
                  Back to Home
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
};

export default AddBuilding;
