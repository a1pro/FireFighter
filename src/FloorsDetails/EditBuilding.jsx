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
import { PermissionsAndroid } from "react-native";

const API_KEY = "9313fcf6cb4945dfbf94b6cadfdae5ce";
const OPENCAGE_API_URL = `https://api.opencagedata.com/geocode/v1/json`;

// Validation Schema
const validationSchema = Yup.object().shape({
  buildingAddress: Yup.string().required("Building address is required"),
  zipcode: Yup.string(), // Optional
  suiteNumber: Yup.string(), // Optional
  buildingName: Yup.string(), // Optional
  totalFloors: Yup.number().min(1, "Must be at least 1 floor"), // Optional
  totalBasements: Yup.number().min(0, "Basements cannot be negative"), // Optional
});

const EditBuilding = ({ navigation, route }) => {
  const { buildingData } = route.params; // Receiving buildingData from previous screen

  // Local states
  const [selectedFloors, setSelectedFloors] = useState([]);
  const [selectedBasements, setSelectedBasements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showBasementFields, setShowBasementFields] = useState(false); // Controls basement fields

  const debounceTimer = useRef(null);

  // On mount or when buildingData changes, populate states
  useEffect(() => {
    if (buildingData) {
      // Floors
      if (buildingData.floors && buildingData.floors.length > 0) {
        // Transform API floor data to a format we can use easily
        const floorsArray = buildingData.floors.map((f, index) => ({
          // If there's a floor_number in the API, use it. Otherwise fallback to index+1
          floorNumber: f.floor_number != null ? f.floor_number : index + 1,
          floorName: f.floor_name || "",
          // We store either a direct URI (string) if it's from server, or an object if we pick from library
          floorImage: f.floor_image || null,
          // Keep an id if available (for update)
          id: f.id,
        }));
        setSelectedFloors(floorsArray);
      } else {
        setSelectedFloors([]);
      }

      // Basements
      if (buildingData.basements && buildingData.basements.length > 0) {
        // Transform API basement data
        const basementArray = buildingData.basements.map((b, index) => ({
          basementNumber: b.basement_number != null ? b.basement_number : index + 1,
          basementName: b.basement_name || "",
          basementImage: b.basement_image || null,
          id: b.id,
        }));
        setSelectedBasements(basementArray);
        // If there is existing basement data, show the basement fields
        setShowBasementFields(true);
      } else {
        setSelectedBasements([]);
        setShowBasementFields(false);
      }

      // Latitude and longitude
      setLatitude(buildingData.lat || "");
      setLongitude(buildingData.lon || "");
    }
  }, [buildingData]);

  // Convert value to number safely
  const getNumber = (value) => {
    const num = parseInt(value, 10);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  // Add Floor Detail function
  const addFloorDetail = () => {
    setSelectedFloors((prevFloors) => [
      ...prevFloors,
      {
        floorNumber: prevFloors.length + 1,
        floorName: "",
        floorImage: null,
        id: null, // new floor, no ID
      },
    ]);
  };

  // Add Basement Detail function
  const addBasementDetail = () => {
    setShowBasementFields(true); // Make sure basement fields are shown
    setSelectedBasements((prevBasements) => [
      ...prevBasements,
      {
        basementNumber: prevBasements.length + 1,
        basementName: "",
        basementImage: null,
        id: null, // new basement, no ID
      },
    ]);
  };

  // Debounced fetchAddressSuggestions
  const fetchAddressSuggestions = async (query) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (!query) {
      setAddressSuggestions([]);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await axios.get(OPENCAGE_API_URL, {
          params: {
            key: API_KEY,
            q: encodeURIComponent(query),
            limit: 10,
          },
        });
        setAddressSuggestions(response.data.results || []);
      } catch (error) {
        console.error("OpenCage API Error:", error.response?.data || error.message);
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

  // Image selection for floors and basements
  const selectImage = (type, index) => {
    launchImageLibrary({ mediaType: "photo", quality: 0.5 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Error", response.errorMessage);
        return;
      }
      const image = response.assets[0];

      if (type === "floor") {
        // Update the floorImage in selectedFloors at the given index
        setSelectedFloors((prevFloors) => {
          const updated = [...prevFloors];
          updated[index].floorImage = image; // store the image object
          return updated;
        });
      } else {
        // Update the basementImage in selectedBasements at the given index
        setSelectedBasements((prevBasements) => {
          const updated = [...prevBasements];
          updated[index].basementImage = image;
          return updated;
        });
      }
    });
  };

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Fetch current location
  const fetchCurrentLocation = async () => {
    if (await requestLocationPermission()) {
      Geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          Alert.alert("Error", "Unable to fetch location");
          console.error(error);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      Alert.alert("Permission Denied", "Location permission is required to use this feature.");
    }
  };

  // Checkbox for "Use Current Location"
  const handleCheckboxChange = () => {
    setUseCurrentLocation(!useCurrentLocation);
    if (!useCurrentLocation) {
      fetchCurrentLocation();
    } else {
      setLatitude(null);
      setLongitude(null);
    }
  };

  // Handle text changes for floor name
  const handleFloorNameChange = (text, index) => {
    setSelectedFloors((prev) => {
      const updated = [...prev];
      updated[index].floorName = text;
      return updated;
    });
  };

  // Handle text changes for floor number
  const handleFloorNumberChange = (text, index) => {
    const floorNumber = getNumber(text);
    setSelectedFloors((prev) => {
      const updated = [...prev];
      updated[index].floorNumber = floorNumber;
      return updated;
    });
  };

  // Handle text changes for basement name
  const handleBasementNameChange = (text, index) => {
    setSelectedBasements((prev) => {
      const updated = [...prev];
      updated[index].basementName = text;
      return updated;
    });
  };

  // Handle text changes for basement number
  const handleBasementNumberChange = (text, index) => {
    const basementNumber = getNumber(text);
    setSelectedBasements((prev) => {
      const updated = [...prev];
      updated[index].basementNumber = basementNumber;
      return updated;
    });
  };

  // onFormSubmit function for updating building
  const onFormSubmit = async (values) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }
  
      // Create a new FormData object and include update parameters
      const formData = new FormData();
      formData.append("building_id",buildingData.id); // building_id from form values
      formData.append("building_name", values.buildingName || "");
      formData.append("building_address", values.buildingAddress || "");
      formData.append("total_floor", values.totalFloors);
      formData.append("total_basement", values.totalBasements);
      formData.append("lat", latitude);
      formData.append("lon", longitude);
      formData.append("zipcode", values.zipcode || "");
  
      // Append floor details and images along with floor IDs
      selectedFloors.forEach((floor) => {
        formData.append("floor_id[]", floor.id || ""); // Existing floor id if any
        formData.append("floor_name[]", floor.floorName || "");
  
        if (floor.floorImage && floor.floorImage.uri) {
          formData.append("floor_image[]", {
            uri: floor.floorImage.uri,
            type: floor.floorImage.type || "image/jpeg",
            name: floor.floorImage.fileName || `floor_${floor.floorNumber}.jpg`,
          });
        } else if (typeof floor.floorImage === "string" && floor.floorImage !== null) {
          formData.append("floor_image[]", "");
        } else {
          formData.append("floor_image[]", "");
        }
      });
  
      // Append basement details and images along with basement IDs
      selectedBasements.forEach((basement) => {
        formData.append("basement_id[]", basement.id || ""); // Existing basement id if any
        formData.append("basement_name[]", basement.basementName || "");
  
        if (basement.basementImage && basement.basementImage.uri) {
          formData.append("basement_image[]", {
            uri: basement.basementImage.uri,
            type: basement.basementImage.type || "image/jpeg",
            name: basement.basementImage.fileName || `basement_${basement.basementNumber}.jpg`,
          });
        } else if (typeof basement.basementImage === "string" && basement.basementImage !== null) {
          formData.append("basement_image[]", "");
        } else {
          formData.append("basement_image[]", "");
        }
      });
  
      console.log('dataaaaformmm',formData)
      // Make the API request using the update building API URL
      const res = await axios.post(
        "https://firefighter.a1professionals.net/api/v1/update/building",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (res.data.success === true) {
        setLoading(false);
        Alert.alert(res.data.message);
        navigation.navigate("Home");
      } else {
        setLoading(false);
        Alert.alert("Error", "Failed to update building. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error.response ? error.response.data : error.message);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };
  
  return (
    <Formik
      initialValues={{
        buildingId: buildingData?.id ? buildingData.id.toString() : "", // New field for building id
        buildingAddress: buildingData?.building_address || "",
        zipcode: buildingData?.zipcode || "",
        suiteNumber: buildingData?.suite_number || "",
        buildingName: buildingData?.building_name || "",
        totalFloors: buildingData?.total_floor?.toString() || "0",
        totalBasements: buildingData?.total_basement?.toString() || "0",
      }}
      validationSchema={validationSchema}
      onSubmit={onFormSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => {
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
                {/* Display Address Suggestions */}
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
  
              {/* Zip Code */}
              <View style={styles.textfieldwrapper}>
                <Text style={styles.label}>Zip Code</Text>
                <TextInput
                  placeholder="Zip code"
                  style={styles.textfield}
                  placeholderTextColor="#BABFC5"
                  value={values.zipcode}
                  onChangeText={handleChange("zipcode")}
                />
              </View>
  
              {/* Business Name */}
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
  
              {/* Use Current Location */}
              <TouchableOpacity
                onPress={handleCheckboxChange}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
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
  
              {/* Floors */}
              <TouchableOpacity style={styles.btn} onPress={addFloorDetail}>
                <Text style={styles.btntxt}>Add Floor Detail</Text>
              </TouchableOpacity>
  
              {/* Render Floor Number and Floor Name Fields */}
              {selectedFloors.map((floor, index) => (
                <View key={floor.id || `floor-${index}`} style={{ marginTop: 20 }}>
                  <Text style={styles.label}>Enter Floor Number</Text>
                  <TextInput
                    placeholder="Enter floor number"
                    style={styles.textfield}
                    keyboardType="numeric"
                    value={floor.floorNumber?.toString() || ""}
                    onChangeText={(text) => handleFloorNumberChange(text, index)}
                  />
                  <View style={styles.textfieldwrapper}>
                    <Text style={styles.label}>Floor {floor.floorNumber} Name</Text>
                    <TextInput
                      placeholder={`Enter name for Floor ${floor.floorNumber}`}
                      style={styles.textfield}
                      value={floor.floorName}
                      onChangeText={(text) => handleFloorNameChange(text, index)}
                    />
                  </View>
                  <TouchableOpacity style={styles.btn} onPress={() => selectImage("floor", index)}>
                    <Text style={styles.btntxt}>Upload Floor Image</Text>
                  </TouchableOpacity>
                  {/* Uncomment below to show the image preview if needed */}
                  {/* {floor.floorImage && (
                    <Image
                      source={{
                        uri: floor.floorImage.uri
                          ? floor.floorImage.uri
                          : floor.floorImage,
                      }}
                      style={{ width: 100, height: 100, marginTop: 10 }}
                    />
                  )} */}
                </View>
              ))}
  
              {/* Basements */}
              <TouchableOpacity
                style={[styles.btn, { marginBottom: 20, marginTop: 20 }]}
                onPress={addBasementDetail}
              >
                <Text style={styles.btntxt}>Add Basement Detail</Text>
              </TouchableOpacity>
  
              {/* Render Basement fields only if showBasementFields is true OR we have existing basements */}
              {showBasementFields &&
                selectedBasements.map((basement, index) => (
                  <View key={basement.id || `basement-${index}`} style={{ marginTop: 20 }}>
                    <Text style={styles.label}>Enter Basement Number</Text>
                    <TextInput
                      placeholder="Enter basement number"
                      style={styles.textfield}
                      keyboardType="numeric"
                      value={basement.basementNumber?.toString() || ""}
                      onChangeText={(text) => handleBasementNumberChange(text, index)}
                    />
                    <View style={styles.textfieldwrapper}>
                      <Text style={styles.label}>Basement {basement.basementNumber} Name</Text>
                      <TextInput
                        placeholder={`Enter name for Basement ${basement.basementNumber}`}
                        style={styles.textfield}
                        value={basement.basementName}
                        onChangeText={(text) => handleBasementNameChange(text, index)}
                      />
                    </View>
                    <TouchableOpacity style={styles.btn} onPress={() => selectImage("basement", index)}>
                      <Text style={styles.btntxt}>Upload Basement Image</Text>
                    </TouchableOpacity>
                    {/* Uncomment below to show the image preview if needed */}
                    {/* {basement.basementImage && (
                      <Image
                        source={{
                          uri: basement.basementImage.uri
                            ? basement.basementImage.uri
                            : basement.basementImage,
                        }}
                        style={{ width: 100, height: 100, marginTop: 10 }}
                      />
                    )} */}
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

export default EditBuilding;
