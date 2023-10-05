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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {mediaUrl} from '../utils/app-config';
import React, {useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser, useTag, useFavourite, useComment} from '../hooks/ApiHooks';
import {Video} from 'expo-av';
import {FontAwesome} from '@expo/vector-icons';
import avatarImage from '../assets/avatar.png';
import * as Sharing from 'expo-sharing';
import {formatDate} from '../utils/functions';

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
  const [audioPlayer, setAudioPlayer] = useState(null);
  // const [isPlaying, setIsPlaying] = useState(false);
  // console.log('height', height);

  /*   const togglePlayBack = () => {
    setIsPlaying(!isPlaying);
  }; */

  // get username by id

  const getUsername = async (id) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await getUserById(id, token);
      return userData.username;
    } catch (error) {
      console.error(error.message);
    }
  };

  // fetch owner info
  const fetchOwner = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const ownerData = await getUserById(singleMedia.user_id, token);
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
      const avatars = await getFilesByTag('avatar_' + singleMedia.user_id);
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

      const commentsWithUserDetails = [];

      for (const comment of commentsData) {
        const username = await getUsername(comment.user_id);

        let userAvatar = avatarImage; // default avatar

        try {
          const avatars = await getFilesByTag('avatar_' + comment.user_id);
          if (avatars.length > 0) {
            userAvatar = {uri: mediaUrl + avatars.pop().filename};
          }
        } catch (avatarError) {
          console.error('Avatar fetch error:', avatarError);
        }

        commentsWithUserDetails.push({
          comment_id: comment.comment_id,
          userId: comment.user_id,
          comment: comment.comment,
          username: username,
          avatar: userAvatar,
          time_added: comment.time_added,
        });
      }

      setComments(commentsWithUserDetails);
    } catch (error) {
      console.error(error.message);
    }
  };

  const sendComment = async () => {
    if (userComments.trim() === '') {
      alert('Comment cannot be empty!');
      return; // Exit the function
    }
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

  const handleDeleteComment = async (commentId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await deleteComment(commentId, token);
      // After successfully deleting the comment, update your comments list.
      fetchComments();
    } catch (error) {
      console.error('Failed to delete the comment:', error.message);
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
  const playAudio = async (audioUri) => {
    const newPlayer = new Audio.Sound();
    try {
      await newPlayer.loadAsync(
        {uri: audioUri},
        {shouldPlay: true, isLooping: true},
      );
      setAudioPlayer(newPlayer);
    } catch (error) {
      console.error('Error loading audio', error);
    }
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
  useEffect(() => {
    if (singleMedia.audioFilename) {
      playAudio(mediaUrl + singleMedia.audioFilename);
    }

    return () => {
      if (audioPlayer) {
        audioPlayer.unloadAsync();
      }
    };
  }, [singleMedia]);

  console.log(singleMedia);
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
              <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={styles.commentCount}>
                      {comments.length} comments
                    </Text>
                    <ScrollView style={styles.commentsScrollView}>
                      {comments.map((comment, index) => (
                        <View key={index} style={styles.commentItem}>
                          <Image
                            style={styles.commentAvatar}
                            source={comment.avatar}
                          />
                          <View style={styles.commentRightContainer}>
                            <Text style={styles.commentUsername}>
                              {comment.username}:
                            </Text>
                            <Text style={styles.commentText}>
                              {comment.comment}
                              {/* <Button
                              title="Delete"
                              onClick={handleDeleteComment(comment.comment_id)}
                            ></Button> */}
                            </Text>
                            <Text style={styles.commentTime}>
                              {formatDate(comment.time_added)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                    {/* <View style={styles.bottomDivider} /> */}
                    <View style={styles.inputContainer}>
                      <TextInput
                        id="commentBox"
                        placeholder="Add a comment..."
                        style={styles.commentInput}
                        value={userComments} // set the current value of the TextInput
                        onChangeText={(text) => setUserComments(text)} // update state when text changes
                      />
                      <TouchableOpacity onPress={sendComment}>
                        <FontAwesome
                          name="arrow-right"
                          size={24}
                          color="gray"
                        />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <FontAwesome name="times" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
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
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
  },
  modalView: {
    position: 'relative',
    width: '100%',
    height: '75%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 20, // Optional, if you want to make the background circular
    padding: 5, // Padding to provide space around the icon
  },
  commentsScrollView: {
    flex: 1, // Make sure the ScrollView expands
    marginBottom: 10, // Some spacing before the input
    marginTop: 10,
  },
  bottomDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'gray', // Adjust the color as needed
    marginBottom: 10,
  },
  commentItem: {
    flexDirection: 'row', // to align items in a row
    alignItems: 'center', // to vertically align items in the center
    marginBottom: 8,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10, // space between avatar and comment
  },
  commentRightContainer: {
    flex: 1, // to take available space
  },
  commentUsername: {
    color: 'dimgray',
    fontSize: 13,
  },
  commentText: {
    marginTop: 4, // space between username and comment
  },
  commentTime: {
    color: 'darkgray',
    marginTop: 4,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  commentInput: {
    flex: 1, // to take available space
    height: 40, // adjust based on your design needs
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20, // rounded edges
    paddingHorizontal: 10, // to have some space on the sides for text
    marginRight: 10, // space between input and the send icon
  },
  commentCount: {
    marginTop: 0,
    textAlign: 'center',
  },
});

ListItem.propTypes = {
  singleMedia: PropTypes.object,
  navigation: PropTypes.object,
  userId: PropTypes.number,
};

export default ListItem;
