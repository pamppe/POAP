import React, {useContext} from 'react';
import {Platform, StatusBar, StyleSheet} from 'react-native';
import List from '../components/List';
import PropTypes from 'prop-types';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {MainContext} from '../contexts/MainContext';

const Home = ({navigation}) => {
  const {setHeight} = useContext(MainContext);
  const tabBarHeight = useBottomTabBarHeight();
  setHeight(tabBarHeight);
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <List navigation={navigation} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

Home.propTypes = {
  navigation: PropTypes.object,
};

export default Home;
