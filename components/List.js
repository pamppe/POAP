import {FlatList, Dimensions} from 'react-native';
import ListItem from './ListItem';
import {useMedia} from '../hooks/ApiHooks';
import PropTypes from 'prop-types';
import {useContext} from 'react';
import {MainContext} from '../contexts/MainContext';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useState, useRef} from 'react';

// screen Height
const ScreenHeight = Dimensions.get('window').height;
// screen height recudec by bottom tab bar height
// const ScreenHeightMinusTabBar = ScreenHeight - height;
const List = ({navigation, myFilesOnly}) => {
  const {update, user} = useContext(MainContext); // Added user here
  const {mediaArray} = useMedia(update, myFilesOnly);
  const {height, setHeight} = useContext(MainContext);

  const tabBarHeight = useBottomTabBarHeight();
  console.log('tabBarHeight', tabBarHeight);
  setHeight(tabBarHeight);
  console.log('height', height);

  const [playingIndex, setPlayingIndex] = useState(-1);

  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 50,
  });

  const onViewRef = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setPlayingIndex(viewableItems[0].index);
    } else {
      setPlayingIndex(-1);
    }
  });

  return (
    <FlatList
      style={{flex: 1}}
      data={mediaArray}
      renderItem={({item, index}) => (
        <ListItem
          navigation={navigation}
          singleMedia={item}
          userId={user.user_id} // Passing the logged-in user's ID here
          isPlaying={index === playingIndex}
        />
      )}
      snapToInterval={ScreenHeight - height}
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

export default List;
