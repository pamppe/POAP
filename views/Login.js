import React, {useContext, useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  TouchableOpacity,
  Keyboard,
  Platform,
  View,
  Text,
  Image, ScrollView
} from 'react-native';
import PropTypes from 'prop-types';
import {MainContext} from '../contexts/MainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from '../hooks/ApiHooks';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

// The Login component is responsible for managing user authentication state and transitions between login and registration views.
const Login = ({navigation}) => {
  // Using context to fetch global application state and functions.
  const {setIsLoggedIn, setUser} = useContext(MainContext);

  // Fetching user-related function from useUser custom hook.
  const {getUserByToken} = useUser();

  // State to toggle between login and registration views.
  const [toggleRegister, setToggleRegister] = useState(false);

  // Function to check if there's an existing user token and validate its authenticity.
  const checkToken = async () => {
    try {
      // Retrieving the token from AsyncStorage.
      const token = await AsyncStorage.getItem('userToken');

      // Fetching user data based on the retrieved token.
      const userData = await getUserByToken(token);
      console.log('userdata', userData);

      // If valid userData is returned, set the user as logged in and store the user data.
      if (userData) {
        setIsLoggedIn(true);
        setUser(userData);
      }
    } catch (error) {
      console.log('checkToken', error);
    }
  };

  // Using the useEffect hook to check the token on component mount.
  useEffect(() => {
    checkToken();
  }, []); // Empty dependency array ensures this hook runs once when the component is mounted.

  return (
    <TouchableOpacity
      onPress={() => Keyboard.dismiss()}
      style={{flex: 1, backgroundColor: 'white'}}
      activeOpacity={1}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1, backgroundColor: 'black'}}
      >
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <Image
              source={require('../assets/POAP.png')}
              style={{width: 380, height: 100}}
            />
            {toggleRegister ? (
              <RegisterForm setToggleRegister={setToggleRegister} />
            ) : (
              <LoginForm />
            )}
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: toggleRegister ? '#FF385C' : '#FF385C',
              paddingVertical: 15,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 40,
              marginBottom: 30,
              marginTop: 10
            }}
            onPress={() => {
              setToggleRegister(!toggleRegister);
            }}
          >
            <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
              {toggleRegister ? 'Login' : 'Register'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableOpacity>
  );
};

Login.propTypes = {
  navigation: PropTypes.object
};

export default Login;
