import {FlatList, Dimensions} from 'react-native';
import ListItem from './ListItem';
import {useMedia} from '../hooks/ApiHooks';
import PropTypes from 'prop-types';
import {useContext} from 'react';
import {MainContext} from '../contexts/MainContext';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

// screen Height
const ScreenHeight = Dimensions.get('window').height;
// screen height recudec by bottom tab bar height
// const ScreenHeightMinusTabBar = ScreenHeight - height;

const List = ({navigation, myFilesOnly}) => {
  const {update} = useContext(MainContext);
  const {mediaArray} = useMedia(update, myFilesOnly);
  const {height, setHeight} = useContext(MainContext);

  const tabBarHeight = useBottomTabBarHeight();
  console.log('tabBarHeight', tabBarHeight);
  setHeight(tabBarHeight);
  console.log('height', height);

  // const [playingIndex, setPlayingIndex] = useState(-1);

  /*   const handlePlayVideo = useCallback(
    (index) => {
      if (playingIndex !== index) {
        setPlayingIndex(index);
      }
    },
    [playingIndex],
  ); */

  /* const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 50});

  const onViewRef = useRef(({viewableItems, changed}) => {
    if (viewableItems.length > 0) {
      setPlayingIndex(viewableItems[0].index);
    } else {
      setPlayingIndex(-1);
    }
  }); */

  /*  const changeHandler = ({ viewableItems, changed }) => {
    console.log("Visible items are", viewableItems);
    console.log("Changed in this iteration", changed);
  }  */

  return (
    <FlatList
      style={{flex: 1}}
      data={mediaArray}
      renderItem={({item}) => (
        <ListItem
          navigation={navigation}
          singleMedia={item}
          userId={item.user_id}
          /* isPlaying={index === playingIndex}
          onPlay={() => handlePlayVideo(index)} */
        />
      )}
      /*  keyExtractor={(item) =>
        item.id ? item.id.toString() : Math.random().toString()
      } */
      snapToInterval={ScreenHeight - height}
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false} // hide scroll bar
      /*       viewabilityConfig={viewConfigRef.current}
      onViewableItemsChanged={onViewRef.current} */
    />
  );
};

List.propTypes = {
  navigation: PropTypes.object,
  myFilesOnly: PropTypes.bool,
};

export default List;
