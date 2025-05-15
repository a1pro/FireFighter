import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import MapView, {Marker, UrlTile} from 'react-native-maps';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getBuilding} from '../../redux/GetBuildingSlice';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native';

const Maps = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const buildingData = useSelector(state => state.getbuildingdata.data);
  const loading = useSelector(state => state.getbuildingdata.loading);
  const error = useSelector(state => state.getbuildingdata.error);

  useEffect(() => {
    dispatch(getBuilding());
  }, [dispatch]);

  const [mapType, setMapType] = useState('standard');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const mapTypes = [
    {id: 'standard', label: 'Standard'},
    {id: 'satellite', label: 'Satellite'},
    {id: 'hybrid', label: 'Hybrid'},
    {id: 'terrain', label: 'Terrain'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          mapType={mapType}
          initialRegion={{
            latitude: buildingData?.[0]?.lat
              ? parseFloat(buildingData[0].lat)
              : 37.7749,
            longitude: buildingData?.[0]?.lon
              ? parseFloat(buildingData[0].lon)
              : -122.4194,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}>
          <UrlTile
            urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            maximumZ={19}
            flipY={false}
          />

          {buildingData.map(building => (
            <Marker
              key={building.id}
              coordinate={{
                latitude: parseFloat(building.lat),
                longitude: parseFloat(building.lon),
              }}
              zIndex={9999}
              onPress={() => setSelectedBuilding(building)}
            />
          ))}
        </MapView>

        <TouchableOpacity
          style={styles.mapTypeButton}
          onPress={() => setModalVisible(true)}>
          <Icon name="layers" size={24} color="white" />
        </TouchableOpacity>

        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Map Type</Text>
              <FlatList
                data={mapTypes}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => setMapType(item.id)}>
                    <Text style={styles.optionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {selectedBuilding && (
          <Modal
            visible={true}
            transparent
            animationType="slide"
            onRequestClose={() => setSelectedBuilding(null)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  onPress={() => setSelectedBuilding(null)}
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
                <Text style={styles.modalTitle}>
                  {selectedBuilding.building_name}
                </Text>
                <Text>{selectedBuilding.building_address}</Text>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => {
                    setSelectedBuilding(null);
                    navigation.navigate('BuildingDetails', {
                      buildingData: selectedBuilding,
                    });
                  }}>
                  <Text style={styles.detailsButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  mapTypeButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 50,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 250,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  optionButton: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: 'red',
    fontSize: 16,
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  detailsButton: {
    marginTop: 15,
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Maps;
