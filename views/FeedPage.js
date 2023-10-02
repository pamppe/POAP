import React from 'react';
import {StatusBar} from 'react-native';
import List from '../components/List';
import PropTypes from 'prop-types';

const Home = ({navigation}) => {
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
