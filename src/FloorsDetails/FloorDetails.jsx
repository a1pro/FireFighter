import React, { useEffect, useState } from 'react';
import { 
  Text, TouchableOpacity, View, Image, StyleSheet, FlatList, 
  BackHandler, LayoutAnimation, UIManager, Platform, 
  Dimensions, Alert, Modal, TextInput
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getIcon } from '../redux/GetIconsSlice';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { UrlTile, Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ImageUpload from '../component/ImageUpload'; 

const { width, height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const layoutAnimation = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
};

const FloorDetails = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { selectedFloor, lat, lon, buildingId, floorId: initialFloorId,basementId } = route.params;
  // console.log('base,emt',basementId)
  const buildingData = useSelector(state => state.getbuildingdata.data);

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpdata, setOtpData] = useState({ otp: '' });
  const [editable, setEditable] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const [placedIcons, setPlacedIcons] = useState([]);
  const icons = useSelector(state => state.geticondata.data);
  
  const [mapRegion, setMapRegion] = useState({
    latitude: Number(lat),
    longitude: Number(lon),
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });
  
  const [floorModalVisible, setFloorModalVisible] = useState(false);
  const [selectedFloorData, setSelectedFloorData] = useState(selectedFloor);
  const [currentFloorId, setCurrentFloorId] = useState(initialFloorId);
  const [imageUploadVisible, setImageUploadVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const currentBuilding = buildingData.find(b => Number(b.id) === Number(buildingId));
  const floorList = currentBuilding && currentBuilding.floors ? currentBuilding.floors : [];
  
  useEffect(() => {
    dispatch(getIcon());
    handleGetIcons(Number(currentFloorId));
  }, [dispatch, buildingId, currentFloorId]);
  
  useEffect(() => {
    const backAction = () => {
      layoutAnimation();
      setPlacedIcons([]);
      navigation.navigate('Home');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);
  
  const handleCategoryClick = (categoryName) => {
    if (selectedCategory !== categoryName) {
      setSelectedCategory(categoryName);
      setHiddenCategories(prev => prev.filter(cat => cat !== categoryName));
    } else {
      if (hiddenCategories.includes(categoryName)) {
        setHiddenCategories(prev => prev.filter(cat => cat !== categoryName));
      } else {
        setHiddenCategories(prev => [...prev, categoryName]);
      }
    }
  };
  const handleDragEnd = (uid, newCoordinate) => {
    if (!editable) return;
    setPlacedIcons(prevIcons =>
      prevIcons.map(icon =>
        icon.uid === uid
          ? { ...icon, latitude: newCoordinate.latitude, longitude: newCoordinate.longitude }
          : icon
      )
    );
  };
  
  const handleIconClick = (icon) => {
    let newLatitude = Number(lat);
    let newLongitude = Number(lon);
    if (placedIcons.length > 0) {
      const lastIcon = placedIcons[placedIcons.length - 1];
      const offset = 0.0001;
      newLatitude = lastIcon.latitude + offset;
      newLongitude = lastIcon.longitude + offset;
    }
    if (!icon.icon_image_url || icon.icon_image_url.trim() === "") {
      Alert.alert("Error", "This icon does not have a valid image URL.");
      return;
    }
    const newIcon = {
      uid: Date.now().toString() + Math.random().toString(),
      icon_id: icon.icon_id,
      latitude: newLatitude,
      longitude: newLongitude,
      iconUrl: icon.icon_image_url,
      category: selectedCategory,
    };
    setPlacedIcons(prev => [...prev, newIcon]);
  };
  
  const removeIcon = (uid) => {
    setPlacedIcons(prev => prev.filter(icon => icon.uid !== uid));
  };
  const handleGetIcons = async (currentFloorId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Token is missing');
        return;
      }
      const response = await axios.post(
        "https://firefighter.a1professionals.net/api/v1/get/drag/icon",
        { building_id: buildingId, floor_id: currentFloorId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      if (response.data.success) {
        // console.log('Response data for floor', currentFloorId, response.data.data);
        const validIcons = response.data.data
          .filter(icon => {
            if (!icon.icon_image_url || icon.icon_image_url.trim() === "") return false;
            return Number(icon.floor_id) === Number(currentFloorId);
          })
          .map(icon => ({
            uid: icon.icon_id ? icon.icon_id.toString() : Date.now().toString(),
            icon_id: icon.icon_id ?? 'unknown',
            latitude: Number(icon.latitude) || 0,
            longitude: Number(icon.longitude) || 0,
            iconUrl: icon.icon_image_url,
            category: '',
          }));
        const uniqueIcons = Array.from(
          new Map(validIcons.map(icon => [icon.icon_id, icon])).values()
        );
        // console.log('Unique icons for floor', currentFloorId, ':', uniqueIcons);
        setPlacedIcons(uniqueIcons);
      }
    } catch (error) {
      console.error('API Error:', error.response ? error.response.data : error.message);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong.');
    }
  };
  const uploadIconsToServer = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Token is missing');
        return;
      }
      if (!buildingId || !currentFloorId) {
        Alert.alert('Error', 'Missing required parameters: building_id or floor_id.');
        return;
      }
      if (placedIcons.length === 0) {
        Alert.alert('Error', 'No icons to save.');
        return;
      }
      const payload = {
        building_id: buildingId,
        floor_id: currentFloorId,
        basement_id: null,
        icons: placedIcons.map(icon => ({
          icon_id: icon.icon_id,
          latitude: icon.latitude,
          longitude: icon.longitude,
        }))
      };
      const response = await axios.post(
        'https://firefighter.a1professionals.net/api/v1/drag/icon/save',
        JSON.stringify(payload),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      if (response.data.success) {
        Alert.alert('Success', 'Icons saved successfully.');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save icons.');
      }
    } catch (error) {
      console.error('API Error:', error.response ? error.response.data : error.message);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong.');
    }
  };
  const addFloorDetail = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Error', 'Token is missing');
  
      if (!buildingId || !currentFloorId) {
        return Alert.alert('Error', 'Missing building_id or floor_id.');
      }
  
      const formData = new FormData();
      formData.append('building_id', buildingId);
      formData.append('floor_id', currentFloorId);
      selectedImages.forEach((img, index) => {
        const floorName = selectedFloorData?.floor_name?.[index] || `Floor ${index + 1}`;
        const floorNumber = selectedFloorData?.floor_number?.[index] || `${index + 1}`;
        formData.append('floor_image[]', {
          uri: img.uri,
          type: img.type || 'image/jpeg',
          name: img.fileName || `floor_image_${Date.now() + index}.jpg`,
        });
        formData.append('message[]', img.caption || '');
      });
   console.log('data send from Api ',formData)
      const response = await axios.post(
        'https://firefighter.a1professionals.net/api/v1/add/floor/detail',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.data.success) {
        Alert.alert('Success', 'Floor details added successfully.');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add floor details.');
      }
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong.');
    }
  };
  
  const handleSave = async () => {
    await uploadIconsToServer();
    await addFloorDetail();
  };
  
  const handleEditOtp = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Token is missing!');
        return;
      }
      const res = await axios.post(
        'https://firefighter.a1professionals.net/api/v1/drag/icon/opt/send',
        { building_id: buildingId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      if (res.data.success) {
        Alert.alert('Success', 'OTP sent successfully.');
        setOtpData(res.data.data);
        setOtpModalVisible(true);
      } else {
        Alert.alert('Error', res.data.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('Error in handleEditOtp:', error.response ? error.response.data : error.message);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong.');
    }
  };
  
  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Token is missing!');
        return;
      }
      const response = await axios.post(
        'https://firefighter.a1professionals.net/api/v1/drag/icon/opt/verify',
        { building_id: buildingId, otp: otpdata.otp },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      if (response.data?.success) {
        Alert.alert('Success', 'OTP verified successfully');
        setOtpModalVisible(false);
        setEditable(true);
      } else {
        Alert.alert('Failed', response.data?.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      Alert.alert('Error', 'Something went wrong while verifying OTP');
    }
  };
  
  const handleSelectFloor = (floor) => {
    setSelectedFloorData(floor);
    setCurrentFloorId(floor.id);
    handleGetIcons(Number(floor.id));
    if (floor.latitude && floor.longitude) {
      setMapRegion({
        latitude: Number(floor.latitude),
        longitude: Number(floor.longitude),
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });
    }
    setFloorModalVisible(false);
  };
  const computeIconSize = () => {
    const baseDelta = 0.001;
    const baseSize = 40;
    let scale = baseDelta / mapRegion.latitudeDelta;
    let size = baseSize * scale;
    if (size < 20) size = 20;
    if (size > 50) size = 50;
    return size;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Floor Layout</Text>
        <TouchableOpacity 
          style={styles.selectFloorButton}
          onPress={() => setFloorModalVisible(true)}>
          <Text style={styles.selectFloorText}>Select Floor</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.sidebar}>
          {icons && icons.length > 0 ? (
            icons.map(category => (
              <TouchableOpacity 
                key={category.category_name}
                onPress={() => handleCategoryClick(category.category_name)}
                style={styles.categoryContainer}>
                <Image source={{ uri: category.category_image }} style={styles.categoryImage} />
                <Text style={styles.categoryText}>{category.category_name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>No categories available</Text>
          )}
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEditOtp} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setImageUploadVisible(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Image upload</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.floorContainer}>
          <View style={styles.iconSelectionArea}>
            <Text style={styles.sectionTitle}>Select Icon</Text>
            <FlatList
              horizontal
              data={
                selectedCategory
                  ? icons.find(category => category.category_name === selectedCategory)?.icons
                  : []
              }
              keyExtractor={(item, index) => `${item.icon_id}-${index}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => handleIconClick(item)} style={styles.iconButton}>
                  <Image source={{ uri: item.icon_image_url }} style={styles.iconImage} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <Text style={styles.noDataText}>Select a category to see icons</Text>
              )}
              contentContainerStyle={styles.iconList}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          <MapView 
            style={styles.map} 
            region={mapRegion}
            onRegionChangeComplete={(region) => setMapRegion(region)}
          >
            <UrlTile
              urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              maximumZ={19}
              flipY={false}
            />
            {placedIcons
              .filter(icon => !hiddenCategories.includes(icon.category))
              .map((icon, index) => (
                <Marker
                  key={`${icon.uid}-${index}`}
                  coordinate={{ latitude: icon.latitude, longitude: icon.longitude }}
                  draggable={editable}
                  onDragEnd={(e) => handleDragEnd(icon.uid, e.nativeEvent.coordinate)}>
                  <Image
                    source={{ uri: icon.iconUrl }}
                    style={[styles.markerIcon, { width: computeIconSize(), height: computeIconSize() }]}
                    resizeMode="contain"
                  />
                </Marker>
              ))
            }
          </MapView>
        </View>
      </View>
      <Modal
        visible={floorModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFloorModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.floorModalContainer}>
            <Text style={styles.modalTitle}>Select a Floor</Text>
            <FlatList
              data={floorList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity style={styles.floorItem} onPress={() => handleSelectFloor(item)}>
                  <Text style={styles.floorText}>
                    {item.floor_name ? item.floor_name : `Floor ${index + 1}`}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <Text style={styles.noDataText}>No floors available</Text>
              )}
            />
            <TouchableOpacity onPress={() => setFloorModalVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={otpModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setOtpModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.otpModalContainer}>
            <TouchableOpacity onPress={() => setOtpModalVisible(false)} style={styles.modalCloseIcon}>
              <Text style={styles.modalCloseText}>✖</Text>
            </TouchableOpacity>
            <View style={styles.otpHeader}>
              <Text style={styles.modalTitle}>OTP Verification</Text>
              <Text style={styles.modalSubtitle}>Building ID: {buildingId}</Text>
            </View>
            <Text style={styles.otpMessage}>Verification OTP sent to your registered email</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter OTP"
              keyboardType="numeric"
              value={otpdata.otp.toString()}
              onChangeText={(text) => setOtpData({ ...otpdata, otp: text })}
            />
            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Submit OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ImageUpload
        visible={imageUploadVisible}
        onClose={() => setImageUploadVisible(false)}
        onImagesSelected={(images) => {
          console.log('Selected images:', images);
          setSelectedImages(images);
        }}
      />
    </View>
  );
};
  
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#942420',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  backButton: { padding: 5 },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
  selectFloorButton: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  selectFloorText: { color: '#942420', fontWeight: '600' },
  content: { flex: 1, flexDirection: 'row' },
  sidebar: { 
    width: 90,
    backgroundColor: '#FFF',
    paddingVertical: 15,
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#DDD',
  },
  categoryContainer: { marginBottom: 15, alignItems: 'center' },
  categoryImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 5 },
  categoryText: { fontSize: 12, color: '#942420', fontWeight: '600', textAlign: 'center' },
  noDataText: { fontSize: 14, color: '#777', textAlign: 'center', marginVertical: 10 },
  saveButton: { backgroundColor: '#942420', padding: 8, borderRadius: 5, marginTop: 10, width: '80%' },
  saveButtonText: { color: '#fff', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  editButton: { backgroundColor: '#007bff', padding: 8, borderRadius: 5, marginTop: 10, width: '80%' },
  editButtonText: { color: '#fff', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  floorContainer: { flex: 1, padding: 10, backgroundColor: '#EAEAEA' },
  iconSelectionArea: { 
    height: 120,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#942420', marginBottom: 5, textAlign: 'center' },
  iconList: { paddingVertical: 5 },
  iconButton: { marginHorizontal: 5 },
  iconImage: { width: 40, height: 40 },
  map: { width: '100%', height: "100%", borderRadius: 10, overflow: 'hidden' },
  markerIcon: { /* Base styles; actual size computed inline */ },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  floorModalContainer: { 
    width: width * 0.8,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    maxHeight: height * 0.5,
  },
  floorItem: { paddingVertical: 15, borderBottomWidth: 1, borderColor: '#DDD' },
  floorText: { fontSize: 16, color: '#333' },
  modalCloseButton: { alignSelf: 'center', marginTop: 15, backgroundColor: '#942420', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 5 },
  modalCloseText: { color: '#FFF', fontSize: 16 },
  otpModalContainer: {
    width: width * 0.9,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    height: height * 0.6,
    justifyContent: 'space-between',
  },
  otpHeader: { alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#942420' },
  modalSubtitle: { fontSize: 16, marginTop: 5, textAlign: 'center', color: '#333' },
  otpMessage: { fontSize: 16, color: '#007bff', fontWeight: '600', textAlign: 'center', marginVertical: 15 },
  otpInput: { 
    borderWidth: 1, 
    borderColor: '#CCC', 
    borderRadius: 5, 
    padding: 10, 
    fontSize: 16, 
    textAlign: 'center', 
    width: '80%', 
    alignSelf: 'center',
    marginBottom: 20,
  },
  submitButton: { backgroundColor: '#CE2127', paddingVertical: 12, borderRadius: 5, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  modalCloseIcon: { 
    position: 'absolute', 
    top: -15, 
    right: -15, 
    backgroundColor: 'red', 
    width: 35, 
    height: 35, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});
export default FloorDetails;
