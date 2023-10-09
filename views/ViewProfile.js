import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useUser, useMedia, useTag} from '../hooks/ApiHooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {mediaUrl} from '../utils/app-config';
import avatarImage from '../assets/avatar.png';
import {Video, Audio} from 'expo-av';
import audioImage from '../assets/audio.png';

export default function ViewProfile({route}) {
  const {userId} = route.params; // Assuming you're passing 'userId' as a parameter

  const {getUserById} = useUser();
  const {loadUserMedia} = useMedia();
  const {getFilesByTag} = useTag();

  const [userData, setUserData] = useState({});
  const [userMedia, setUserMedia] = useState([]);
  const [avatar, setAvatar] = useState(avatarImage);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [audioPlayback, setAudioPlayback] = useState(null);

  const openModal = (media) => {
    setSelectedMedia(media);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setModalVisible(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const data = await getUserById(userId, token);
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUserMedia = async () => {
      try {
        let media = await loadUserMedia(userId);
        media = media.filter((item) => !item.mime_type.startsWith('audio/'));
        setUserMedia(media);
      } catch (error) {
        console.error('Error fetching user media:', error);
      }
    };

    const loadAvatar = async () => {
      try {
        const avatars = await getFilesByTag('avatar_' + userId);
        if (avatars.length > 0) {
          setAvatar({uri: mediaUrl + avatars.pop().filename});
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserData();
    fetchUserMedia();
    loadAvatar();
  }, []);

  console.log('userId', userId);
  console.log('userData', userData);
  console.log('userMedia', userMedia);
  const determineMediaType = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.startsWith('video/')) {
      return 'video';
    } else if (mimeType.startsWith('audio/')) {
      return 'audio';
    }
    return 'unknown';
  };

  const renderMedia = (media, isModalMedia = false) => {
    if (!media) return null;

    const mediaType = determineMediaType(media.mime_type);

    switch (mediaType) {
      case 'image':
        return (
          <Image
            source={{uri: mediaUrl + media.filename}}
            style={Modal ? styles.modalImage : styles.image}
            resizeMode="cover"
          />
        );
      case 'video':
        return (
          <Video
            source={{uri: mediaUrl + media.filename}}
            style={Modal ? styles.modalVideo : styles.video}
            controls={true}
            resizeMode="cover"
            shouldPlay
            isLooping={true}
            isMuted={!isModalMedia || !modalVisible} // Only unmute if it's the modal media and the modal is visible
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.titleBar}>
          <Ionicons name="ios-arrow-back" size={24} color="#fff"></Ionicons>
          <Ionicons name="ios-add" size={24} color="#fff"></Ionicons>
        </View>

        <View style={{alignSelf: 'center'}}>
          <View style={styles.profileImage}>
            <Image
              source={avatar.uri ? avatar : avatarImage}
              style={styles.image}
              resizeMode="center"
            ></Image>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.text, {fontWeight: '200', fontSize: 36}]}>
            {userData.username}
          </Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statsBox}>
            <Text style={[styles.text, {fontSize: 24}]}>
              {userMedia.length}
            </Text>
            <Text style={[styles.text, styles.subText]}>media</Text>
          </View>
        </View>
        <View style={styles.album}>
          <Text style={[styles.text, {fontSize: 30, color: '#3D3D3D'}]}></Text>
        </View>
        <View style={{marginTop: 32}}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {userMedia.map((media) => (
              <TouchableOpacity
                key={media.filename}
                onPress={() => openModal(media)}
              >
                <View style={styles.mediaContainer}>{renderMedia(media)}</View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="ios-close" size={48} color="#fff" />
          </TouchableOpacity>
          {selectedMedia && renderMedia(selectedMedia, true)}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  text: {
    fontFamily: 'HelveticaNeue',
    color: '#fff',
  },
  subText: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '500',
    color: '#fff',
  },
  image: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginHorizontal: 16,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    overflow: 'hidden',
    borderColor: 'white',
    borderWidth: 2,
  },
  album: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 32,
    marginBottom: 5,
  },
  statsBox: {
    alignItems: 'center',
  },
  mediaImageContainer: {
    width: 180,
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 15,
    borderColor: 'white',
  },
  video: {
    width: 180,
    height: 250,
  },
  mediaContainer: {
    width: 180,
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 15,
    borderColor: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
  modalVideo: {
    width: '100%',
    height: '80%',
  },
});

ViewProfile.propTypes = {
  navigation: PropTypes.object,
};
