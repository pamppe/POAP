import React, {useContext, useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  TouchableOpacity,
  Keyboard,
  Platform,
  View,
  Text,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';
import {MainContext} from '../contexts/MainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from '../hooks/ApiHooks';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const Login = ({navigation}) => {
  // props is needed for navigation
  const {setIsLoggedIn, setUser} = useContext(MainContext);
  const {getUserByToken} = useUser();
  const [toggleRegister, setToggleRegister] = useState(false);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      // hardcoded token validation
      const userData = await getUserByToken(token);
      console.log('userdata', userData);
      if (userData) {
        setIsLoggedIn(true);
        setUser(userData);
      }
    } catch (error) {
      console.log('checkToken', error);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

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
            marginTop: 10,
          }}
          onPress={() => {
            setToggleRegister(!toggleRegister);
          }}
        >
          <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
            {toggleRegister ? 'Login' : 'Register'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableOpacity>
  );
};

Login.propTypes = {
  navigation: PropTypes.object,
};

export default Login;
