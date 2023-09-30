import {FlatList, Dimensions} from 'react-native';
import ListItem from './ListItem';
import {useMedia} from '../hooks/ApiHooks';
import PropTypes from 'prop-types';
import {useContext, useRef, useState, useCallback} from 'react';
import {MainContext, height} from '../contexts/MainContext';

// screen Height
const ScreenHeight = Dimensions.get('window').height - 79;
// screen height recudec by bottom tab bar height
//const ScreenHeightMinusTabBar = ScreenHeight - height;

const List = ({navigation, myFilesOnly}) => {
  const {update, user} = useContext(MainContext);
  const {mediaArray} = useMedia(update, myFilesOnly);
  const [playingIndex, setPlayingIndex] = useState(-1);

  const handlePlayVideo = useCallback(
    (index) => {
      if (playingIndex !== index) {
        setPlayingIndex(index);
      }
    },
    [playingIndex],
  );

  const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 50});

  const onViewRef = useRef(({viewableItems, changed}) => {
    if (viewableItems.length > 0) {
      setPlayingIndex(viewableItems[0].index);
    } else {
      setPlayingIndex(-1);
    }
  });

  /*  const changeHandler = ({ viewableItems, changed }) => {
    console.log("Visible items are", viewableItems);
    console.log("Changed in this iteration", changed);
  }  */

  return (
    <FlatList
      style={{flex: 1}}
      data={mediaArray}
      renderItem={({item, index}) => (
        <ListItem
          navigation={navigation}
          singleMedia={item}
          userId={user.user_id}
          isPlaying={index === playingIndex}
          onPlay={() => handlePlayVideo(index)}
        />
      )}
      keyExtractor={(item) =>
        item.id ? item.id.toString() : Math.random().toString()
      }
      snapToInterval={ScreenHeight}
      snapToAlignment="start"
      decelerationRate="fast"
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
