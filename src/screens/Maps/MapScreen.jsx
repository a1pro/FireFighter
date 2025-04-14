import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

const API_KEY = "9313fcf6cb4945dfbf94b6cadfdae5ce";
const OPENCAGE_API_URL = "https://api.opencagedata.com/geocode/v1/json";

const MapScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { businessAddress } = route.params || {};

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (businessAddress) {
      geocodeAddress(businessAddress);
    }
  }, [businessAddress]);

  const geocodeAddress = async (address) => {
    try {
      setLoading(true);
      const response = await axios.get(OPENCAGE_API_URL, {
        params: {
          key: API_KEY,
          q: address,
        },
      });
      const result = response.data.results[0];
      if (result) {
        const { lat, lng } = result.geometry;
        setSelectedLocation({ latitude: lat, longitude: lng });
        setFormattedAddress(result.formatted);
        setShowPopup(true);
        mapRef.current?.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      Alert.alert("Error", "Failed to locate the address on map.");
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(OPENCAGE_API_URL, {
        params: {
          key: API_KEY,
          q: `${lat},${lng}`,
        },
      });
      const result = response.data.results[0];
      if (result) {
        setFormattedAddress(result.formatted);
        setShowPopup(true);
      } else {
        setFormattedAddress("Unknown location");
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) return;
    navigation.goBack();
    navigation.navigate("AddBuilding", {
      selectedAddress: formattedAddress,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      )}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        mapType="standard"
        onPress={handleMapPress}
        initialRegion={{
          latitude: selectedLocation?.latitude || 30.7046,
          longitude: selectedLocation?.longitude || 76.7179,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            draggable={true}
            onDragEnd={async (e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setSelectedLocation({ latitude, longitude });
              await reverseGeocode(latitude, longitude);
              mapRef.current?.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }}
          />
        )}
      </MapView>

      {showPopup && formattedAddress ? (
        <View style={styles.popupContainer}>
          <Image
            source={{
              uri:
                "https://cdn.pixabay.com/photo/2016/11/29/05/08/architecture-1867782_1280.jpg",
            }}
            style={styles.popupImage}
          />
          <View style={styles.popupTextContainer}>
            <Text style={styles.popupTitle}>Selected Location</Text>
            <Text style={styles.popupAddress}>{formattedAddress}</Text>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmLocation}
            >
              <Icon name="checkmark-circle" size={20} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 6 }}>
                Confirm Location
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -15,
    zIndex: 10,
  },
  popupContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: "hidden",
  },
  popupImage: {
    width: 100,
    height: 100,
  },
  popupTextContainer: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  popupTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  popupAddress: {
    fontSize: 13,
    color: "#555",
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: "flex-start",
  },
});

export default MapScreen;
