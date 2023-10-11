import React, {useContext} from 'react';
import {StatusBar} from 'react-native';
import List from '../components/List';
import PropTypes from 'prop-types';
import {useMedia} from '../hooks/ApiHooks';
import {MainContext} from '../contexts/MainContext';

const Home = ({navigation, route}) => {
  console.log('Home');
  const {update} = useContext(MainContext); // Added user here
  const {mediaArray, getFileById} = useMedia(update);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <List
        navigation={navigation}
        mediaArray={mediaArray}
        getFileById={getFileById}
      />
    </>
  );
};

/* const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); */

Home.propTypes = {
  navigation: PropTypes.object,
};

export default Home;
