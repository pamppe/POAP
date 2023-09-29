import React from 'react';
import {View, Text} from 'react-native';

function FeedPage() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Welcome to the Feed!</Text>
      {/* Here you'd map through your videos and render a video component */}
    </View>
  );
}

export default FeedPage;
