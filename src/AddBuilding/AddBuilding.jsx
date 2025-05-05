import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  FlatList,
  Image, 
  ActivityIndicator, 
} from "react-native";
import styles from "../screens/styles/Styles";
import { Picker } from "@react-native-picker/picker";
import { launchImageLibrary } from "react-native-image-picker";
import { Formik } from "formik";
import * as Yup from "yup";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Base_url } from "../utils/ApiKey";
import Geolocation from "@react-native-community/geolocation";
import { PermissionsAndroid } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";

const API_KEY = "9313fcf6cb4945dfbf94b6cadfdae5ce"; 
const OPENCAGE_API_URL = `https://api.opencagedata.com/geocode/v1/json`;

// Validation Schema
const validationSchema = Yup.object().shape({
  buildingAddress: Yup.string().required("Building address is required"), 
  zipcode: Yup.string(),
  suiteNumber: Yup.string(),
  buildingName: Yup.string(),
  totalFloors: Yup.number().min(1, "Must be at least 1 floor"),
  totalBasements: Yup.number().min(0, "Basements cannot be negative"),
});

const AddBuilding = () => {
  const [selectedFloors, setSelectedFloors] = useState([]);
  const [selectedBasements, setSelectedBasements] = useState([]);
  const [floorDetails, setFloorDetails] = useState({});
  const [basementDetails, setBasementDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const debounceTimer = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();

  // Safe number conversion
  const getNumber = (value) => {
    const num = parseInt(value, 10);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  // Add Floor Detail function
  const addFloorDetail = () => {
    setSelectedFloors(prev => [...prev, { floorNumber: prev.length + 1 }]);
  };

  // Add Basement Detail function
  const addBasementDetail = () => {
    setSelectedBasements(prev => [...prev, { basementNumber: prev.length + 1 }]);
  };

  // Debounced fetchAddressSuggestions
  const fetchAddressSuggestions = async (query) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!query) return setAddressSuggestions([]);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await axios.get(OPENCAGE_API_URL, {
          params: { key: API_KEY, q: encodeURIComponent(query), limit: 10 },
        });
        setAddressSuggestions(response.data.results || []);
      } catch (error) {
        console.error("OpenCage API Error:", error);
        setAddressSuggestions([]);
      }
    }, 500);
  };

  const handleAddressSelect = (addressData, setFieldValue) => {
    const { formatted, geometry, components } = addressData;
    setFieldValue("buildingAddress", formatted);
    setLatitude(geometry.lat);
    setLongitude(geometry.lng);
    setFieldValue("zipcode", components.postcode || "");
    setAddressSuggestions([]);
  };

  const selectImage = (type, number) => {
    launchImageLibrary({ mediaType: "photo", quality: 0.5 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Error", response.errorMessage);
        return;
      }
      const image = response.assets[0];
      if (type === "floor") {
        setFloorDetails(prev => ({ ...prev, [number]: { ...prev[number], image } }));
      } else {
        setBasementDetails(prev => ({ ...prev, [number]: { ...prev[number], image } }));
      }
    });
  };

  // Permissions and location
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        { title: "Location Permission", message: "This app needs access to your location." }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const fetchCurrentLocation = async () => {
    if (await requestLocationPermission()) {
      Geolocation.getCurrentPosition(
        pos => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); },
        err => { Alert.alert("Error", "Unable to fetch location"); console.error(err); },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      Alert.alert("Permission Denied", "Location permission is required.");
    }
  };

  const handleCheckboxChange = () => {
    setUseCurrentLocation(prev => !prev);
    if (!useCurrentLocation) fetchCurrentLocation();
    else { setLatitude(null); setLongitude(null); }
  };

  // Submit handler with default floors/basements fallback
  const handleSubmitForm = async (values) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const formData = new FormData();
      formData.append("building_address", values.buildingAddress);
      formData.append("zipcode", values.zipcode || "");
      formData.append("suite_number", values.suiteNumber || "");
      formData.append("building_name", values.buildingName || "");

      const floorCount = getNumber(values.totalFloors);
      const basementCount = getNumber(values.totalBasements);

      // Append totals
      formData.append("total_floor", floorCount.toString());
      formData.append("total_basement", basementCount.toString());
      formData.append("lat", latitude);
      formData.append("lon", longitude);

      // Determine floors to submit
      const floorsToSubmit = selectedFloors.length > 0
        ? selectedFloors
        : Array.from({ length: floorCount }, (_, i) => ({ floorNumber: i + 1 }));

      floorsToSubmit.forEach(floor => {
        const num = floor.floorNumber;
        const name = floorDetails[num]?.name || "";
        const img = floorDetails[num]?.image;
        formData.append("floor_name[]", name);
        formData.append("floor_number[]", num.toString());
        if (img) {
          formData.append("floor_image[]", { uri: img.uri, type: img.type || "image/jpeg", name: img.fileName || `floor_${num}.jpg` });
        }
      });

      // Determine basements to submit
      const basementsToSubmit = selectedBasements.length > 0
        ? selectedBasements
        : Array.from({ length: basementCount }, (_, i) => ({ basementNumber: i + 1 }));

      basementsToSubmit.forEach(bs => {
        const num = bs.basementNumber;
        const name = basementDetails[num]?.name || "";
        const img = basementDetails[num]?.image;
        formData.append("basement_name[]", name);
        formData.append("basement_number[]", num.toString());
        if (img) {
          formData.append("basement_image[]", { uri: img.uri, type: img.type || "image/jpeg", name: img.fileName || `basement_${num}.jpg` });
        }
      });

      // API call
      const res = await axios.post(Base_url.addbuilding, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      setLoading(false);
      if (res.data.success) {
        Alert.alert(res.data.message);
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Failed to add building. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("Error", error.message || "An unexpected error occurred.");
    }
  };  

  
  return (
    <Formik
      initialValues={{ buildingAddress: "", zipcode: "", suiteNumber: "", buildingName: "", totalFloors: 1, totalBasements: 0 }}
      validationSchema={validationSchema}
      onSubmit={handleSubmitForm}
    >{({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => {
        useEffect(() => {
          if (route.params?.selectedAddress) {
            setFieldValue("buildingAddress", route.params.selectedAddress);
            setLatitude(route.params.latitude);
            setLongitude(route.params.longitude);
          }
        }, [route.params]);

        return (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.container, { paddingBottom: 30, paddingTop: 30 }]}>
              {/* Business Address */}
              <View style={styles.textfieldwrapper}>
                <Text style={styles.label}>Business Address</Text>
                <TextInput
                  placeholder="Enter building address"
                  style={styles.textfield}
                  placeholderTextColor="#BABFC5"
                  value={values.buildingAddress}
                  onChangeText={(text) => {
                    handleChange("buildingAddress")(text);
                    fetchAddressSuggestions(text);
                  }}
                  onBlur={handleBlur("buildingAddress")}
                />
                {touched.buildingAddress && errors.buildingAddress && (
                  <Text style={styles.errortext}>{errors.buildingAddress}</Text>
                )}
                 {addressSuggestions.length > 0 && (
                  <FlatList
                    data={addressSuggestions}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => handleAddressSelect(item, setFieldValue)}>
                        <Text>{item.formatted}</Text>
                      </TouchableOpacity>
                    )}
                    nestedScrollEnabled
                  />
                )}
              </View>

              <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("MapScreen", { businessAddress: values.buildingAddress })
                  }
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Icon name="map" size={20} color="#007bff" />
                  <Text style={{ marginLeft: 2, fontSize: 14, color: "#007bff" }}>
                    Select from Map
                  </Text>
                </TouchableOpacity>
              <View style={styles.textfieldwrapper}>
                <Text style={[styles.label,{marginTop:20}]}>Zip Code</Text>
                <TextInput
                  placeholder="Zip code"
                  style={styles.textfield}
                  placeholderTextColor="#BABFC5"
                  value={values.zipcode}
                  onChangeText={handleChange("zipcode")}
                />
              </View>
              <View style={styles.textfieldwrapper}>
                <Text style={styles.label}>Suite/ Unit Number</Text>
                <TextInput
                  placeholder="Enter suite/unit number"
                  style={styles.textfield}
                  placeholderTextColor="#BABFC5"
                  value={values.suiteNumber}
                  onChangeText={handleChange("suiteNumber")}
                  onBlur={handleBlur("suiteNumber")}
                />
                {touched.suiteNumber && errors.suiteNumber && (
                  <Text style={styles.errortext}>{errors.suiteNumber}</Text>
                )}
              </View>
              <View style={styles.textfieldwrapper}>
                <Text style={styles.label}>Business Name</Text>
                <TextInput
                  placeholder="Enter building name"
                  style={styles.textfield}
                  placeholderTextColor="#BABFC5"
                  value={values.buildingName}
                  onChangeText={handleChange("buildingName")}
                  onBlur={handleBlur("buildingName")}
                />
                {touched.buildingName && errors.buildingName && (
                  <Text style={styles.errortext}>{errors.buildingName}</Text>
                )}
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <TouchableOpacity
                  onPress={handleCheckboxChange}
                  style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}
                >
                  <Icon
                    name={useCurrentLocation ? "check-box" : "check-box-outline-blank"}
                    size={24}
                    color={useCurrentLocation ? "#007bff" : "#aaa"}
                  />
                  <Text style={{ marginLeft: 10, fontSize: 16, color: "#333" }}>
                    Use Current Location
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.btn} onPress={addFloorDetail}>
                <Text style={styles.btntxt}>Add Floor Detail</Text>
              </TouchableOpacity>
              {selectedFloors.map((floor, index) => (
                <View key={index} style={{ marginTop: 20 }}>
                  <Text style={styles.label}>Enter Floor Number</Text>
                  <TextInput
                    placeholder="Enter floor number"
                    style={styles.textfield}
                    keyboardType="numeric"
                    value={floor.floorNumber.toString()}
                    onChangeText={(text) => {
                      const floorNumber = getNumber(text);
                      setSelectedFloors((prev) => {
                        const updated = [...prev];
                        updated[index].floorNumber = floorNumber;
                        return updated;
                      });
                    }}
                  />

                  {/* <View style={styles.textfieldwrapper}>
                    <Text style={styles.label}>Floor {floor.floorNumber} Name</Text>
                    <TextInput
                      placeholder={`Enter name for Floor ${floor.floorNumber}`}
                      style={styles.textfield}
                      value={floorDetails[floor.floorNumber]?.name || ""}
                      onChangeText={(text) => {
                        setFloorDetails({
                          ...floorDetails,
                          [floor.floorNumber]: { name: text, image: null },
                        });
                      }}
                    />
                  </View> */}
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() => selectImage("floor", floor.floorNumber)}
                  >
                    <Text style={styles.btntxt}>Upload Floor Image</Text>
                  </TouchableOpacity>
                  {floorDetails[floor.floorNumber]?.image && (
                    <Image
                      source={{ uri: floorDetails[floor.floorNumber].image.uri }}
                      style={{ width: 100, height: 100, marginTop: 10 }}
                    />
                  )}
                </View>
              ))}

              {/* Add Basement Detail Button */}
              <TouchableOpacity style={[styles.btn, { marginBottom: 20, marginTop: 20 }]} onPress={addBasementDetail}>
                <Text style={styles.btntxt}>Add Basement Detail</Text>
              </TouchableOpacity>

              {/* Render Basement Number and Basement Name Fields */}
              {selectedBasements.map((basement, index) => (
                <View key={index} style={{ marginTop: 20 }}>
                  <Text style={styles.label}>Enter Basement Number</Text>
                  <TextInput
                    placeholder="Enter basement number"
                    style={styles.textfield}
                    keyboardType="numeric"
                    value={basement.basementNumber.toString()}
                    onChangeText={(text) => {
                      const basementNumber = getNumber(text);
                      setSelectedBasements((prevBasements) => {
                        const updatedBasements = [...prevBasements];
                        updatedBasements[index] = { ...updatedBasements[index], basementNumber }; 
                        return updatedBasements;
                      });
                    }}
                  />
                  {/* <View style={styles.textfieldwrapper}>
                    <Text style={styles.label}>Basement {basement.basementNumber} Name</Text>
                    <TextInput
                      placeholder={`Enter name for Basement ${basement.basementNumber}`}
                      style={styles.textfield}
                      value={basementDetails[basement.basementNumber]?.name || ""}
                      onChangeText={(text) => {
                        setBasementDetails({
                          ...basementDetails,
                          [basement.basementNumber]: { name: text, image: null },
                        });
                      }}
                    />
                  </View> */}
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() => selectImage("basement", basement.basementNumber)}
                  >
                    <Text style={styles.btntxt}>Upload Basement Image</Text>
                  </TouchableOpacity>
                  {basementDetails[basement.basementNumber]?.image && (
                    <Image
                      source={{ uri: basementDetails[basement.basementNumber].image.uri }}
                      style={{ width: 100, height: 100, marginTop: 10 }}
                    />
                  )}
                </View>
              ))}

              {/* Submit Button */}
              <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.btntxt}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      }}
    </Formik>
  );
};

export default AddBuilding;
