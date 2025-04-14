// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   Image,
//   StyleSheet,
//   ActivityIndicator,
//   TextInput,
// } from 'react-native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { useDispatch, useSelector } from 'react-redux';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getBuilding } from '../redux/GetBuildingSlice';
// import axios from 'axios';

// const Home = ({ navigation }) => {
//   const [role, setRole] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredData, setFilteredData] = useState([]);
//   const dispatch = useDispatch();

//   // Fetching data from redux store
//   const buildingData = useSelector(state => state.getbuildingdata.data);
//   const loading = useSelector(state => state.getbuildingdata.loading);
//   const error = useSelector(state => state.getbuildingdata.error);

//   // Get role from AsyncStorage
//   const getRole = async () => {
//     try {
//       const storedRole = await AsyncStorage.getItem('role');
//       setRole(storedRole || null);
//     } catch (error) {
//       console.log('Error retrieving role:', error);
//     }
//   };

//   // Fetch buildings and role on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         await dispatch(getBuilding()).unwrap();
//         await getRole();
//       } catch (err) {
//         console.error('Error fetching building data:', err);
//       }
//     };
//     fetchData();
//   }, [dispatch]);


//   // Function to handle search input and update filtered data
//   const handleSearch = async (search) => {
//     const token = await AsyncStorage.getItem('token');
//     console.log('yyfyf',token)
//     if (!token) {
//       console.error('No token found');
//       return;
//     }

//     setSearchTerm(search); // Update search term state

//     if (search.trim() === '') {
//       // If the search term is empty, reset the filtered data to the full building data
//       setFilteredData(buildingData);  // Reset to original data (without making API request)
//     } else {
//       // Make a POST request with authentication headers
//       try {
//         const response = await axios.post(
//           'https://firefighter.a1professionals.net/api/v1/search/building',
//           { search: search }, // Sending search term in the body as a key-value pair
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         // Update filtered data with search results
//         setFilteredData(response.data.data || []);
//       } catch (error) {
//         console.error('Error fetching search data:', error);
//         setFilteredData([]);  // Reset filtered data if error occurs
//       }
//     }
//   };




//   // Render function for FlatList
//   const renderBuildingsData = ({ item }) => (
//     <TouchableOpacity
//       onPress={() => navigation.navigate('BuildingDetails', { buildingData: item })}>
//       <View style={styles.itemContainer}>
//         {/* {item.icon_image ? (
//           <View
//             style={{
//               width: 50,
//               height: 50,
//               borderWidth: 3,
//               borderColor: '#942420',
//               borderRadius: 10,
//               margin: 4,
//             }}>
//             <Image
//               source={{ uri: item.icon_image }}
//               style={{ width: '100%', height: '100%', borderRadius: 10 }}
//             />
//           </View>
//         ) : (
//           <Image
//             source={require('../assets/school.png')}
//             style={styles.itemImage}
//           />
//         )} */}

//         <Text style={[styles.itemText, { marginLeft: 10 }]}>
//           {item.building_address}
//         </Text>

//         {role === 'Editor' && (
//           <View
//             style={{
//               backgroundColor: item.status === '1' ? 'green' : '#CE2127',
//               borderRadius: 10,
//               padding: 7,
//             }}>
//             <Text
//               style={{
//                 color: item.status === '1' ? '#ffff' : '#ffff',
//                 fontWeight: '600',
//               }}>
//               {item.status === '1'
//                 ? 'Approve'
//                 : item.status === '0'
//                   ? 'Pending'
//                   : ''}
//             </Text>
//           </View>
//         )}
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#ffffff" />
//         </View>
//       ) : error ? (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>Failed to load data: {error}</Text>
//         </View>
//       ) : buildingData && buildingData.length > 0 ? (
//         <>
//           <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#942420', padding: 10 }}>
//             <Image source={require('../assets/white-logo.png')} />
//           </View>
//           {/* Search */}
//           <View style={[styles.textfield, { flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }]}>
//             <TextInput
//               placeholder="Search"
//               placeholderTextColor="#000"
//               value={searchTerm}
//               onChangeText={handleSearch}  // Update search term on text change
//               style={{ flex: 1 }}
//             />
//             <MaterialIcons name="search" size={25} color="#000000" />
//           </View>
//           <View
//             style={{
//               backgroundColor: '#18222C',
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               paddingVertical: 10,
//               paddingHorizontal: 10,
//             }}>
//             {/* <Text style={[styles.itemText, { color: '#ffff', textAlign: 'auto', fontSize: 15 }]}>
//               Layout
//             </Text> */}
//             <Text style={[styles.itemText, { color: '#ffff', textAlign: 'left', fontSize: 15 }]}>
//               Business Address
//             </Text>
//             <Text style={[styles.itemText, { color: '#ffff', textAlign: 'right', fontSize: 15 }]}>
//               Status
//             </Text>
//           </View>
//           <FlatList
//             data={filteredData.length > 0 ? filteredData : buildingData}  // Use filtered data if search results are available
//             renderItem={renderBuildingsData}
//             keyExtractor={item => item.id.toString()}
//             contentContainerStyle={styles.listContainer}
//           />
//         </>
//       ) : (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>No building details found for this user</Text>
//         </View>
//       )}

