import React, {useState} from 'react';
import {View, StyleSheet, TextInput, PanResponder} from 'react-native';
import MapView from 'react-native-maps';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  RotationGestureHandler,
} from 'react-native-gesture-handler';

const Maps = () => {
  // State for draggable icon position
  const [iconPosition, setIconPosition] = useState({x: 100, y: 100});

  // States for pinch-to-zoom and rotation
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // PanResponder for dragging the icon
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      setIconPosition({
        x: gestureState.moveX - 25, // Adjust for the center of the icon
        y: gestureState.moveY - 25,
      });
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Google Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        mapType="satellite"
      />
      {/* Search Bar for DOT/UN Placard Lookup */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Enter DOT/UN Placard"
          style={styles.searchBar}
        />
      </View>

      {/* Draggable, Rotatable, and Scalable Icon */}
      <PinchGestureHandler
        onGestureEvent={event => setScale(event.nativeEvent.scale)}>
        <RotationGestureHandler
          onGestureEvent={event => setRotation(event.nativeEvent.rotation)}>
          <View
            style={[
              styles.icon,
              {
                transform: [{scale}, {rotate: `${rotation}rad`}],
                top: iconPosition.y,
                left: iconPosition.x,
              },
            ]}
            {...panResponder.panHandlers}>
          </View>
        </RotationGestureHandler>
      </PinchGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  searchContainer: {
    position: 'absolute',
    top: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  searchBar: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: {width: 1, height: 2},
  },
  icon: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
});

export default Maps;
