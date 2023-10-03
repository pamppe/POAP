import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import {mediaUrl} from '../utils/app-config';
import React, {useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser, useTag, useFavourite, useComment} from '../hooks/ApiHooks';
import {Video} from 'expo-av';
import {FontAwesome} from '@expo/vector-icons';
import avatarImage from '../assets/avatar.png';
import * as Sharing from 'expo-sharing';

const ListItem = ({singleMedia, userId, isPlaying, navigation}) => {
  const [owner, setOwner] = useState({});
  const {getUserById} = useUser();
  const [avatar, setAvatar] = useState(avatarImage);
  const videoRef = useRef(null);
  const {getFilesByTag} = useTag();
  const {postFavourite, getFavouritesById, deleteFavourite} = useFavourite();
  const {getCommentsById, deleteComment, postComment} = useComment();
  const [likes, setLikes] = useState([]);
  const [userLike, setUserLike] = useState(false);
  const [comments, setComments] = useState([]);
  const [userComments, setUserComments] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [videoLayout, setVideoLayout] = useState({});
  // const [isPlaying, setIsPlaying] = useState(false);
  // console.log('height', height);

  /*   const togglePlayBack = () => {
    setIsPlaying(!isPlaying);
  }; */

  // fetch owner info
  const fetchOwner = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const ownerData = await getUserById(userId, token);
      setOwner(ownerData);
    } catch (error) {
      console.error(error.message);
    }
  };

  // window height - header height
  const screenHeight = Dimensions.get('window').height;
  // window width
  const screenWidth = Dimensions.get('window').width;

  const loadAvatar = async () => {
    try {
      const avatars = await getFilesByTag('avatar_' + userId);
      if (avatars.length > 0) {
        setAvatar({uri: mediaUrl + avatars.pop().filename});
      }
    } catch (error) {
      console.error(error);
    }
  };
  // add favourite
  const createFavourite = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await postFavourite(
        {file_id: singleMedia.file_id},
        token,
      );
      response && setUserLike(true);
    } catch (error) {
      console.error(error.message);
    }
  };

  // delete favourite
  const removeFavourite = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await deleteFavourite(singleMedia.file_id, token);
      response && setUserLike(false);
    } catch (error) {
      console.error(error.message);
    }
  };

  // get favouritesbyid
  const fetchLikes = async () => {
    try {
      const likesData = await getFavouritesById(singleMedia.file_id);
      setLikes(likesData);
      // check if userid stored in context is in likesData
      likesData.forEach((like) => {
        if (like.user_id === userId) {
          setUserLike(true);
        }
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchComments = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const commentsData = await getCommentsById(singleMedia.file_id, token);
      setComments(commentsData);
    } catch (error) {
      console.error(error.message);
    }
  };
  const sendComment = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await postComment(
        singleMedia.file_id,
        userComments,
        token,
      );
      if (response) {
        setUserComments(''); // Clear the comment after posting
        fetchComments(); // Refresh comments to show the new one
      }
    } catch (error) {
      console.error(error.message);
    }
  };
  const shareContent = async () => {
    const shareUrl = mediaUrl + singleMedia.filename; // URL of the media

    if (!(await Sharing.isAvailableAsync())) {
      alert("Uh oh, sharing isn't available on your platform");
      return;
    }

    try {
      await Sharing.shareAsync(shareUrl);
    } catch (error) {
      console.error('Sharing error:', error.message);
    }
  };
  const handleVideoLayout = (event) => {
    setVideoLayout({
      y: event.nativeEvent.layout.y,
      height: event.nativeEvent.layout.height,
    });
  };
  useEffect(() => {
    fetchOwner();
    loadAvatar();
    fetchLikes();
  }, []);

  useEffect(() => {
    fetchLikes();
  }, [userLike]);

  useEffect(() => {
    fetchComments();
  }, [userComments]);

  return (
    <ScrollView
      style={styles.container}
      scrollEventThrottle={16} // this ensures the scroll event is captured smoothly
      ref={scrollViewRef}
    >
      <View style={styles.mediaContainer}>
        {singleMedia.media_type === 'image' ? (
          <Image
            style={[
              styles.thumbnail,
              {width: screenWidth, height: screenHeight},
            ]}
            source={{uri: mediaUrl + singleMedia.filename}}
            resizeMode="cover"
          />
        ) : (
          <Video
            style={[
              styles.thumbnail,
              {width: screenWidth, height: screenHeight},
            ]}
            source={{uri: mediaUrl + singleMedia.filename}}
            resizeMode="cover"
            useNativeControls={true}
            isLooping={true}
            ref={videoRef}
            isMuted={false}
            shouldPlay={isPlaying}
            onLayout={handleVideoLayout}
            autoPlay={false}
          />
        )}

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{owner.username}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {singleMedia.description}
          </Text>
        </View>
        <View style={styles.verticalNav}>
          <TouchableOpacity style={styles.navItem}>
            <Image
              style={styles.avatar}
              source={avatar.uri ? avatar : avatarImage}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            {userLike ? (
              <FontAwesome
                name="heart-o"
                size={30}
                color="red"
                onPress={removeFavourite}
              />
            ) : (
              <FontAwesome
                name="heart-o"
                size={30}
                color="white"
                onPress={createFavourite}
              />
            )}
            <Text style={styles.navItemText}>{likes.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <FontAwesome
              name="comment-o"
              size={30}
              color="white"
              onPress={() => setModalVisible(true)}
            />
            <Text style={styles.navItemText}>{comments.length}</Text>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <View style={styles.modalView}>
                {/* Render your comments here */}
                {comments.map((comment, index) => (
                  <View key={index} style={styles.commentItem}>
                    <Text style={styles.commentUsername}>
                      {owner.username}:
                    </Text>
                    <Text style={styles.commentText}>{comment.comment}</Text>
                  </View>
                ))}
                <TextInput
                  id="commentBox"
                  placeholder="Add a comment..."
                  style={styles.commentInput}
                  value={userComments} // set the current value of the TextInput
                  onChangeText={(text) => setUserComments(text)} // update state when text changes
                />
                <Button title="Submit" onPress={sendComment} />
                <Button title="Close" onPress={() => setModalVisible(false)} />
              </View>
            </Modal>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={shareContent}>
            <FontAwesome name="share-alt" size={30} color="white" />
            <Text style={styles.navItemText}></Text>
          </TouchableOpacity>
          {/* Add more items as needed */}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
  },
  mediaContainer: {
    position: 'relative',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 79,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: 'white',
    fontSize: 16,
  },
  verticalNav: {
    position: 'absolute',
    right: 10,
    bottom: 200, // Adjust as per your requirement
    alignItems: 'center',
  },
  navItem: {
    marginBottom: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  navItemText: {
    color: 'white',
    fontSize: 16,
    right: -10,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentUsername: {
    fontWeight: 'bold',
  },
  commentText: {
    marginLeft: 10,
  },
  commentInput: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 20,
  },
});

ListItem.propTypes = {
  singleMedia: PropTypes.object,
  navigation: PropTypes.object,
  userId: PropTypes.number,
};

export default ListItem;