//       {/* Role-based Add Building Action Button */}
//       {role === 'Editor' && (
//         <TouchableOpacity
//           onPress={() => navigation.navigate('AddBuilding')}
//           style={styles.fab}>
//           <MaterialIcons name="add" size={40} color="#202D3D" />
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#202D3D',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     color: 'red',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   textfield: {
//     backgroundColor: '#ffff',
//     borderRadius: 8,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: '#BABFC5',
//     marginTop: 8,
//     paddingLeft: 15,
//   },
//   emptyText: {
//     color: '#FFFFFF',
//   },
//   listContainer: {
//     paddingBottom: 100,
//   },
//   itemContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#7de8e3',
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     borderBottomWidth: 2,
//     borderColor: '#ABAFB5',
//   },
//   itemImage: {
//     width: 40,
//     height: 40,
//     resizeMode: 'contain',
//     marginRight: 16,
//   },
//   itemText: {
//     fontSize: 17,
//     color: '#000',
//     fontWeight: '500',
//     flex: 1,
//     textAlign: 'left',
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 16,
//     right: 16,
//     width: 60,
//     height: 60,
//     backgroundColor: '#D9D9D9',
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 4,
//   },
// });

// export default Home;
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBuilding } from '../redux/GetBuildingSlice';
import MapboxGL from '@rnmapbox/maps';

MapboxGL.setAccessToken('pk.eyJ1Ijoiam9qb2V3ZWIiLCJhIjoiY204MnNrbXI0MHg2MjJqcXIycHJqY3BkOCJ9._dBt2T7sPZGAklVStnyy7w');

const Home = ({ navigation }) => {
  const [role, setRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const dispatch = useDispatch();

  const buildingData = useSelector(state => state.getbuildingdata.data);
  const loading = useSelector(state => state.getbuildingdata.loading);
  const error = useSelector(state => state.getbuildingdata.error);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getBuilding()).unwrap();
        const storedRole = await AsyncStorage.getItem('role');
        setRole(storedRole || null);
      } catch (err) {
        console.error('Error fetching building data:', err);
      }
    };
    fetchData();
  }, [dispatch]);

  // Search functionality without API call
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(buildingData);
      setSelectedBuilding(null);
      return;
    }
  
    const searchResults = buildingData.filter(building => {
      const name = building.building_name ? building.building_name.toLowerCase() : '';
      const address = building.building_address ? building.building_address.toLowerCase() : '';
      const zipcode = building.zipcode ? building.zipcode.toString() : '';
  
      return (
        name.includes(searchTerm.toLowerCase()) ||
        address.includes(searchTerm.toLowerCase()) ||
        zipcode.includes(searchTerm) 
      );
    });
  
    if (searchResults.length > 0) {
      setSelectedBuilding(searchResults[0]);
    } else {
      setSelectedBuilding(null);
    }
  
    setFilteredData(searchResults);
  };

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
      ) : (
        <>
          <View style={styles.header}>
            <Image source={require('../assets/white-logo.png')} />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search by name or address"
              placeholderTextColor="#000"
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.searchInput}
            />
            <TouchableOpacity onPress={handleSearch}>
              <MaterialIcons name="search" size={25} color="#000" />
            </TouchableOpacity>
          </View>

          <MapboxGL.MapView style={styles.map}>
            <MapboxGL.Camera
              zoomLevel={selectedBuilding ? 17 : 14}
              centerCoordinate={
                selectedBuilding
                  ? [Number(selectedBuilding.lon), Number(selectedBuilding.lat)]
                  : [Number(buildingData?.[0]?.lon) || -122.4194, Number(buildingData?.[0]?.lat) || 37.7749]
              }
            />

            {(filteredData.length > 0 ? filteredData : buildingData)
              .filter(item => item.lat && item.lon)
              .map((building) => (
                <MapboxGL.PointAnnotation
                  key={building.id}
                  id={`marker-${building.id}`}
                  coordinate={[Number(building.lon), Number(building.lat)]}
                  onSelected={() => setSelectedBuilding(building)}
                >
                  <View style={styles.marker}>
                    <MaterialIcons name="location-pin" size={30} color="red" />
                  </View>
                </MapboxGL.PointAnnotation>
              ))}

            {selectedBuilding && (
              <MapboxGL.MarkerView coordinate={[Number(selectedBuilding.lon), Number(selectedBuilding.lat)]}>
                <TouchableOpacity
                  style={styles.calloutContainer}
                  onPress={() => {
                    navigation.navigate('BuildingDetails', { buildingData: selectedBuilding });
                    setSelectedBuilding(null);
                  }}
                >
                  <Text style={styles.calloutText}>{selectedBuilding.building_name || 'Unknown Building'}</Text>
                  <Text style={styles.calloutSubText}>{selectedBuilding.building_address || 'No address available'}</Text>
                </TouchableOpacity>
              </MapboxGL.MarkerView>
            )}
          </MapboxGL.MapView>
        </>
      )}

      {role === 'Editor' && (
        <TouchableOpacity onPress={() => navigation.navigate('AddBuilding')} style={styles.fab}>
          <MaterialIcons name="add" size={40} color="#202D3D" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#202D3D' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red' },
  header: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#942420', padding: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#BABFC5', marginTop: 8, paddingHorizontal: 15, paddingVertical: 5 },
  searchInput: { flex: 1 },
  map: { flex: 1 },
  marker: { alignItems: 'center', justifyContent: 'center' },
  calloutContainer: { backgroundColor: 'white', padding: 8, borderRadius: 8, alignItems: 'center', elevation: 5 },
  calloutText: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  calloutSubText: { fontSize: 12, color: '#666', marginTop: 4 },
  fab: { position: 'absolute', bottom: 16, right: 16, width: 60, height: 60, backgroundColor: '#D9D9D9', borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 4 },
});

export default Home;



