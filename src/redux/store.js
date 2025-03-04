import {configureStore} from '@reduxjs/toolkit';
import BuildingReducer from './GetBuildingSlice';
import IconReducer from './GetIconsSlice';

const store = configureStore({
  reducer: {
    getbuildingdata: BuildingReducer,
    geticondata:IconReducer,
  },
});
export default store;