import {useForm, Controller} from 'react-hook-form';
import {useUser} from '../hooks/ApiHooks';
import {useContext} from 'react';
import {MainContext} from '../contexts/MainContext';
import {Card, Input, Button} from '@rneui/themed';
import { Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView  } from 'react-native';
import {PropTypes} from 'prop-types';

// RegisterForm Component for User Registration
const RegisterForm = ({setToggleRegister}) => {
  // Fetch user related functions from ApiHooks
  const {postUser, checkUsername} = useUser();

  // Fetching user-related state methods from MainContext
  const {setIsLoggedIn, setUser} = useContext(MainContext);

  // Setting up form controls and validation using react-hook-form
  const {
    control,
    handleSubmit,
    getValues,
    formState: {errors},
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
      email: '',
      full_name: '',
    },
    mode: 'onBlur',
  });

  // Function to handle user registration
  const register = async (userData) => {
    try {
      // Removing the confirm_password field as we don't need it for registration API
      delete userData.confirm_password;

      // Making API call to register the user
      const registerResponse = await postUser(userData);
      Alert.alert('Success', registerResponse.message);
      // Switching back to login form after successful registration
      setToggleRegister(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  return (

    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <Card containerStyle={styles.card}>
      <Card.Title>Register</Card.Title>
      <Controller
        control={control}
        rules={{
          required: {value: true, message: 'username is required'},
          minLength: {value: 3, message: 'min length is 3 characters'},
          validate: async (value) => {
            try {
              const isAvailable = await checkUsername(value);
              return isAvailable ? isAvailable : 'Username taken';
            } catch (error) {
              Alert.alert('Username is taken')
            }
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            placeholder="Username"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            errorMessage={errors.username?.message}
            inputStyle={styles.input}
          />
        )}
        name="username"
      />

      <Controller
        control={control}
        rules={{
          required: {value: true, message: 'password is required'},
          minLength: {value: 5, message: 'min lenght is 5 characters'},
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            placeholder="password"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.password?.message}
            inputStyle={styles.input}
          />
        )}
        name="password"
      />
      <Controller
        control={control}
        rules={{
          required: {value: true, message: 'password is required'},
          validate: (value) => {
            const {password} = getValues();
            return value === password ? true : 'Passwords dont match';
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            placeholder="Confirm password"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.confirm_password?.message}
            inputStyle={styles.input}
          />
        )}
        name="confirm_password"
      />

      <Controller
        control={control}
        rules={{
          required: {value: true, message: 'email is required'},
          pattern: {
            value: /\S+@\S+\.\S+$/,
            message: 'must be valid email',
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            placeholder="email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.email?.message}
            inputStyle={styles.input}
          />
        )}
        name="email"
      />

      <Controller
        control={control}
        rules={{
          minLength: {value: 3, message: 'min length is 3 characters'},
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            placeholder="fullname (optional)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.full_name?.message}
            inputStyle={styles.input}
          />
        )}
        name="full_name"
      />

      <Button
        title="Submit"
        onPress={handleSubmit(register)}
        buttonStyle={styles.button}
      />
    </Card>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
  },
  button: {
    height: 50,
    backgroundColor: '#FF385C',
    borderRadius: 10,
    marginTop: 20,
  },
  input: {

  },
});

RegisterForm.propTypes = {
  setToggleRegister: PropTypes.func,
};

export default RegisterForm;
