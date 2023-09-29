import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import {mediaUrl} from '../utils/app-config';
import {FontAwesome} from '@expo/vector-icons'; // You can use any icon library you prefer
import React, {useContext, useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from '../hooks/ApiHooks';
import {MainContext} from '../contexts/MainContext';
import {Video} from 'expo-av';

const ListItem = ({singleMedia, navigation, userId}) => {
  const [owner, setOwner] = useState({});
  const {getUserById} = useUser();
  const {user} = useContext(MainContext);
  const videoRef = useRef(null);

  const deleteFile = async () => {
    // Implement your delete logic here
  };

  const modifyFile = async () => {
    // Implement your modify logic here
  };
  const fetchOwner = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const ownerData = await getUserById(userId, token);
      setOwner(ownerData);
    } catch (error) {
      console.error(error.message);
    }
  };

  const screenHeight = Dimensions.get('window').height - 200;
  const screenWidth = Dimensions.get('window').width;

  console.log('singleMedia', singleMedia);

  useEffect(() => {
    fetchOwner();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      horizontal={true}
      decelerationRate={0}
      snapToInterval={screenWidth}
      snapToAlignment={'center'}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => {
          navigation.navigate('Single', singleMedia);
        }}
      >
        {singleMedia.media_type === 'image' ? (
          <Image
            style={[
              styles.thumbnail,
              {width: screenWidth, height: screenHeight},
            ]}
            source={{uri: mediaUrl + singleMedia.filename}}
            resizeMode="cover"
          />
        ) : (
          <Video
            style={[
              styles.thumbnail,
              {width: screenWidth, height: screenHeight},
            ]}
            source={{uri: mediaUrl + singleMedia.filename}}
            useNativeControls={true}
            shouldPlay={true}
            isLooping={true}
            ref={videoRef}
          />
        )}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{owner.username}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {singleMedia.description}
          </Text>
        </View>
        {singleMedia.user_id === userId && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={modifyFile}>
              <FontAwesome name="pencil" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={deleteFile}
            >
              <FontAwesome name="trash" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  touchable: {
    paddingHorizontal: 16,
  },
  thumbnail: {
    width: '100%',
    flex: 1,
    zIndex: 2,
  },
  contentContainer: {},
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: 'white',
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gray',
  },
  deleteButton: {
    backgroundColor: 'red',
  },
});

ListItem.propTypes = {
  singleMedia: PropTypes.object,
  navigation: PropTypes.object,
  userId: PropTypes.number,
};

export default ListItem;
