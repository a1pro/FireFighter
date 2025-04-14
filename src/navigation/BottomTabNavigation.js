import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { View,Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Home/Home';
import Profile from '../Profile/Profile';
import Maps from '../screens/Maps/Maps';
import Faq from '../Faq/Faq';


const Tab = createBottomTabNavigator();

const BottomTabNavigation = () => {
  return (
    <Tab.Navigator
      tabBarHideOnKeyboard={true}
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#CE2127',
        tabBarInactiveTintColor: '#000000',
        tabBarStyle: {
          paddingTop: 15,
          paddingBottom: 5,
          height: 80
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let IconComponent;

          if (route.name === 'Home') {
            iconName = 'home';
            IconComponent = Icon;
          } else if (route.name === 'Maps') {
            iconName = 'google-maps';
            IconComponent = MaterialCommunityIcons;
          } else if (route.name ==="Faq"){
            return(
              <Image source={require('../assets/faq.png')} style={{width:focused ? 30:25,height:focused ? 30:25,resizeMode:"contain"}}/>
            )
          }
           else if (route.name === 'Profile') {
            iconName = 'user-large';
            IconComponent = FontAwesome6;
          }

          return (
            <View>
              <IconComponent name={iconName} size={28} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Maps"
        component={Maps}
        options={{
          headerShown: false,
        }}
      />
         <Tab.Screen 
      name='Faq'
      component={Faq}
      options={{headerShown:false}}/>
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
