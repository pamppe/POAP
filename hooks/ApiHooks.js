import {useEffect, useState} from 'react';
import {apiUrl} from '../utils/app-config';
import {doFetch} from '../utils/functions';
import {error} from '@babel/eslint-parser/lib/convert/index.cjs';

const useMedia = () => {
  const [mediaArray, setMediaArray] = useState([]);

  const loadMedia = async () => {
    try {
      const json = await doFetch(apiUrl + 'media');
      // console.log(json);
      const mediaFiles = await Promise.all(
        json.map(async (item) => {
          const fileData = await doFetch(apiUrl + 'media/' + item.file_id);
          // console.log('fileData', fileData);
          return fileData;
        }),
      );
      // console.log(data);
      setMediaArray(mediaFiles);
    } catch (error) {
      console.error('loadMedia failed', error);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  return {mediaArray};
};

const useAuthentication = () => {
  const postLogin = async (user) => {
    return await doFetch(apiUrl + 'login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
  };

  return {postLogin};
};

const useUser = () => {
  const getUserByToken = async (token) => {
    const options = {
      method: 'GET',
      headers: {'x-access-token': token},
    };
    return await doFetch(apiUrl + 'users/user', options);
  };

  const postUser = async (userData) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    };
    return await doFetch(apiUrl + 'users', options);
  };

  const putUser = async (userData, token) => {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(userData),
    };
    return await doFetch(apiUrl + 'users', options);
  };

  const checkUsername = async (username) => {
    try {
      const response = await doFetch(`${apiUrl}users/username/${username}`);
      return response.available;
    } catch {
      throw new Error('checkusername Error', error.message);
    }
  };

  return {getUserByToken, postUser, checkUsername, putUser};
};

const useTag = () => {
  const getFilesByTag = async (tag) => {
    try {
      return await doFetch(apiUrl + 'tags/' + tag);
    } catch (error) {
      throw new Error('getFilesByTag error', error.message);
    }
  };
  return {getFilesByTag};
};

export {useMedia, useAuthentication, useUser, useTag};
