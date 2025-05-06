import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  PermissionsAndroid,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Collapsible from 'react-native-collapsible';
import Voice from '@react-native-voice/voice';

const Faq = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    fetchFaqs();

    // Attach voice event handlers
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      // Clean up listeners
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const fetchFaqs = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('https://firefighter.a1professionals.net/api/v1/get/faq', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setFaqs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFaqs = (category) => {
    if (!faqs[category]) return [];
    return faqs[category].faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const toggleExpand = (faq_id) => {
    setExpandedFaq(expandedFaq === faq_id ? null : faq_id);
  };

  const onSpeechResults = (event) => {
    if (event.value && event.value.length > 0) {
      setSearchQuery(event.value[0]);
    }
    setIsRecording(false);
  };

  const onSpeechError = (error) => {
    console.error('Speech recognition error:', error);
    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Microphone permission denied');
          return;
        }
      }

      setIsRecording(true);
      await Voice.start('en-US');
    } catch (error) {
      console.error('Voice start error:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (error) {
      console.error('Voice stop error:', error);
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const renderItem = ({ item }) => (
    <View>
      <TouchableOpacity style={styles.item} onPress={() => toggleExpand(item.faq_id)}>
        <Text style={styles.itemText}>{item.question}</Text>
        <Icon name={expandedFaq === item.faq_id ? "chevron-down-outline" : "chevron-forward-outline"} size={20} color="#888" />
      </TouchableOpacity>
      <Collapsible collapsed={expandedFaq !== item.faq_id}>
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      </Collapsible>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.header}>FAQ’s</Text>

        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topic..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={handleMicPress}>
            <Icon name={isRecording ? "mic-off-outline" : "mic-outline"} size={24} color={isRecording ? 'red' : '#888'} />
          </TouchableOpacity>
        </View>

        {Object.keys(faqs).map(category => (
          <View key={category}>
            <Text style={styles.sectionHeader}>{faqs[category].category_name}</Text>
            <FlatList
              data={filterFaqs(category)}
              renderItem={renderItem}
              keyExtractor={item => item.faq_id.toString()}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 15
  },
  searchIcon: {
    marginRight: 5
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10
  },
  item: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2
  },
  itemText: {
    fontSize: 16,
    color: '#333'
  },
  answerContainer: {
    backgroundColor: '#E8E8E8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1
  },
  answerText: {
    fontSize: 14,
    color: '#555'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default Faq;
