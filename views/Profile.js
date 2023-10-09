import {useContext, useState, useEffect} from 'react';
import {MainContext} from '../contexts/MainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Icon} from '@rneui/themed';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  Text,
  Platform,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';
import {useTag, useMedia} from '../hooks/ApiHooks';
import {placeholderImage} from '../utils/app-config';
import ProfileForm from '../components/ProfileForm';
import * as ImagePicker from 'expo-image-picker';
import {mediaUrl} from '../utils/app-config';
import {Modal} from 'react-native';
import {Video} from 'expo-av';


const Profile = ({navigation}) => {
  const {setIsLoggedIn, user, update, token} = useContext(MainContext);
  const [avatar, setAvatar] = useState(placeholderImage);
  const {postTag, getFilesByTag} = useTag();
  const [modalVisible, setModalVisible] = useState(false);
  const {postMedia, mediaArray, loadMedia, deleteMedia} = useMedia(true, true);
  const [expandedImage, setExpandedImage] = useState(null);
  const [filteredMediaArray, setFilteredMediaArray] = useState([]);
  const [chunkedData, setChunkedData] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const logOut = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to log out?',
      [
        {
          text: 'Yes',
          onPress: async () => {
            console.log(setIsLoggedIn);
            try {
              await AsyncStorage.clear();
              setIsLoggedIn(false);
            } catch (error) {
              console.error(error);
            }
          }
        },
        {
          text: 'Cancel',
          onPress: () => {
          },
          style: 'cancel'
        }
      ],
      {cancelable: false}
    );
  };

  const handleAvatarPress = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Sorry',
        'We need camera roll permissions to make this work!'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const avatarUri = result.assets[0].uri;
      setAvatar({uri: avatarUri});
      await uploadAvatar(avatarUri);
      await loadAvatar();
    }
  };
  const uploadAvatar = async (uri) => {
    const formData = new FormData();

    const filename = uri.split('/').pop();
    let fileExtension = filename.split('.').pop();
    fileExtension = fileExtension === 'jpg' ? 'jpeg' : fileExtension;

    formData.append('file', {
      uri: uri,
      name: filename,
      type: `image/${fileExtension}`
    });

    formData.append('description', 'avatar');

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await postMedia(formData, token);
      console.log('Server Response:', response);
      console.log('user from mainContext: ', user);

      await postTag(
        {file_id: response.file_id, tag: 'avatar_' + user.user_id},
        token
      );
      Alert.alert('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert(
        'Upload error',
        'There was an error uploading the avatar. Please try again later.'
      );
    }
    setRefreshFlag(prevFlag => !prevFlag);
  };
  const loadAvatar = async () => {
    try {
      const avatars = await getFilesByTag('avatar_' + user.user_id);
      if (avatars.length > 0) {
        setAvatar(mediaUrl + avatars.pop().filename);
      } else {
        setAvatar('../assets/avatar.png');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isVideoFile = (filename) => {
    const ext = filename.split('.').pop();
    return ['mp4', 'mov', 'm4v', '3gp', 'avi'].includes(ext);
  };

  const handleImageClick = (item) => {
    if (isVideoFile(item.filename)) {
      // This will be used to differentiate between an image and a video in your modal
      item.isVideo = true;
    }
    setExpandedImage(item);
  };

  const handleDeleteMedia = async (fileId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const result = await deleteMedia(fileId, token);
      if (result) {
        // Close the expanded image view after deletion
        setExpandedImage(null);
        // Reload media to show the updated list without the deleted image
        loadMedia(user.user_id);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      // Handle error, maybe show a toast or alert to the user
    }
    setRefreshFlag(prevFlag => !prevFlag);
  };

  const chunkArray = (array, chunkSize) => {
    const results = [];
    while (array.length) {
      results.push(array.splice(0, chunkSize));
    }
    return results;
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadAvatar();
      await loadMedia(user.user_id);
    };
    fetchData();
  }, []);

  useEffect(() => {
    loadAvatar();
    loadMedia(user.user_id);
  }, [refreshFlag]);

  useEffect(() => {
    setFilteredMediaArray(mediaArray.filter(item =>
      item.description !== 'avatar'
    ));
    setChunkedData(chunkArray([...filteredMediaArray], 3));
  }, [mediaArray]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
    >
      <ScrollView
        style={{backgroundColor: 'black', flexGrow: 1, paddingTop: 25}}
        keyboardShouldPersistTaps='handled'
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginTop: 40,
          paddingRight: 20
        }}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name='settings' color='white' />
          </TouchableOpacity>
        </ View>
        <View style>
          <TouchableOpacity onPress={handleAvatarPress}>
            <Image
              source={{uri: avatar}}
              style={{
                width: 115,
                height: 115,
                borderRadius: 50,
                alignSelf: 'center'
              }}
            />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 10,
            color: 'white',
            alignSelf: 'center'
          }}
        >
          {user.username}
        </Text>
        <Text style={{
          fontSize: 16,
          color: 'white',
          marginBottom: 10,
          alignSelf: 'center'
        }}>
          {user.full_name}
        </Text>
        <Modal
          animationType='slide'
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={{
              width: '90%',
              maxHeight: '80%',
              backgroundColor: 'black',
              padding: 20,
              borderRadius: 10
            }}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{color: 'white'}}>X</Text>
              </TouchableOpacity>
              <ProfileForm user={user} />
              <TouchableOpacity
                style={{
                  backgroundColor: '#FF385C',
                  paddingVertical: 15,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10
                }}
                onPress={logOut}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginRight: 10
                  }}
                >
                  Log out!
                </Text>
                <Icon name='logout' color='white' />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        <View style={{flex: 1}}>
          {chunkedData.map((row, rowIndex) => (
            <View key={rowIndex}
                  style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
              {row.map((item) => (
                <View key={item.file_id} style={{width: '33.33%', padding: 5}}>
                  <TouchableOpacity onPress={() => handleImageClick(item)}>
                    {isVideoFile(item.filename) ? (
                      <Video
                        source={{uri: mediaUrl + item.filename}}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode='cover' // or 'contain' based on your preference
                        shouldPlay={false}
                        style={{width: '100%', aspectRatio: 1}}
                      />
                    ) : (
                      <Image
                        source={{uri: mediaUrl + item.filename}}
                        style={{width: '100%', aspectRatio: 1}}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </View>
        <Modal
          animationType='slide'
          transparent={true}
          visible={!!expandedImage}
          onRequestClose={() => setExpandedImage(null)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}>
            <View
              style={{width: '90%', maxHeight: '80%', alignItems: 'center'}}>
              <TouchableOpacity onPress={() => setExpandedImage(null)}>
                <Text style={{
                  color: 'white',
                  fontSize: 24,
                  alignSelf: 'flex-end'
                }}>X</Text>
              </TouchableOpacity>
              {expandedImage && !expandedImage.isVideo && (
                <Image
                  source={{uri: mediaUrl + expandedImage.filename}}
                  style={{
                    width: '90%',
                    height: '60%',
                    resizeMode: 'contain'
                  }}
                />
              )}
              {expandedImage && expandedImage.isVideo && (
                <Video
                  source={{uri: mediaUrl + expandedImage.filename}}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode='contain'
                  shouldPlay
                  useNativeControls // Allow user to control video playback
                  style={{
                    width: '80%',
                    height: '90%'
                  }}
                />
              )}
              <TouchableOpacity
                style={{
                  marginTop: 20,
                  backgroundColor: '#FF385C',
                  padding: 10,
                  borderRadius: 5
                }}
                onPress={() => handleDeleteMedia(expandedImage.file_id)}
              >
                <Text style={{color: 'white'}}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

Profile.propTypes = {
  navigation: PropTypes.object
};

export default Profile;
