import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Base_url} from "../utils/ApiKey";



// GetIcon Api list
const getIcon = createAsyncThunk('getIcon',async(_,{rejectWithValue})=>{
    try {
        //Get tokenfrom AsyncStore
        let token = await AsyncStorage.getItem('token')
        if(!token){
            return rejectWithValue('No token found');
        }
        //Get Icon list from API
        const res = await axios({
            method: 'GET',
            url: Base_url.geticons,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
        })
        //Log the data fetched from the API
        console.log("Fetched Icon data",res.data.data)
        return res.data.data;
    } catch (error) {
     console.log(error);   
    }
});


const GetIconSlice = createSlice({
    name:'GetIcon',
    initialState:{
        data:[],
        loading:false,
        error:'',
        },
        extraReducers: (builder) => {
            builder
            .addCase(getIcon.pending, (state) => {
                state.loading = true;
                state.error = '';
                })
                .addCase(getIcon.fulfilled, (state, action) => {
                    state.data = action.payload;
                    console.log('Building data fetched successfully:', action.payload);
                    state.loading = false;
                    })
                    .addCase(getIcon.rejected, (state, action) => {
                        state.error = action.payload;
                        state.loading = false;
                        })
                        },

});

export {getIcon};
export default GetIconSlice.reducer;