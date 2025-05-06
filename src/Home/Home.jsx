import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import MapView, { Marker, UrlTile, Callout } from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBuilding } from '../redux/GetBuildingSlice';

const mapTypeOptions = [
  { id: 'standard', label: 'Standard' },
  { id: 'satellite', label: 'Satellite' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'terrain', label: 'Terrain' },
];

const Home = ({ navigation }) => {
  const [role, setRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const [isMapTypeModalVisible, setIsMapTypeModalVisible] = useState(false);

  const dispatch = useDispatch();
  const buildingData = useSelector(s => s.getbuildingdata.data);
  const loading      = useSelector(s => s.getbuildingdata.loading);
  const error        = useSelector(s => s.getbuildingdata.error);

  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        await dispatch(getBuilding()).unwrap();
        const storedRole = await AsyncStorage.getItem('role');
        setRole(storedRole);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [dispatch]);

  const displayList = filteredData.length ? filteredData : buildingData;

  const initialRegion = {
    latitude:  displayList[0]?.lat ? +displayList[0].lat : 37.7749,
    longitude: displayList[0]?.lon ? +displayList[0].lon : -122.4194,
    latitudeDelta:  0.01,
    longitudeDelta: 0.01,
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredData([]);
      setActiveMarkerId(null);
      mapRef.current?.animateToRegion(initialRegion, 1000);
      return;
    }
    const results = buildingData.filter(b => {
      const name = b.building_name?.toLowerCase()   || '';
      const addr = b.building_address?.toLowerCase()|| '';
      const zip  = b.zipcode?.toString()            || '';
      return (
        name.includes(searchTerm.toLowerCase()) ||
        addr.includes(searchTerm.toLowerCase()) ||
        zip.includes(searchTerm)
      );
    });
    setFilteredData(results);
    if (results[0]) {
      const target = {
        latitude:  +results[0].lat,
        longitude: +results[0].lon,
        latitudeDelta:  0.005,
        longitudeDelta: 0.005,
      };
      mapRef.current?.animateToRegion(target, 1000);
      setActiveMarkerId(results[0].id);
    } else {
      setActiveMarkerId(null);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          {/* Header / Logo */}
          <View style={styles.header}>
            <Image source={require('../assets/white-logo.png')} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search by name, address or zip"
              placeholderTextColor="#000"
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <TouchableOpacity onPress={handleSearch}>
              <MaterialIcons name="search" size={25} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Layers Button */}
        

          {/* Map */}
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            mapType={mapType}
            showsUserLocation
          >
        
            <UrlTile
              urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              maximumZ={19}
              flipY={false}
            />

            {displayList.filter(b => b.lat && b.lon).map(building => (
              <Marker
                key={building.id}
                identifier={String(building.id)}
                coordinate={{
                  latitude:  +building.lat,
                  longitude: +building.lon,
                }}
                onPress={() => setActiveMarkerId(building.id)}
              >
                <MaterialIcons name="location-pin" size={30} color="red" />
                {activeMarkerId === building.id && (
                  <Callout
                    tooltip
                    onPress={() => {
                      navigation.navigate('BuildingDetails', { buildingData: building });
                      setActiveMarkerId(null);
                    }}
                  >
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>
                        {building.building_name}
                      </Text>
                      <Text style={styles.calloutSubtitle}>
                        {building.building_address}
                      </Text>
                      <Text style={styles.calloutTap}>(Tap for details)</Text>
                    </View>
                  </Callout>
                )}
              </Marker>
            ))}
          </MapView>
          <Modal
            visible={isMapTypeModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsMapTypeModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Map Type</Text>
                <FlatList
                  data={mapTypeOptions}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.optionButton}
                      onPress={() => {
                        setMapType(item.id);
                        setIsMapTypeModalVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          item.id === mapType && styles.optionTextActive
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsMapTypeModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <TouchableOpacity
            style={styles.layersButton}
            onPress={() => setIsMapTypeModalVisible(true)}
          >
            <MaterialIcons name="layers" size={28} color="#fff" />
          </TouchableOpacity>
          {role === 'Editor' && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => navigation.navigate('AddBuilding')}
            >
              <MaterialIcons name="add" size={40} color="#202D3D" />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#202D3D' },
  loadingContainer:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText:           { color: 'red' },
  header:              { justifyContent: 'center', alignItems: 'center', backgroundColor: '#942420', padding: 10 },
  searchContainer:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 10, borderRadius: 8, padding: 8 },
  searchInput:         { flex: 1, height: 40 },
  layersButton:        { position: 'absolute', top: 150, left: 16, backgroundColor: '#942420', padding: 10, borderRadius: 25, elevation: 5 },
  map:                 { flex: 1 },
  calloutContainer:    { backgroundColor: '#fff', padding: 8, borderRadius: 6, elevation: 4, minWidth: 140 },
  calloutTitle:        { fontWeight: 'bold', color: '#333' },
  calloutSubtitle:     { color: '#666', marginTop: 4 },
  calloutTap:          { color: '#007AFF', marginTop: 6, fontSize: 12, textAlign: 'right' },
  modalOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 40 },
  modalContent:        { backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  modalTitle:          { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  optionButton:        { paddingVertical: 10 },
  optionText:          { fontSize: 16, color: '#333' },
  optionTextActive:    { color: '#942420', fontWeight: 'bold' },
  cancelButton:        { marginTop: 10, alignItems: 'center' },
  cancelText:          { color: 'red', fontSize: 16 },
  fab:                 { position: 'absolute', bottom: 16, right: 16, backgroundColor: '#D9D9D9', padding: 12, borderRadius: 30 },
});

export default Home;
