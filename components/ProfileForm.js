import React, {useContext} from 'react';
import {Alert, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import {MainContext} from '../contexts/MainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useUser } from '../hooks/ApiHooks';
import { Controller, useForm } from 'react-hook-form';
import { Input, Button, Card,} from '@rneui/themed';



const ProfileForm = ({user}) => {
  const {putUser, checkUsername, getUserByToken} = useUser();
  const {setUser} = useContext(MainContext);
  const {
    control,
    handleSubmit,
    getValues,
    formState: {errors},
  } = useForm({
    defaultValues: {...user, username: '', password: '', confirm_password: ''},
    mode: 'onBlur',
  });

  const update = async (updateData) => {
    console.log('Updating: ', updateData);
    try {
      delete updateData.confirm_password;
      // poistetaan tyhjät arvot
      for (const [i, value] of Object.entries(updateData)) {
        console.log(i, value);
        if (value === '') {
          delete updateData[i];
        }
      }
      const token = await AsyncStorage.getItem('userToken');
      const updateResult = await putUser(updateData, token);
      console.log('registeration result', updateResult);
      Alert.alert('Success', updateResult.message);
      // setToggleRegister(false);
      // päivitä käyttäjän tiedot ruudulla
      const userData = await getUserByToken(token);
      setUser(userData);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  return (
    <Card containerStyle={Styles.card}>
      <Card.Title style={Styles.Title}>Update Profile</Card.Title>
      <Controller
        control={control}
        rules={{
          minLength: {value: 3, message: 'min length is 3 characters'},
          validate: async (value) => {
            try {
              if (value.length < 3) {
                return;
              }
              const isAvailable = await checkUsername(value);
              console.log('username available?', value, isAvailable);
              return isAvailable ? isAvailable : 'Username taken';
            } catch (error) {
              console.error(error);
            }
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            style={Styles.Input}
            placeholderTextColor="#888"
            placeholder="Username"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.username?.message}
            autoCapitalize="none"
          />
        )}
        name="username"
      />
      <Controller
        control={control}
        rules={{
          minLength: {value: 5, message: 'min length is 5 characters'},
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            style={Styles.Input}
            placeholderTextColor="#888"
            placeholder="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry={true}
            errorMessage={errors.password?.message}
          />
        )}
        name="password"
      />
      <Controller
        control={control}
        rules={{
          validate: (value) => {
            const {password} = getValues();
            // console.log('getValues password', password);
            return value === password ? true : 'Passwords dont match!';
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            style={Styles.Input}
            placeholderTextColor="#888"
            placeholder="Confirm password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry={true}
            errorMessage={errors.confirm_password?.message}
          />
        )}
        name="confirm_password"
      />
      <Controller
        control={control}
        rules={{
          pattern: {
            value: /\S+@\S+\.\S+$/,
            message: 'must be a valid email',
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            style={Styles.Input}
            placeholderTextColor="#888"
            placeholder="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.email?.message}
            autoCapitalize="none"
          />
        )}
        name="email"
      />
      <Controller
        control={control}
        rules={{minLength: {value: 3, message: 'min length is 3 characters'}}}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            style={Styles.Input}
            placeholder="Full name"
            placeholderTextColor="#888"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.full_name?.message}
          />
        )}
        name="full_name"
      />
      <Button   title="Update!"
                onPress={handleSubmit(update)}
                buttonStyle={Styles.Button}
                titleStyle={Styles.buttonText}
      />
    </Card>
  );
};
const Styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  Title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFF',
  },
  Input: {
    backgroundColor: '#000',
    color: '#FFF',
    marginBottom: 10,
  },
  Button: {
    backgroundColor: '#FF385C', // button's background color
    borderRadius: 10, // border radius for rounded corners
    paddingVertical: 15, // Increase the vertical padding
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white', // text color
    fontSize: 16, // Adjust the font size
    textAlign: 'center', // Center the text within the button
  },
});

ProfileForm.propTypes = {
  user: PropTypes.object,
};

export default ProfileForm;
