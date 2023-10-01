import {useContext, useEffect, useState} from 'react';
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
} from 'react-native';
import PropTypes from 'prop-types';
import {useTag} from '../hooks/ApiHooks';
import {mediaUrl} from '../utils/app-config';
import ProfileForm from '../components/ProfileForm';


const Profile = ({navigation}) => {
  const [avatar, setAvatar] = useState()
  const {getFilesByTag} = useTag();
  const {setIsLoggedIn, user} = useContext(MainContext);
  const logOut = async () => {
    console.log('profile, logout');
    try {
      await AsyncStorage.clear();
      setIsLoggedIn(false);
    } catch (error) {
      console.error(error);
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
        <Image
          source={{ uri: avatar }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginTop: 20,
          }}
        />
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
