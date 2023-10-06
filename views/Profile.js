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
  Alert,
} from 'react-native';
import PropTypes from 'prop-types';
import {useTag, useMedia} from '../hooks/ApiHooks';
import {placeholderImage} from '../utils/app-config';
import ProfileForm from '../components/ProfileForm';
import * as ImagePicker from 'expo-image-picker';
import {mediaUrl} from '../utils/app-config';
import { Modal } from 'react-native';

const Profile = ({navigation}) => {
  const {setIsLoggedIn, user} = useContext(MainContext);
  const [avatar, setAvatar] = useState(placeholderImage);
  const {postMedia} = useMedia();
  const {postTag, getFilesByTag} = useTag();
  const [userFiles, setUserFiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
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
          onPress: () => {},
          style: 'cancel'
        }
      ],
      { cancelable: false }
    );
  };

  const handleAvatarPress = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Sorry',
        'We need camera roll permissions to make this work!',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
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
      type: `image/${fileExtension}`,
    });

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await postMedia(formData, token);
      console.log('Server Response:', response);
      console.log('user from mainContext: ', user);

      await postTag(
        {file_id: response.file_id, tag: 'avatar_' + user.user_id},
        token,
      );
      Alert.alert('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert(
        'Upload error',
        'There was an error uploading the avatar. Please try again later.',
      );
    }
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
  useEffect(() => {
    loadAvatar();
  }, []);

  useEffect(() => {
    const loadUserFiles = async () => {
      try {
        console.log('Loading user files', user);
        const files = await getFilesByTag('file_' + user.user_id);
        setUserFiles(files);
      } catch (error) {
        console.error("Error loading user's files:", error);
      }
    };
    loadUserFiles();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
    >
      <ScrollView
        style={{backgroundColor: 'black', flexGrow: 1, paddingTop: 25}}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 40, paddingRight: 20,}}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="settings" color="white" />
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
                alignSelf: 'center',
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
            alignSelf: 'center',
          }}
        >
          {user.username}
        </Text>
        <Text style={{fontSize: 16, color: 'white', marginBottom: 10, alignSelf: 'center'}}>
          {user.full_name}
        </Text>
        <View style={{marginTop: 20}}>
          {userFiles.map((file, index) => (
            <View key={index} style={{marginBottom: 10}}>
              <Image
                source={{uri: mediaUrl + file.filename}}
                style={{width: 100, height: 100, zIndex: 2,}} // Adjust size to your preference
              />
            </View>
          ))}
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <TouchableOpacity
            style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)'}}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={{width: '90%', maxHeight: '80%', backgroundColor: 'black', padding: 20, borderRadius: 10}}>
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
                  marginTop: 10,
                }}
                onPress={logOut}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginRight: 10,
                  }}
                >
                  Log out!
                </Text>
                <Icon name="logout" color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

Profile.propTypes = {
  navigation: PropTypes.object,
};

export default Profile;
