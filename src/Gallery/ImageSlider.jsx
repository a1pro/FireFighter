import React, { useState } from 'react';
import { View, Image, StyleSheet, SafeAreaView, Dimensions, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const ImageSlider = ({ route }) => {
  const navigation = useNavigation();
  const { images, initialIndex = 0 } = route.params;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const translateX = useSharedValue(0);

  const showNextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const showPreviousImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      const threshold = width / 4;
      if (event.translationX < -threshold) {
        runOnJS(showNextImage)();
      } else if (event.translationX > threshold) {
        runOnJS(showPreviousImage)();
      }
      translateX.value = withSpring(0);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.imageContainer, animatedStyle]}>
            <Image source={{ uri: images[currentIndex] }} style={styles.image} />
          </Animated.View>
        </PanGestureHandler>

        {/* Image Index */}
        <View style={styles.indexContainer}>
          <Text style={styles.indexText}>{currentIndex + 1} / {images.length}</Text>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
  indexContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  indexText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default ImageSlider;
