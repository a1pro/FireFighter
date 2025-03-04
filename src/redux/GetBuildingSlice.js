import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { Base_url } from '../utils/ApiKey';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get Building API list
const getBuilding = createAsyncThunk(
  'getBuilding',
  async (_, { rejectWithValue }) => {
    try {
      // Get token from AsyncStorage
      let token = await AsyncStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      // Make API call to get building data
      const res = await axios({
        method: 'GET',
        url: Base_url.getbuilding,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Log the data fetched from the API
      console.log('Fetched building data:', res.data.data);
      
      return res.data.data;
    } catch (error) {
      console.error('Error fetching buildings:', error);
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

const GetBuildingSlice = createSlice({
  name: 'GetBuilding',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBuilding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBuilding.fulfilled, (state, action) => {
        // Log the data when the action is fulfilled
        console.log('Building data fetched successfully:', action.payload);
        
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(getBuilding.rejected, (state, action) => {
        // Log the error when the action is rejected
        console.log('Error fetching building data:', action.payload || action.error.message);
        
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export { getBuilding };
export default GetBuildingSlice.reducer;
