import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import styles from '../screens/styles/Styles';
import { useDispatch, useSelector } from 'react-redux';
import { getIcon } from '../redux/GetIconsSlice';
import { ImageBackground } from 'react-native';

const FloorDetails = ({ route }) => {
  const dispatch = useDispatch();
  const { selectedFloor } = route.params; 
  // console.log("selectedFloor", selectedFloor);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const icons = useSelector(state => state.geticondata.data);
  const loading = useSelector(state => state.geticondata.loading);
  const error = useSelector(state => state.geticondata.error);

  useEffect(() => {
    dispatch(getIcon());
  }, [dispatch]);

  const handleCategoryClick = categoryName => {
    // Toggle category selection
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  return (
    <View style={[styles.container, { marginLeft: 4, marginRight: 4 }]}>
      <Text style={[styles.h1,{textAlign:'center',paddingTop:20,paddingBottom:20}]}>Floor Layout</Text>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ flex: 1, backgroundColor: '#edeceb', padding: 10 }}>
          {icons && icons.length > 0 ? (
            icons.map(category => (
              <TouchableOpacity
                key={category.category_name}
                onPress={() => handleCategoryClick(category.category_name)}
              >
                  <ImageBackground source={{uri:category.category_image}} style={{marginBottom: 20}}>
                <View style={{ marginBottom: 10,alignItems:'center', padding: 5,}}>
                  <Text
                    style={{
                      color: selectedCategory === category.category_name ? '#fff' : '#942420',
                      fontWeight: '500',
                      fontSize: 15,
                     
                      backgroundColor: selectedCategory === category.category_name ? '#3A4E63' : 'transparent',
                      borderRadius: 5,
                    }}
                  >
                    {category.category_name}
                  </Text>
               
                {/* <Image source={{ uri: category.category_image }} style={{width:30,height:30}}/> */}
                </View>
                  </ImageBackground>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: '#fff' }}>No categories available</Text>
          )}
        </View>

        {/* Display icons for the selected category */}
        <View style={{ flex: 4, backgroundColor: '#fff', paddingLeft: 3 }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#edeceb' }}>
            {selectedCategory ? (
              icons
                .find(category => category.category_name === selectedCategory)
                ?.icons.map((icon, index) => (
                  <View key={index} style={styles.iconContainer}>
                    <Image
                      source={{ uri: icon.icon_image_url }}
                      style={styles.iconImage}
                    />
                    <Text style={styles.iconText}>{icon.icon_name}</Text>
                  </View>
                ))
            ) : (
              <Text style={{ textAlign: 'center', color: '#333' }}>
                Select a category to view icons
              </Text>
            )}
          </View>

          {/* Floor Layout image */}
          {selectedFloor ? (
            <View>
              <Image source={{ uri: selectedFloor.floor_image }} style={{ width: '100%', height: '100%' }} />
            </View>
          ) : (
            <Text>No floor layout available</Text>
          )}

          {/* Google Map */}
          {/* <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.7749,
              longitude: -122.4194,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            mapType="satellite"
          /> */}
        </View>
      </View>
    </View>
  );
};

export default FloorDetails;
