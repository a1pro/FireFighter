import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import styles from '../screens/styles/Styles';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getIcon } from '../redux/GetIconsSlice';
import { useNavigation } from '@react-navigation/native';
import FloorDetails from './FloorDetails';

const BuildingDetails = ({ route }) => {
  const { buildingData } = route.params;
  console.log("data", buildingData);
  const dispatch = useDispatch();
  const icons = useSelector(state => state.geticondata.data);
  const loading = useSelector(state => state.geticondata.loading);
  const error = useSelector(state => state.geticondata.error);
  const navigation = useNavigation();

  useEffect(() => {
    dispatch(getIcon());
  }, [dispatch]);

  // Function to get category count for each floor
  const getCategoryCount = categoryName => {
    const category = icons.find(item => item.category_name === categoryName);
    return category ? category.icons.length : 0;
  };

  return (
    <View style={[styles.container, { marginLeft: 0, marginRight: 0, backgroundColor: '#18222C' }]}>
      <View style={{ paddingTop: 30, paddingBottom: 30 }}>
        <Text style={[styles.h1, { textAlign: 'center', color: '#ffff' }]}>Business Details</Text>
      </View>
      <View>
        <View style={{ backgroundColor: '#942420', marginBottom: 30 }}>
          <Text style={[styles.h1, { textAlign: 'center', color: '#ffff' }]}>
            {buildingData.building_name}
          </Text>
        </View>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
          
        {/* map button */}
        <TouchableOpacity onPress={()=>navigation.navigate('Maps')} style={[styles.btn, { backgroundColor: 'transparent', borderColor: '#CE2127', borderWidth: 1, width: 120, paddingTop: 7, paddingBottom: 7, marginBottom: 15 }]}>
          <Text style={[styles.btntxt,{fontSize:15}]}>View Map</Text>
        </TouchableOpacity>
        {/* gallery */}
        <TouchableOpacity 
    onPress={() => navigation.replace('Gallery', { id: buildingData.id })}
    style={[styles.btn, { backgroundColor: 'transparent', borderColor: '#CE2127', borderWidth: 1, width: 120, paddingTop: 7, paddingBottom: 7, marginBottom: 15 }]}
>
    <Text style={[styles.btntxt, { fontSize: 15 }]}>View Gallery</Text>
</TouchableOpacity>
        {/* summary */}
        <TouchableOpacity onPress={()=>navigation.navigate('Maps')} style={[styles.btn, { backgroundColor: 'transparent', borderColor: '#CE2127', borderWidth: 1, width: 120, paddingTop: 7, paddingBottom: 7, marginBottom: 15 }]}>
          <Text style={[styles.btntxt,{fontSize:15}]}>View Summary</Text>
        </TouchableOpacity>
        </View>

        {/* Category section */}
        <ScrollView
          horizontal
          contentContainerStyle={{
            backgroundColor: '#ffff',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
          }}
          showsHorizontalScrollIndicator={false}>
          <Text style={[styles.h4, { marginRight: 10 }]}>Floor</Text>
          {icons && icons.length > 0 ? (
            icons.map((icon, index) => (
              <View key={index} style={{ marginRight: 20 }}>
                <Text style={styles.h4}>{icon.category_name}</Text>
              </View>
            ))
          ) : (
            <Text>No categories available</Text>
          )}
        </ScrollView>

        {/* Floor List */}
        <View style={{ marginTop: 5 }}>
          {buildingData &&
            buildingData.floors &&
            buildingData.floors.length > 0 ? (
            buildingData.floors.map((floor, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 10,
                  backgroundColor: '#ffff',
                  borderBottomColor: '#000',
                  borderBottomWidth: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onPress={() => navigation.navigate('FloorDetails', { selectedFloor: floor })}
              >
                <Text style={{ fontSize: 16, fontWeight: '500' }}>{floor.floor_name}</Text>

                {/* Category-wise icon count */}
                {icons && icons.length > 0 ? (
                  icons.map((iconCategory, idx) => (
                    <Text key={idx} style={{ fontSize: 16, fontWeight: '500' }}>
                      {getCategoryCount(iconCategory.category_name)}
                    </Text>
                  ))
                ) : (
                  <Text style={{ fontSize: 14, color: '#942420' }}>
                    No categories available
                  </Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: '#888' }}>
              No floors available
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default BuildingDetails;
