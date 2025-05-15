import React, {useEffect, useState} from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  BackHandler,
  Alert,
  SafeAreaView,
} from 'react-native';
import styles from '../screens/styles/Styles';
import {useDispatch, useSelector} from 'react-redux';
import {getIcon} from '../redux/GetIconsSlice';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BuildingDetails = ({route}) => {
  const {buildingData} = route.params;
  const dispatch = useDispatch();
  const icons = useSelector(state => state.geticondata.data);
  const navigation = useNavigation();

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpData, setOtpData] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Home');
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    dispatch(getIcon());
  }, [dispatch]);

  const sendOtpForEditBuilding = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token');
      if (!buildingData.id) throw new Error('No building ID');

      const response = await axios.post(
        'https://firefighter.a1professionals.net/api/v1/send/building/otp',
        {building_id: String(buildingData.id)},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      if (response.data.success) {
        setOtpData(response.data.data);
        Alert.alert('Success', 'OTP sent successfully!');
        setOtpModalVisible(true);
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err.message || 'Something went wrong while sending OTP.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token');

      const res = await axios.post(
        'https://firefighter.a1professionals.net/api/v1/verify/building/otp',
        {building_id: buildingData.id, otp: otpData.otp},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      if (res.data.success) {
        Alert.alert('Success', 'OTP verified successfully!');
        setOtpModalVisible(false);
        navigation.navigate('EditBuilding', {buildingData});
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err.message || 'Something went wrong while verifying OTP.',
      );
    } finally {
      setLoading(false);
    }
  };

  const getCategoryCount = categoryName => {
    const cat = icons.find(i => i.category_name === categoryName);
    return cat ? cat.icons.length : 0;
  };

  const renderItem =
    type =>
    ({item}) =>
      (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            backgroundColor: '#fff',
            padding: 10,
            borderBottomWidth: 1,
            borderColor: '#ccc',
          }}
          onPress={() =>
            navigation.navigate('FloorDetails', {
              selectedFloor: item,
              lat: buildingData.lat,
              lon: buildingData.lon,
              buildingId: buildingData.id,
              floorId: type === 'floor' ? item.id : null,
              basementId: type === 'basement' ? item.id : null,
              floorNumber: type === 'floor' ? item.floor_number : null,
              basementNumber: type === 'basement' ? item.basement_number : null,
            })
          }>
          <Text style={{flex: 1, textAlign: 'center'}}>
            {type === 'floor' ? item.floor_number : item.basement_number}
          </Text>
          {icons.map((iconCategory, idx) => (
            <Text key={idx} style={{flex: 1, textAlign: 'center'}}>
              {getCategoryCount(iconCategory.category_name)}
            </Text>
          ))}
        </TouchableOpacity>
      );
  const renderHeader = firstColumnTitle => (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
      }}>
      <Text style={{flex: 1, fontWeight: 'bold', textAlign: 'center'}}>
        {firstColumnTitle}
      </Text>
      {icons.map((icon, i) => (
        <Text
          key={i}
          style={{flex: 1, fontWeight: 'bold', textAlign: 'center'}}>
          {icon.category_name}
        </Text>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: '#18222C'}]}>
      <View
        style={[
          styles.container,
          {backgroundColor: '#18222C', paddingHorizontal: 10},
        ]}>
        <View style={{paddingVertical: 20}}>
          <Text style={[styles.h1, {textAlign: 'center', color: '#fff'}]}>
            Business Details
          </Text>
        </View>

        <View
          style={{backgroundColor: '#942420', padding: 10, marginBottom: 20}}>
          <Text style={[styles.h1, {textAlign: 'center', color: '#fff'}]}>
            {buildingData.building_name}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginBottom: 20,
          }}>
          <TouchableOpacity
            onPress={sendOtpForEditBuilding}
            style={[
              styles.btn,
              {borderColor: '#CE2127', borderWidth: 1, width: 130},
            ]}
            disabled={loading}>
            <Text style={[styles.btntxt, {fontSize: 15}]}>
              {loading ? 'Sending...' : 'Edit Building'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Gallery', {
                id: buildingData.id,
                floor: buildingData.floors.map(f => f.id),
                basement: buildingData.basements.map(b => b.id),
              })
            }
            style={[
              styles.btn,
              {borderColor: '#CE2127', borderWidth: 1, width: 130},
            ]}>
            <Text style={[styles.btntxt, {fontSize: 15}]}>View Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* OTP Modal */}
        <Modal
          visible={otpModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setOtpModalVisible(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                width: '90%',
                padding: 20,
                backgroundColor: '#fff',
                borderRadius: 10,
              }}>
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
                  alignItems: 'center',
                }}>
                <Text style={{color: '#fff', fontSize: 18}}>✖</Text>
              </TouchableOpacity>

              <Text
                style={{fontSize: 18, fontWeight: 'bold', textAlign: 'center'}}>
                OTP Verification
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#942420',
                }}>
                {buildingData.building_name}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: 'green',
                  textAlign: 'center',
                  marginVertical: 20,
                }}>
                Verification OTP sent to your registered email
              </Text>

              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 5,
                  padding: 10,
                  fontSize: 16,
                  textAlign: 'center',
                  marginBottom: 20,
                }}
                placeholder="Enter OTP"
                keyboardType="numeric"
                value={otpData?.otp?.toString() || ''}
                onChangeText={text => setOtpData({...otpData, otp: text})}
              />

              <TouchableOpacity
                onPress={handleSubmit}
                style={{
                  backgroundColor: '#CE2127',
                  padding: 12,
                  borderRadius: 5,
                  alignItems: 'center',
                }}
                disabled={loading}>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>
                  {loading ? 'Verifying...' : 'Submit OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Floors Section */}
        {buildingData.floors.length > 0 && (
          <>
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold',
                marginVertical: 10,
              }}>
              Floors
            </Text>
            {renderHeader('Floor No.')}
            <FlatList
              data={buildingData.floors}
              keyExtractor={item => `floor-${item.id}`}
              renderItem={renderItem('floor')}
            />
          </>
        )}
        {buildingData.basements.length > 0 && (
          <>
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold',
                marginTop: 0,
                marginBottom: 10,
              }}>
              Basements
            </Text>
            {renderHeader('Basement No.')}
            <FlatList
              data={buildingData.basements}
              keyExtractor={item => `basement-${item.id}`}
              renderItem={renderItem('basement')}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BuildingDetails;
