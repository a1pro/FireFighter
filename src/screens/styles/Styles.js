import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
  },
  scrollContainer:{
    flexGrow:1
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: '#21252C',
  },
  h2: {
    fontSize: 28,
    fontWeight: '400',
    color: '#ffff',
    lineHeight: 35,
  },
  h3: {
    fontSize: 20,
    fontWeight: '500',
    color: '#ffff',
  },
  h4: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 30,
    color:'#000',
  },
  h5: {
    fontSize: 18,
    fontWeight: '500',
    color:'#ffff',
  },
  h6: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#000000',
    marginTop: 10,
  },
  btn: {
    fontWeight: '500',
    padding: 15,
    borderRadius:8,
    backgroundColor: '#942420',
    // width: 233,
    paddingTop:15,
    paddingBottom:15
  },
  btntxt:{
    color:'#ffff',
    textAlign:'center',
    fontWeight:'700',
    fontSize:17,
  },
  textfield:{
    backgroundColor:'#ffff',
    borderRadius:8,
    fontSize:16,
    borderWidth:1,
    borderColor:'#BABFC5',
    marginTop:8,
    paddingLeft:15
  },
  textfieldwrapper:{
    width: '100%',
    marginBottom: 15,
  },
  label:{
    fontSize:16,
    color:'#21252C',
    fontWeight:'600'
  },
  errortext:{
    color:'red',
    fontWeight:'500',
    fontSize:14,
    marginTop:5
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    margin: 5,
    borderColor:'#942420',
    color:'#000'
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 10,
  },
  iconImage: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  iconText: {
    fontSize: 14,
    color: '#333',
  },
  map: {
    flex: 1,  // Ensure it takes up the remaining space
    height: '100%',  // Optional if flex doesn't work
  },
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
    shadowOffset: { width: 1, height: 2 },
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#0A387E',
    padding: 6,
    borderRadius: 50,
  },

});
export default styles;
