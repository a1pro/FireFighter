import React, { useEffect, useState, useCallback } from "react";
import { FlatList, Image, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import styles from "../screens/styles/Styles";
import axios from "axios";
import { Base_url } from "../utils/ApiKey";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../component/Header";

const Gallery = ({ route, navigation }) => {
    const [galleryData, setGalleryData] = useState([]);
    const { id } = route.params;
    console.log("buildingID", id);


    const getGalleryapi = async () => {
        try {
            let token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
            const res = await axios({
                method: 'post',
                url: Base_url.getgallery,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    building_id: id
                }
            });

            if (res.data.success === true) {
                setGalleryData(res.data.data);
                console.log("GalleryData", res.data.data);
            } else {
                console.log("No gallery data found");
            }
        } catch (error) {
            console.error("Error fetching gallery data:", error);
        }
    };
    useEffect(() => {
        getGalleryapi();
    }, []);

    // Memoized navigate function
    const navigateToSlider = useCallback(
        (index) => {
            navigation.navigate('ImageSlider', { images: galleryData.map(img => img.image), initialIndex: index });
        },
        [galleryData, navigation]
    );

    // Render Gallery Item
    const renderGalleryData = ({ item, index }) => {
        return (
            <View style={{ flex: 1, margin: 10 }}>
                <TouchableOpacity onPress={() => navigateToSlider(index)}>
                    <View style={{
                        borderWidth: 2,
                        borderColor: '#942420',
                        borderRadius: 10,
                        padding: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden'
                    }}>
                        <View style={{ width: 100, height: 100 }}>
                            {item.image ? (
                                <Image
                                    source={{ uri: item.image }}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        resizeMode: 'cover'
                                    }}
                                />
                            ) : (
                                <View style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: '#ccc', // or use a placeholder image
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Text>No Image</Text>
                                </View>
                            )}
                        </View>
                        <Text style={{ marginTop: 10, textAlign: 'center' }}>{item.name}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <>
            <Header title="Gallery" />
            <View style={styles.container}>
                {galleryData.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#942420" />
                        <Text style={{ textAlign: 'center' }}>Loading...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={galleryData}
                        renderItem={renderGalleryData}
                        keyExtractor={(item, index) => `${item.name}-${index}`}
                        numColumns={3}
                        extraData={galleryData}
                    />
                )}
            </View>
        </>
    );
};

export default Gallery;
