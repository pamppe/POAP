import React, {useContext, useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  TouchableOpacity,
  Keyboard,
  Platform, View, Text
} from 'react-native';
import PropTypes from 'prop-types';
import {MainContext} from '../contexts/MainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from '../hooks/ApiHooks';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import {Button} from '@rneui/themed';

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
        setIsLoggedIn(false);
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
      style={{flex: 1}}
      activeOpacity={1}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {toggleRegister ? (
          <RegisterForm setToggleRegister={setToggleRegister} />
        ) : (
          <LoginForm />
        )}
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: toggleRegister ? 'lightgray' : '#007BFF',
              padding: 10,
              borderRadius: 5,
              marginRight: 10,
              marginLeft: 145,
            }}
            onPress={() => {
              setToggleRegister(!toggleRegister);
            }}
          >
            <Text style={{ color: toggleRegister ? 'black' : 'white' }}>
              {toggleRegister ? 'Login' : 'Register'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableOpacity>
  );
};

Login.propTypes = {
  navigation: PropTypes.object,
};

export default Login;
