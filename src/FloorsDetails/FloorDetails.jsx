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
  const { selectedFloor, lat, lon, buildingId, floorId } = route.params;
  
  // OTP modal & data state
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpdata, setOtpData] = useState({ otp: '' });

  // State for enabling marker editing
  const [editable, setEditable] = useState(false);
  
  // State to store the currently selected category for the icon selection section
  const [selectedCategory, setSelectedCategory] = useState(null);
  // New state: track which categories are toggled off (their markers will not render)
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const [placedIcons, setPlacedIcons] = useState([]);
  const icons = useSelector(state => state.geticondata.data);

  useEffect(() => {
    dispatch(getIcon());
    // Pass floorId into handleGetIcons so we filter properly
    handleGetIcons(Number(floorId));
  }, [dispatch, buildingId, floorId]);

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
      setHiddenCategories(prev => prev.filter(cat => cat !== categoryName)); // ensure it’s visible
    } else {
      // Toggle the visibility of markers for the current category.
      if (hiddenCategories.includes(categoryName)) {
        setHiddenCategories(prev => prev.filter(cat => cat !== categoryName));
      } else {
        setHiddenCategories(prev => [...prev, categoryName]);
      }
    }
  };

  // Only update marker position if editing is enabled
  const handleDragEnd = (id, newCoordinate) => {
    if (!editable) return;
    setPlacedIcons(prevIcons => {
      return prevIcons.map(icon =>
        icon.id === id
          ? { ...icon, latitude: newCoordinate.latitude, longitude: newCoordinate.longitude }
          : icon
      );
    });
  };

  // When adding an icon from the selection area, assign it the current selected category.
  const handleIconClick = (icon) => {
    let newLatitude = Number(lat);
    let newLongitude = Number(lon);
  
    if (placedIcons.length > 0) {
      const lastIcon = placedIcons[placedIcons.length - 1];
      const offset = 0.0001; // Small offset to avoid overlap
      newLatitude = lastIcon.latitude + offset;
      newLongitude = lastIcon.longitude + offset;
    }
    
    if (!icon.icon_image_url || icon.icon_image_url.trim() === "") {
      Alert.alert("Error", "This icon does not have a valid image URL.");
      return;
    }
    
    const newIcon = {
      id: Date.now().toString(), 
      icon_id: icon.icon_id,       
      latitude: newLatitude,
      longitude: newLongitude,
      iconUrl: icon.icon_image_url,
      // Assign the current selected category to this icon so we can later toggle its visibility.
      category: selectedCategory,
    };
  
    setPlacedIcons(prev => [...prev, newIcon]);
  };

  const removeIcon = (id) => {
    setPlacedIcons(prev => prev.filter(icon => icon.id !== id));
  };

  // Fetch icons from the server and filter them to only those for the current floor.
  const handleGetIcons = async (currentFloorId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Token is missing');
        return;
      }
  
      const response = await axios.post(
        "https://firefighter.a1professionals.net/api/v1/get/drag/icon",
        {
          building_id: buildingId,
          floor_id: currentFloorId,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
  
      if (response.data.success) {
        console.log('Fetched icons from API:', response.data.data);
  
        const validIcons = response.data.data
          .filter(icon => {
            if (!icon.icon_image_url || icon.icon_image_url.trim() === "") {
              return false;
            }
            if (icon.floor_id !== undefined && icon.floor_id !== null) {
              return Number(icon.floor_id) === Number(currentFloorId);
            }
            return false;
          })
          .map(icon => ({
            id: icon.icon_id ? icon.icon_id.toString() : Date.now().toString(),
            icon_id: icon.icon_id ?? 'unknown',
            latitude: Number(icon.latitude) || 0,
            longitude: Number(icon.longitude) || 0,
            iconUrl: icon.icon_image_url,
            // Optionally assign a category if you can determine it from the data.
            // For demonstration, you might leave it empty or assign a default.
            category: '', 
          }));
  
        console.log('Valid icons for floor', currentFloorId, ':', validIcons);
        if (validIcons.length === 0) {
          console.log('No icons found for floor:', currentFloorId);
        }
        setPlacedIcons(validIcons);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch icons.');
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
      if (!buildingId || !floorId) {
        Alert.alert('Error', 'Missing required parameters: building_id or floor_id.');
        return;
      }
      if (placedIcons.length === 0) {
        Alert.alert('Error', 'No icons to save.');
        return;
      }
      const payload = {
        building_id: buildingId,
        floor_id: floorId,
        basement_id: null,
        icons: placedIcons.map(icon => ({
          icon_id: icon.icon_id,
          latitude: icon.latitude,
          longitude: icon.longitude,
        }))
      };
      console.log('Payload:', JSON.stringify(payload, null, 2));
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

  // The select icon section will show icons from the currently selected category.
  const selectedIcons = selectedCategory &&
    icons.find(category => category.category_name === selectedCategory)?.icons;

  // When Edit button is clicked, send OTP and show modal
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
      console.log('OTP send response:', res.data);
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

  // Verify OTP and enable editing
  const handleSubmit = async () => {
    try {
      console.log('Submitted OTP:', otpdata.otp);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Token is missing!');
        return;
      }
  
      const response = await axios.post(
        'https://firefighter.a1professionals.net/api/v1/drag/icon/opt/verify',
        {
          building_id: buildingId, 
          otp: otpdata.otp,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
  
      console.log('OTP Verification Response:', response.data);
  
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Floor Layout</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sidebar}>
          {icons && icons.length > 0 ? (
            icons.map(category => (
              <TouchableOpacity 
                key={category.category_name} 
                // Use the modified handleCategoryClick
                onPress={() => handleCategoryClick(category.category_name)}
              >
                <Image source={{ uri: category.category_image }} style={styles.categoryImage} />
                <Text style={styles.categoryText}>{category.category_name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>No categories available</Text>
          )}

          <TouchableOpacity onPress={uploadIconsToServer} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEditOtp} style={styles.saveButton}>
            <Text style={styles.saveText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.floorContainer}>
          <View style={styles.iconSelectionArea}>
            <Text style={styles.sectionTitle}>Select Icon</Text>
            <FlatList
            horizontal
              data={selectedIcons}
  keyExtractor={(item, index) => `${item.icon_id}-${index}`}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => handleIconClick(item)}>
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
            initialRegion={{
              latitude: Number(lat),
              longitude: Number(lon),
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            }}
          >
            <UrlTile
              urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              maximumZ={19}
              flipY={false}
            />
            {
              // Render only markers whose category is not hidden.
              placedIcons
                .filter(icon => !hiddenCategories.includes(icon.category))
                .map((icon) => (
                  <Marker
                    key={icon.id}
                    coordinate={{ latitude: icon.latitude, longitude: icon.longitude }}
                    draggable={editable}
                    onDragEnd={(e) => handleDragEnd(icon.id, e.nativeEvent.coordinate)}
                  >
                    <Image
                      source={{ uri: icon.iconUrl }}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  </Marker>
                ))
            }
          </MapView>
        </View>
      </View>

      {/* OTP Modal */}
      <Modal
        visible={otpModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setOtpModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✖</Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={styles.modalTitle}>OTP Verification</Text>
              <Text style={styles.modalSubtitle}>Building ID: {buildingId}</Text>
            </View>

            <Text style={styles.otpMessage}>
              Verification OTP sent to your registered email
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="Enter OTP"
              keyboardType="numeric"
              value={otpdata.otp.toString()}
              onChangeText={(text) => setOtpData({ ...otpdata, otp: text })}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>
                Submit OTP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEAEA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#942420',
    paddingHorizontal: 10,
  },
  backButton: { padding: 10 },
  headerText: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
  content: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 80,
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    alignItems: 'center',
  },
  categoryImage: { width: 60, height: 60, marginBottom: 5 },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#942420',
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#942420',
    borderRadius: 5,
  },
  saveText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  floorContainer: { flex: 4, padding: 10 },
  iconSelectionArea: {
    height: 120,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#942420',
  },
  iconImage: { width: 40, height: 40, resizeMode: 'contain', marginLeft: 30 },
  map: { width: '100%', height: '100%' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { width: "90%", height: "60%", backgroundColor: '#fff', padding: 20, borderRadius: 10, justifyContent: 'space-between' },
  modalCloseButton: { position: 'absolute', top: -15, right: -15, backgroundColor: 'red', width: 35, height: 35, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modalCloseText: { color: '#fff', fontSize: 18 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  modalSubtitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#942420', paddingTop: 20 },
  otpMessage: { fontSize: 16, color: 'green', fontWeight: 'bold', textAlign: 'center', marginVertical: 10, paddingTop: 20 },
  otpInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, fontSize: 16, textAlign: 'center', alignSelf: 'center', width: "80%", marginTop: 30 },
  submitButton: { backgroundColor: '#CE2127', padding: 12, borderRadius: 5, alignItems: 'center', marginTop: "auto" },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default FloorDetails;
