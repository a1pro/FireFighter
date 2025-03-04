import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import styles from "../screens/styles/Styles";
import { Picker } from "@react-native-picker/picker";
import { launchImageLibrary } from "react-native-image-picker";
import { Formik } from "formik";
import * as Yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Base_url } from "../utils/ApiKey";

// Validation Schema
const validationSchema = Yup.object().shape({
  buildingAddress: Yup.string().required("Building address is required"),
  zipcode: Yup.string().required("Zip code is required"),
  suiteNumber: Yup.string().required("Suite/Unit number is required"),
  buildingName: Yup.string().required("Building name is required"),
  totalFloors: Yup.number()
    .min(1, "Must be at least 1 floor")
    .required("Total floors are required"),
  totalBasements: Yup.number().min(0, "Basements cannot be negative"),
});

const AddBuilding = ({ navigation }) => {
  const [selectedFloors, setSelectedFloors] = useState([]); // This stores added floor details
  const [selectedBasements, setSelectedBasements] = useState([]); // This stores added basement details
  const [floorDetails, setFloorDetails] = useState({}); // This stores floor details (name, image)
  const [basementDetails, setBasementDetails] = useState({}); // This stores basement details (name, image)
  const [loading, setLoading] = useState(false);

  // Convert value to number safely
  const getNumber = (value) => {
    const num = parseInt(value, 10);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  // Add Floor Detail function (this will add an entry for each floor)
  const addFloorDetail = () => {
    setSelectedFloors([...selectedFloors, { floorNumber: selectedFloors.length + 1 }]);
  };

  // Add Basement Detail function (this will add an entry for each basement)
  const addBasementDetail = () => {
    setSelectedBasements([...selectedBasements, { basementNumber: selectedBasements.length + 1 }]);
  };

  // Handle image selection for floors and basements
  const selectImage = (type, number) => {
    launchImageLibrary({ mediaType: "photo", quality: 0.5 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Error", response.errorMessage);
        return;
      }
      const image = response.assets[0];
      if (type === "floor") {
        setFloorDetails({ ...floorDetails, [number]: { ...floorDetails[number], image } });
      } else {
        setBasementDetails({ ...basementDetails, [number]: { ...basementDetails[number], image } });
      }
    });
  };

  // handleSubmit function
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Create FormData to send images and data
      const formData = new FormData();
      formData.append("building_name", values.buildingName);
      formData.append("zipcode", values.zipcode);
      formData.append("suite_number", values.suiteNumber);
      formData.append("building_address", values.buildingAddress);
      formData.append("total_floor", values.totalFloors);
      formData.append("total_basement", values.totalBasements);

      selectedFloors.forEach((floor) => {
        formData.append("floor_name[]", floorDetails[floor.floorNumber]?.name || "");
        const floorImage = floorDetails[floor.floorNumber]?.image;
        if (floorImage) {
          formData.append("floor_image[]", {
            uri: floorImage.uri,
            type: floorImage.type || "image/jpeg",
            name: floorImage.fileName || `floor${floor.floorNumber}.jpg`,
          });
        }
      });

      selectedBasements.forEach((basement) => {
        formData.append("basement_name[]", basementDetails[basement.basementNumber]?.name || "");
        const basementImage = basementDetails[basement.basementNumber]?.image;
        if (basementImage) {
          formData.append("basement_image[]", {
            uri: basementImage.uri,
            type: basementImage.type || "image/jpeg",
            name: basementImage.fileName || `basement${basement.basementNumber}.jpg`,
          });
        }
      });

      const res = await axios({
        method: "POST",
        url: Base_url.addbuilding,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success === true) {
        setLoading(false);
        Alert.alert(res.data.message);
        console.log(res.data.message);
        navigation.navigate("Home");
      } else {
        setLoading(false);
        Alert.alert("Error", "Failed to add building. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  return (
    <Formik
      initialValues={{
        buildingAddress: "",
        zipcode: "",
        suiteNumber: "",
        buildingName: "",
        totalFloors: "1",
        totalBasements: "0",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => {
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
                  onChangeText={handleChange("buildingAddress")}
                  onBlur={handleBlur("buildingAddress")}
                />
                {touched.buildingAddress && errors.buildingAddress && (
                  <Text style={styles.errortext}>{errors.buildingAddress}</Text>
                )}
              </View>

              {/* Zip Code */}
              <View style={styles.textfieldwrapper}>
                <Text style={styles.label}>Zip Code</Text>
                <TextInput
                  placeholder="Enter zip code"
                  style={styles.textfield}
                  placeholderTextColor="#BABFC5"
                  value={values.zipcode}
                  onChangeText={handleChange("zipcode")}
                  onBlur={handleBlur("zipcode")}
                />
                {touched.zipcode && errors.zipcode && (
                  <Text style={styles.errortext}>{errors.zipcode}</Text>
                )}
              </View>

              {/* Suite/Unit Number */}
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

              {/* Add Floor Detail Button (Always visible) */}
              <TouchableOpacity style={styles.btn} onPress={addFloorDetail}>
                <Text style={styles.btntxt}>Add Floor Detail</Text>
              </TouchableOpacity>

              {/* Render Floor Number and Floor Name Fields */}
              {selectedFloors.map((floor, index) => (
                <View key={index} style={{ marginTop: 20 }}>
                  <Text style={styles.label}>Enter Floor Number</Text>
                  <TextInput
                    placeholder="Enter floor number"
                    style={styles.textfield}
                    keyboardType="numeric"
                    value={floor.floorNumber.toString()}
                    onChangeText={(text) => {
                      const floorNumber = getNumber(text);  // Safely convert the input to a number
                      setSelectedFloors((prevFloors) => {
                        const updatedFloors = [...prevFloors];
                        updatedFloors[index] = { ...updatedFloors[index], floorNumber }; // Update the specific floor entry
                        return updatedFloors;
                      });
                    }}
                  />

                  <View style={styles.textfieldwrapper}>
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
                  </View>

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

              {/* Add Basement Detail Button (Always visible) */}
              <TouchableOpacity style={[styles.btn,{marginBottom:20,marginTop:20}]} onPress={addBasementDetail}>
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
                      const basementNumber = getNumber(text);  // Safely convert the input to a number
                      setSelectedBasements((prevBasements) => {
                        const updatedBasements = [...prevBasements];
                        updatedBasements[index] = { ...updatedBasements[index], basementNumber }; // Update the specific basement entry
                        return updatedBasements;
                      });
                    }}
                  />

                  <View style={styles.textfieldwrapper}>
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
                  </View>

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
              <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
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
