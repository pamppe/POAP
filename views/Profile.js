import { useContext, useState, useEffect } from 'react';
import { MainContext } from '../contexts/MainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from '@rneui/themed';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  Text,
  Platform,
  KeyboardAvoidingView, Alert
} from 'react-native';
import PropTypes from 'prop-types';
import { useTag, useMedia } from '../hooks/ApiHooks';
import { placeholderImage } from '../utils/app-config';
import ProfileForm from '../components/ProfileForm';
import * as ImagePicker from 'expo-image-picker';
import {mediaUrl} from '../utils/app-config';


const Profile = ({ navigation }) => {
  const { setIsLoggedIn, user } = useContext(MainContext);
  const [avatar, setAvatar] = useState(placeholderImage);
  const { postMedia } = useMedia();
  const {postTag,getFilesByTag} = useTag();

  const logOut = async () => {
    try {
      await AsyncStorage.clear();
      setIsLoggedIn(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAvatarPress = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry', 'We need camera roll permissions to make this work!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      let avatarUri = result.assets[0].uri;
      setAvatar({ uri: avatarUri });
      await uploadAvatar(avatarUri);
    }
  }
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
      console.log('user from mainContext: ', user)

        await postTag({ file_id: response.file_id, tag: 'avatar_' + user.user_id }, token);
        Alert.alert('Avatar uploaded successfully!');

    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Upload error', 'There was an error uploading the avatar. Please try again later.');
    }
  };
  const loadAvatar = async () => {
    try {
      const avatars = await getFilesByTag('avatar_' + user.user_id);
      if (avatars.length > 0) {
        setAvatar(mediaUrl + avatars.pop().filename);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    loadAvatar();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
    <ScrollView
      style={{ backgroundColor: 'black', flexGrow: 1}}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity onPress={handleAvatarPress}>
        <Image
          source={{uri: avatar}}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginTop: 20,
            alignSelf: 'center',
          }}
        />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10, color: 'white' }}>
          {user.username}
        </Text>
        <Text style={{ fontSize: 16, color: 'white', marginBottom: 10 }}>
          {user.full_name}
        </Text>
      </View>
      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#FF385C',
            paddingVertical: 15,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            navigation.navigate('My files');
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold',
              marginRight: 10,
            }}
          >
            My files
          </Text>
          <Icon name="storage" color="white" />
        </TouchableOpacity>
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
      <ProfileForm user={user} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

Profile.propTypes = {
  navigation: PropTypes.object,
};

export default Profile;
