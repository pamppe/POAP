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
import React, {useContext, useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from '../hooks/ApiHooks';
import {MainContext} from '../contexts/MainContext';
import {Video} from 'expo-av';

const ListItem = ({singleMedia, navigation, userId}) => {
  const [owner, setOwner] = useState({});
  const {getUserById} = useUser();
  const {user, height, currentVideo, setCurrentVideo} = useContext(MainContext);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  console.log('height', height);

  const togglePlayBack = () => {
    setIsPlaying(!isPlaying);
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

  const screenHeight = Dimensions.get('window').height - height;
  const screenWidth = Dimensions.get('window').width;

  console.log('singleMedia', singleMedia);

  useEffect(() => {
    fetchOwner();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      // currentVideo.pause();
      //setCurrentVideo(videoRef.current);
      if (isPlaying) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isPlaying]);
  return (
    <ScrollView
      style={styles.container}
      horizontal={false}
      decelerationRate={0}
      snapToInterval={screenHeight}
      snapToAlignment={'center'}
    >
      <View style={styles.mediaContainer}>
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
            resizeMode="cover"
            useNativeControls={true}
            isLooping={true}
            ref={videoRef}
            isMuted={false}
            shouldPlay={isPlaying}
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish && !status.isLooping) {
                togglePlayBack();
              }
            }}
          />
        )}

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{owner.username}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {singleMedia.description}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
  },
  mediaContainer: {
    position: 'relative',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 79,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 1,
  },
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
});

ListItem.propTypes = {
  singleMedia: PropTypes.object,
  navigation: PropTypes.object,
  userId: PropTypes.number,
};

export default ListItem;
