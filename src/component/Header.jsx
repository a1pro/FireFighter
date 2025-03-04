
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, View, Text } from "react-native"
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Header = ({title}) => {
    const navigation = useNavigation();
    return (
        <View style={{ flexDirection: 'row', marginBottom: 20, alignItems: 'center', width: '100%', backgroundColor: '#942420',paddingLeft:15,paddingBottom:10 }}>
            {/* Back Button */}
            <TouchableOpacity
                onPress={() => navigation.navigate("Home")}>
                <MaterialIcons name="arrow-back" size={25} color="#ffff" />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, textAlign: 'center',color:'#ffff',paddingLeft:30}}>{title}</Text>
        </View>
    );
}

export default Header;