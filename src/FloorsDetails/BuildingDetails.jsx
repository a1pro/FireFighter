import React, { useEffect, useState } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  BackHandler
} from 'react-native';
import styles from '../screens/styles/Styles';
import { useDispatch, useSelector } from 'react-redux';
import { getIcon } from '../redux/GetIconsSlice';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Base_url } from '../utils/ApiKey';
import { Alert } from 'react-native';


const BuildingDetails = ({ route }) => {
  const { buildingData } = route.params;

  // console.log('dywuiwduhdeu', buildingData.floors)
  const dispatch = useDispatch();
  const icons = useSelector(state => state.geticondata.data);
  const navigation = useNavigation();

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpdata, setOtpData] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Home'); 
      return true; 
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); 
    
  }, [navigation]);
  const sendOtpForEditBuilding = async () => {
    try {
      setLoading(true);
      let token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        setLoading(false);
        return;
      }
  
      if (!buildingData?.id) {
        Alert.alert('Error', 'Building ID is missing.');
        setLoading(false);
        return;
      }
  
      console.log('Sending Request with:', { building_id: buildingData.id });
  
      const response = await axios.post(
        `https://firefighter.a1professionals.net/api/v1/send/building/otp`,
        { building_id: String(buildingData.id) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      setLoading(false);
      if (response.data.success) {
        console.log('OTP Response:', response.data.data);
        setOtpData(response.data.data); // Set the OTP data
        Alert.alert('Success', 'OTP sent successfully!');
        setOtpModalVisible(true);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error sending OTP:', error.response?.data || error.message);
      Alert.alert('Error', 'Something went wrong while sending OTP.');
    }
  };
  



  useEffect(() => {
    dispatch(getIcon());




  }, [dispatch]);


const handleSubmit=async ()=>{
  try{
    setLoading(true)
   let token=await AsyncStorage.getItem('token')
   if(!token){
    Alert.alert('Error', 'No token found. Please log in again.');
    setLoading(false);
    return;
   }

   const res = await axios.post(
    "https://firefighter.a1professionals.net/api/v1/verify/building/otp",
    {building_id:buildingData?.id,otp:otpdata?.otp},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
   )
   setLoading(false)
   if(res.data.success){
    Alert.alert('Success','Otp verify Successfully !')
    navigation.navigate('EditBuilding', { buildingData })
    setOtpModalVisible(false)
   }else{
    Alert.alert('Error',"Failed to verify otp !")
   }

  }catch(error){
    setLoading(false)
    console.error('Error verify otp')
    Alert.alert('Error', 'Something went wrong while Verify OTP.');
  }
}


  const getCategoryCount = (categoryName) => {
    const category = icons.find(item => item.category_name === categoryName);
    return category ? category.icons.length : 0;
  };

  return (
    <View style={[styles.container, { backgroundColor: '#18222C', paddingHorizontal: 10 }]}>
      <View style={{ paddingVertical: 20 }}>
        <Text style={[styles.h1, { textAlign: 'center', color: '#ffffff' }]}>
          Business Details
        </Text>
      </View>

      {/* Building Name */}
      <View style={{ backgroundColor: '#942420', padding: 10, marginBottom: 20 }}>
        <Text style={[styles.h1, { textAlign: 'center', color: '#ffffff' }]}>
          {buildingData.building_name}
        </Text>
      </View>

      {/* Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 20 }}>
        <TouchableOpacity
          onPress={sendOtpForEditBuilding}
          style={[styles.btn, { borderColor: '#CE2127', borderWidth: 1, width: 130, padding: 10 }]}
          disabled={loading} // Disable button while sending OTP
        >
          <Text style={[styles.btntxt, { fontSize: 15 }]}>
            {loading ? 'Sending...' : 'Edit Building'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Gallery', { id: buildingData.id })}
          style={[styles.btn, { borderColor: '#CE2127', borderWidth: 1, width: 130, padding: 10 }]}
        >
          <Text style={[styles.btntxt, { fontSize: 15 }]}>View Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        visible={otpModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)'
        }}>
          <View style={{
            width: "90%",
            height: "60%",
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 10,
            position: 'relative',
            justifyContent: 'space-between'
          }}>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setOtpModalVisible(false)}
              style={{
                position: 'absolute',
                top: -15,
                right: -15,
                backgroundColor: 'red',
                width: 35,
                height: 35,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff', fontSize: 18 }}>✖</Text>
            </TouchableOpacity>

            {/* OTP Title */}
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                OTP Verification
              </Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#942420', paddingTop: 20 }}>
                {buildingData.building_name}
              </Text>
            </View>

            {/* OTP Message */}
            <Text style={{ fontSize: 16, color: 'green', fontWeight: 'bold', textAlign: 'center', marginVertical: 10, paddingTop: 20 }}>
              Verification OTP sent to your registered email
            </Text>

            {/* OTP Input */}
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,
                padding: 10,
                fontSize: 16,
                textAlign: 'center',
                alignSelf: 'center',
                width: "80%",
                marginTop: 30
              }}
              placeholder="Enter OTP"
              keyboardType="numeric"
              value={otpdata?.otp?.toString() || ''} 
              onChangeText={(text) => setOtpData({ ...otpdata, otp: text })} // Allow manual edit if needed
            />


            {/* Submit OTP */}
            <TouchableOpacity
              onPress={() =>handleSubmit()}
              style={{
                backgroundColor: '#CE2127',
                padding: 12,
                borderRadius: 5,
                alignItems: 'center',
                marginTop: "auto"
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                Submit OTP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Table Header */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc'
      }}>
        <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Floor</Text>
        {icons.map((icon, index) => (
          <Text key={index} style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>
            {icon.category_name}
          </Text>
        ))}
      </View>

      {/* Table Data */}
      <FlatList
        data={buildingData.floors}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              backgroundColor: '#ffffff',
              padding: 10,
              borderBottomWidth: 1,
              borderColor: '#ccc'
            }}
            
            onPress={() => navigation.navigate('FloorDetails', { selectedFloor: item,  lat: buildingData.lat, 
              lon: buildingData.lon ,buildingId: buildingData.id,floorId: item.id, })}
          >
            <Text style={{ flex: 1, textAlign: 'center' }}>{item.floor_name}</Text>
            {icons.map((iconCategory, idx) => (
              <Text key={idx} style={{ flex: 1, textAlign: 'center' }}>
                {getCategoryCount(iconCategory.category_name)}
              </Text>
            ))}
          </TouchableOpacity>
        )}
      />

      {/* No Data Case */}
      {(!buildingData.floors || buildingData.floors.length === 0) && (
        <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
          No floors available
        </Text>
      )}
    </View>
  );
};

export default BuildingDetails;
