import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import styles from '../screens/styles/Styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../component/Header';
import {SafeAreaView} from 'react-native';

const Gallery = ({route, navigation}) => {
  const {id, floor = [], basement = []} = route.params || {};
  const buildingId = id;

  // floor and basement arrays of IDs
  const floorIds = Array.isArray(floor) ? floor : [];
  const basementIds = Array.isArray(basement) ? basement : [];

  const [floorPreviews, setFloorPreviews] = useState([]);
  const [basementPreviews, setBasementPreviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        const url =
          'https://firefighter.a1professionals.net/api/v1/get/floor/gallery';

        // 1️⃣ Fetch each floor
        const floorResults = [];
        for (let fid of floorIds) {
          const payload = {
            building_id: buildingId.toString(),
            floor_id: fid.toString(),
          };
          const res = await axios.post(url, payload, {headers});
          if (res.data?.success) {
            const f = res.data.data.floor;
            if (f?.floor_image?.length) {
              floorResults.push({
                id: f.id,
                name: f.floor_name,
                previewImage: f.floor_image[0],
                allImages: f.floor_image,
              });
            }
          }
        }
        setFloorPreviews(floorResults);

        // 2️⃣ Fetch each basement
        const basementResults = [];
        for (let bid of basementIds) {
          const payload = {
            building_id: buildingId.toString(),
            basement_id: bid.toString(),
          };
          const res = await axios.post(url, payload, {headers});
          if (res.data?.success) {
            const b = res.data.data.basement;
            if (b?.basement_image?.length) {
              basementResults.push({
                id: b.id,
                name: b.basement_name,
                previewImage: b.basement_image[0],
                allImages: b.basement_image,
              });
            }
          }
        }
        setBasementPreviews(basementResults);
      } catch (err) {
        console.error('Error loading gallery:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const renderItem = ({item, type}) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ImageSlider', {
          images: item.allImages,
          initialIndex: 0,
        })
      }
      style={{
        flex: 1,
        margin: 10,
        borderWidth: 2,
        borderColor: '#942420',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
      }}>
      {item.previewImage ? (
        <Image
          source={{uri: item.previewImage}}
          style={{width: 100, height: 100, borderRadius: 8}}
          resizeMode="cover"
        />
      ) : (
        <Text>No Image</Text>
      )}
      <Text style={{marginTop: 8}}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, {justifyContent: 'center'}]}>
        <View style={[styles.container, {justifyContent: 'center'}]}>
          <ActivityIndicator size="large" color="#942420" />
          <Text style={{textAlign: 'center'}}>Loading previews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (floorPreviews.length === 0 && basementPreviews.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <Text style={{textAlign: 'center', marginTop: 20}}>
            No images found for any floor or basement.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Header title="Gallery" />
        <View style={styles.container}>
          {floorPreviews.length > 0 && (
            <FlatList
              data={floorPreviews}
              renderItem={props => renderItem({...props, type: 'floor'})}
              keyExtractor={item => `floor-${item.id}`}
              numColumns={2}
            />
          )}
          {basementPreviews.length > 0 && (
            <FlatList
              data={basementPreviews}
              renderItem={props => renderItem({...props, type: 'basement'})}
              keyExtractor={item => `basement-${item.id}`}
              numColumns={2}
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default Gallery;
