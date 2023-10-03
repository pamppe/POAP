import {Card, Input} from '@rneui/themed';
import {Controller, useForm} from 'react-hook-form';
import {Button} from '@rneui/base';
import {Alert, KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {useContext, useState} from 'react';
import {appId, placeholderImage} from '../utils/app-config';
import {Video} from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMedia, useTag} from '../hooks/ApiHooks';
import PropTypes from 'prop-types';
import {MainContext} from '../contexts/MainContext';

const Upload = ({navigation}) => {
  const {update, setUpdate} = useContext(MainContext);
  const [image, setImage] = useState(placeholderImage);
  const [type, setType] = useState('image');
  const {postMedia, loading} = useMedia();
  const {postTag} = useTag();
  const {
    control,
    reset,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
    },
    mode: 'onBlur',
  });

  const upload = async (uploadData) => {
    console.log('upload', uploadData);
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    const filename = image.split('/').pop();

    let fileExtension = filename.split('.').pop();
    fileExtension = fileExtension === 'jpg' ? 'jpeg' : fileExtension;

    formData.append('file', {
      uri: image,
      name: filename,
      type: `${type}/${fileExtension}`,
    });

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await postMedia(formData, token);
      console.log('lataus', response);
      const tagResponse = await postTag(
        {
          file_id: response.file_id,
          tag: appId,
        },
        token,
      );
      console.log('Post tag: ', tagResponse);
      setUpdate(!update);
      Alert.alert('Upload', response.message + 'Id: ' + response.file_id, [
        {
          text: 'Ok',
          onPress: () => {
            resetForm();

            navigation.navigate('Feed');
          },
        },
      ]);
    } catch (error) {
      console.log(error.message);
      // TODO notify user about failed
    }
  };

  const resetForm = () => {
    setImage(placeholderImage);
    setType('image');
    reset();
  };
  const captureFromCamera = async () => {
    const hasCameraAndRollPermission = await askCameraAndRollPermission();
    if (!hasCameraAndRollPermission) {
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setType(result.assets[0].type);
    }
  };
  const askCameraAndRollPermission = async () => {
    // Ask for camera permission
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'You need to grant camera permissions to use this feature.',
      );
      return false;
    }

    // Ask for camera roll permission
    const cameraRollPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraRollPermission.status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'You need to grant camera roll permissions to save the captured image/video.',
      );
      return false;
    }

    return true;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
    });

    // purkka key cancelled in the image picker result is deprecated - warning
    //delete result.cancelled;
    //console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setType(result.assets[0].type);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      {type === 'image' ? (
        <Card.Image
          source={{uri: image}}
          style={styles.fullscreenMedia}
          onPress={pickImage}
        />
      ) : (
        <Video
          source={{uri: image}}
          style={styles.fullscreenMedia}
          useNativeControls={true}
          resizeMode="cover"
        />
      )}// TODO: You can add the code to upload the new avatar to the server here

      <View style={styles.controlBar}>
        <Button title="Choose from Gallery" onPress={pickImage} />
        <Button title="Capture from Camera" onPress={captureFromCamera} />
        <Controller
          control={control}
          rules={{
            required: {value: true, message: 'is required'},
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <Input
              placeholder="Title"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.title?.message}
            />
          )}
          name="title"
        />
        <Controller
          control={control}
          rules={{
            minLength: {value: 10, message: 'min 10 characters'},
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <Input
              placeholder="Description (optional)"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.description?.message}
            />
          )}
          name="description"
        />
        <View style={styles.buttonContainer}>
          <Button
            title="Reset"
            type="clear"
            color={'warning'}
            onPress={resetForm}
          />
          <Button
            loading={loading}
            disabled={
              image == placeholderImage || errors.description || errors.title
            }
            title="Upload"
            onPress={handleSubmit(upload)}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenMedia: {
    flex: 1,
    resizeMode: 'cover',
  },
  controlBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default Upload;
