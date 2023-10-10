import {FlatList, Dimensions, Platform} from 'react-native';
import ListItem from './ListItem';

import PropTypes from 'prop-types';
import React, {useContext, useEffect} from 'react';
import {MainContext} from '../contexts/MainContext';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useState, useRef} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';

// screen Height
const ScreenHeight = Dimensions.get('window').height;
const androidHeight = Dimensions.get('screen').height;
const softBarHeight = androidHeight - ScreenHeight;
const androidScreen = ScreenHeight - softBarHeight;
// screen height recudec by bottom tab bar height
// const ScreenHeightMinusTabBar = ScreenHeight - height;
const List = ({navigation, mediaArray, getFileById}) => {
  const {update, user, height, setHeight} = useContext(MainContext); // Added user here
  const flatListRef = useRef(null);
  const tabBarHeight = useBottomTabBarHeight();

  console.log('tabBarHeight', tabBarHeight);
  console.log('screenHeight', ScreenHeight);
  console.log('androidHeight', androidHeight);
  console.log('softBarHeight', softBarHeight);
  console.log('androidScreen', androidScreen);
  // setHeight(tabBarHeight); //kokeile useEffectin sisällä
  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  };
  const onRefresh = () => {
    // Scroll to the top
    scrollToTop();
    // Update the list

    // Add any data fetching or other logic here if needed
  };
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      onRefresh();
    }
  }, [isFocused]);
  useEffect(() => {
    setHeight(tabBarHeight);
  }, [tabBarHeight]);
  console.log('tabBarHeight', height);

  const [playingIndex, setPlayingIndex] = useState(-1);

  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 50,
  });

  const onViewRef = useRef(({viewableItems}) => {
    // Stop any currently playing audio
    if (playingIndex !== -1 && playingIndex !== viewableItems[0].index) {
      setPlayingIndex(-1);
    }

    if (viewableItems.length > 0) {
      setPlayingIndex(viewableItems[0].index);
    } else {
      setPlayingIndex(-1);
    }
  });
  // console.log('mediaArray', mediaArray);
  return (
    <FlatList
      ref={flatListRef}
      style={{flex: 1}}
      data={mediaArray}
      keyExtractor={(item) => item.file_id}
      renderItem={({item, index}) => (
        <ListItem
          navigation={navigation}
          getFileById={getFileById}
          singleMedia={item}
          userId={user.user_id} // Passing the logged-in user's ID here
          isPlaying={index === playingIndex}
          setPlayingIndex={setPlayingIndex} // Pass this down to ListItem
          height={height}
          softBarHeight={softBarHeight}
        />
      )}
      snapToInterval={
        Platform.OS === 'android'
          ? ScreenHeight - softBarHeight + height
          : ScreenHeight - height
      }
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      viewabilityConfig={viewConfigRef.current}
      onViewableItemsChanged={onViewRef.current}
    />
  );
};

List.propTypes = {
  navigation: PropTypes.object,
  myFilesOnly: PropTypes.bool,
};

export default React.memo(List);
