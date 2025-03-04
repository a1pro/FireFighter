import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBuilding } from '../redux/GetBuildingSlice';

const Home = ({ navigation }) => {
  const [role, setRole] = useState(null);
  const [expandedBuildingId, setExpandedBuildingId] = useState(null);
  const dispatch = useDispatch();

  // Fetching data from redux store
  const buildingData = useSelector(state => state.getbuildingdata.data);
  const loading = useSelector(state => state.getbuildingdata.loading);
  const error = useSelector(state => state.getbuildingdata.error);

  // Get role from AsyncStorage
  const getRole = async () => {
    try {
      const storedRole = await AsyncStorage.getItem('role');
      setRole(storedRole || null);
    } catch (error) {
      console.log('Error retrieving role:', error);
    }
  };

  // Fetch buildings and role on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getBuilding()).unwrap();
        await getRole();
      } catch (err) {
        console.error('Error fetching building data:', err);
      }
    };
    fetchData();
  }, [dispatch]);

  // Toggle dropdown visibility
  const handleBuildingClick = buildingId => {
    setExpandedBuildingId(expandedBuildingId === buildingId ? null : buildingId);
  };

  // Render function for FlatList
  const renderBuildingsData = ({ item }) => (
    <TouchableOpacity onPress={() => handleBuildingClick(item.id)}>
      <View style={styles.itemContainer}>
        {item.icon_image ? (
          <View style={{ width: 40, height: 40 }}>
            <Image
              source={{ uri: item.icon_image }}
              style={{ width: '100%', height: '100%', borderRadius: 100 }}
            />
          </View>
        ) : (
          <Image
            source={require('../assets/school.png')}
            style={styles.itemImage}
          />
        )}

        <Text style={[styles.itemText, { marginLeft: 10 }]}>
          {item.building_name}
        </Text>

        {role === 'Editor' && (
          <Text
            style={{
              color: item.status === '1' ? 'green' : 'red',
              fontWeight: '600',
            }}>
            {item.status === '1' ? 'Approve' : item.status === '0' ? 'Pending' : ''}
          </Text>
        )}
      </View>
      {/* Show the dropdown with floors when building is clicked */}
      {expandedBuildingId === item.id && (
        <View style={styles.floorDropdown}>
          {item.floors.map(floor => (
            <TouchableOpacity
              key={floor.id}
              onPress={() =>
                navigation.navigate('FloorDetails', {
                  floorImage: floor.floor_image,
                })
              }>
              <View style={styles.floorItem}>
                <View style={styles.floorBox}>
                  <Text style={styles.floorName}>{floor.floor_name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load data: {error}</Text>
        </View>
      ) : buildingData && buildingData.length > 0 ? (
        <FlatList
          data={buildingData}
          renderItem={renderBuildingsData}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No building details found for this user</Text>
        </View>
      )}

      {/* Role-based Add Building Action Button */}
      {role === 'Editor' && (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddBuilding')}
          style={styles.fab}>
          <MaterialIcons name="add" size={40} color="#202D3D" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202D3D',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A3B4C',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#FFFFFF',
  },
  itemImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 16,
  },
  itemText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 60,
    height: 60,
    backgroundColor: '#D9D9D9',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  floorDropdown: {
    backgroundColor: '#2A3B4C',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  floorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  floorBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorName: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
});

export default Home;