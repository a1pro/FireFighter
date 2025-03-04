import React from "react";
import SplashScreen from "../screens/SplachScreen";
import Signup from "../Signup/Signup";
import Login from "../Login/Login";
import ForgetPassword from "../ForgetPassword/ForgetPassword";
import BottomTabNavigation from "./BottomTabNavigation";
import AddBuilding from "../AddBuilding/AddBuilding";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OTPScreen from "../RegisterOTPScreen/OTPScreen";
import BuildingDetails from "../FloorsDetails/BuildingDetails";
import FloorDetails from "../FloorsDetails/FloorDetails";
import Maps from "../screens/Maps/Maps";
import ForgetPasswordOtp from "../ForgetPassword/ForgetPasswordOtp";
import ResetPassword from "../ForgetPassword/ResetPassword";
import Gallery from "../Gallery/Gallery";
import ImageSlider from "../Gallery/ImageSlider";

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SplachScreen"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Maps"
        component={Maps}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Forgetpassword"
        component={ForgetPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={BottomTabNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddBuilding"
        component={AddBuilding}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="OTPScreen"
        component={OTPScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FloorDetails"
        component={FloorDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BuildingDetails"
        component={BuildingDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgetPasswordOtp"
        component={ForgetPasswordOtp}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Gallery"
        component={Gallery}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ImageSlider"
        component={ImageSlider}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
export default StackNavigation;
