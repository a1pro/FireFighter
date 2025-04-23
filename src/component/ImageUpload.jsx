import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const ImageUpload = ({ visible, onClose, onImagesSelected }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const pickerOptions = {
    selectionLimit: 5,
    mediaType: 'photo',
  };

  const handleSelectedAssets = (assets) => {
    const imagesWithCaption = assets.map((asset) => ({
      ...asset,
      caption: '',
    }));
    setSelectedImages(imagesWithCaption);
    setShowPreviewModal(true);
  };

  const openGallery = () => {
    onClose();
    launchImageLibrary(pickerOptions, (response) => {
      if (response.assets) handleSelectedAssets(response.assets);
    });
  };

  const openCamera = () => {
    onClose();
    launchCamera({ mediaType: 'photo' }, (response) => {
      if (response.assets) handleSelectedAssets(response.assets);
    });
  };

  const updateCaption = (index, text) => {
    const updated = [...selectedImages];
    updated[index].caption = text;
    setSelectedImages(updated);
  };

  const removeImage = (indexToRemove) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    if (selectedImages.length > 0) {
      onImagesSelected(selectedImages); // 👈 Send to parent
    }
    setSelectedImages([]);
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.container}>
            <Text style={styles.title}>Upload Image</Text>
            <TouchableOpacity style={styles.button} onPress={openGallery}>
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={openCamera}>
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPreviewModal} transparent animationType="fade" onRequestClose={closePreview}>
        <View style={styles.previewOverlay}>
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Selected Images</Text>
            <ScrollView contentContainerStyle={styles.imageList}>
              {selectedImages.map((img, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removeIcon} onPress={() => removeImage(index)}>
                    <Text style={styles.removeIconText}>✖</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.captionInput}
                    placeholder="Enter caption"
                    value={img.caption}
                    onChangeText={(text) => updateCaption(index, text)}
                  />
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={closePreview}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    marginVertical: 5,
    backgroundColor: '#942420',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#942420',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  imageWrapper: {
    position: 'relative',
    margin: 5,
    alignItems: 'center',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(255,0,0,0.8)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIconText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  captionInput: {
    width: 100,
    marginTop: 5,
    padding: 3,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    textAlign: 'center',
  },
});

export default ImageUpload;
