import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import styles from "../screens/styles/Styles";
import axios from "axios";
import { Base_url } from "../utils/ApiKey";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../component/Header";

const Gallery = ({ route, navigation }) => {
  const { id, floor } = route.params || {};
  const buildingId = id ? id : null;

  const floors = Array.isArray(floor)
    ? floor.map((fid) => ({ id: fid, floor_name: `Floor ${fid}` }))
    : [];

  const [floorPreviews, setFloorPreviews] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllFloorsGallery = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const previews = [];

        for (let fl of floors) {
          const payload = {
            building_id: buildingId.toString(),
            floor_id: fl.id.toString(),
          };

          const response = await axios.post(
            "https://firefighter.a1professionals.net/api/v1/get/floor/gallery",
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.success) {
            const floorData = response.data.data.floors[0];
            const floor_image = floorData.floor_image || [];
            const message = floorData.message || [];

            const formattedData = floor_image.map((img, index) => ({
              image: img,
              name: message[index] || "No Message",
            }));

            previews.push({
              floor_id: fl.id,
              floor_name: fl.floor_name,
              previewImage: formattedData[0]?.image || null,
              allImages: formattedData.map((d) => d.image),
            });
          }
        }

        setFloorPreviews(previews);
      } catch (err) {
        console.error("Error loading gallery previews:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllFloorsGallery();
  }, []);

  const handlePreviewClick = (floorItem) => {
    if (floorItem.allImages.length === 0) return;
    navigation.navigate("ImageSlider", {
      images: floorItem.allImages,
      initialIndex: 0,
    });
  };

  const renderFloorPreview = ({ item }) => (
    <TouchableOpacity
      onPress={() => handlePreviewClick(item)}
      style={{
        flex: 1,
        margin: 10,
        borderWidth: 2,
        borderColor: "#942420",
        borderRadius: 10,
        padding: 10,
        alignItems: "center",
      }}
    >
      {item.previewImage ? (
        <Image
          source={{ uri: item.previewImage }}
          style={{ width: 100, height: 100, borderRadius: 8 }}
          resizeMode="cover"
        />
      ) : (
        <Text>No Image</Text>
      )}
      <Text style={{ marginTop: 8 }}>{item.floor_name}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Header title="Gallery" />
      <View style={styles.container}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#942420" />
            <Text style={{ textAlign: "center" }}>Loading previews...</Text>
          </View>
        ) : floorPreviews.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No images found for any floor.
          </Text>
        ) : (
          <FlatList
            data={floorPreviews}
            renderItem={renderFloorPreview}
            keyExtractor={(item) => item.floor_id.toString()}
            numColumns={2}
          />
        )}
      </View>
    </>
  );
};

export default Gallery;
