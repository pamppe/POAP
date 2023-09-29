import {useForm, Controller} from 'react-hook-form';
import {useUser} from '../hooks/ApiHooks';
import {useContext} from 'react';
import {MainContext} from '../contexts/MainContext';
import {Card, Input, Button, Text} from '@rneui/themed';
import {Alert, StyleSheet} from 'react-native';
import {PropTypes} from 'prop-types';

const RegisterForm = ({setToggleRegister}) => {
  const {postUser, checkUserName} = useUser();
  const {setIsLoggedIn, setUser} = useContext(MainContext);

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

  const register = async (userData) => {
    try {
      delete userData.confirm_password;
      const registerResponse = await postUser(userData);
      console.log('postUser response', registerResponse);
      Alert.alert('Success', registerResponse.message);
      setToggleRegister(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Card containerStyle={styles.card}>
      <Card.Title>Register</Card.Title>
      <Controller
        control={control}
        rules={{
          required: {value: true, message: 'username is required'},
          minLength: {value: 3, message: 'min length is 3 characters'},
          validate: async (value) => {
            try {
              const isAvailable = await checkUserName(value);
              console.log('username available?', value);
              return isAvailable ? isAvailable : 'Username taken';
            } catch (error) {
              console.error(error);
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
            // TODO: add better regex for email
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

      <Button title="Submit" onPress={handleSubmit(register)} buttonStyle={styles.button} />
    </Card>
  );
};


const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  button: {
    height: 40,
    backgroundColor: '#48BBEC',
    borderColor: '#48BBEC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  }
});

RegisterForm.propTypes = {
  setToggleRegister: PropTypes.func,
};

export default RegisterForm;
