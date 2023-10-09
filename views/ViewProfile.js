import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.titleBar}>
          <Ionicons name="ios-arrow-back" size={24} color="#fff"></Ionicons>
          <Ionicons name="ios-add" size={24} color="#fff"></Ionicons>
        </View>

        <View style={{alignSelf: 'center'}}>
          <View style={styles.profileImage}>
            <Image
              source={require('./../assets/avatar.png')}
              style={styles.image}
              resizeMode="center"
            ></Image>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.text, {fontWeight: '200', fontSize: 36}]}>
            Erkki Esimerkki
          </Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statsBox}>
            <Text style={[styles.text, {fontSize: 24}]}>23</Text>
            <Text style={[styles.text, styles.subText]}>media</Text>
          </View>
        </View>
        <View style={styles.album}>
          <Text style={[styles.text, {fontSize: 30, color: '#3D3D3D'}]}></Text>
        </View>
        <View style={{marginTop: 32}}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.mediaImageContainer}>
              <Image
                source={require('./../assets/POAP.png')}
                style={styles.image}
                resizeMode="cover"
              ></Image>
            </View>
            <View style={styles.mediaImageContainer}>
              <Image
                source={require('./../assets/POAP.png')}
                style={styles.image}
                resizeMode="cover"
              ></Image>
            </View>
            <View style={styles.mediaImageContainer}>
              <Image
                source={require('./../assets/POAP.png')}
                style={styles.image}
                resizeMode="cover"
              ></Image>
            </View>
            <View style={styles.mediaImageContainer}>
              <Image
                source={require('./../assets/beach.jpg')}
                style={styles.image}
                resizeMode="cover"
              ></Image>
            </View>
            <View style={styles.mediaImageContainer}>
              <Image
                source={require('./../assets/beach.jpg')}
                style={styles.image}
                resizeMode="cover"
              ></Image>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  text: {
    fontFamily: 'HelveticaNeue',
    color: '#fff',
  },
  subText: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '500',
    color: '#fff',
  },
  image: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginHorizontal: 16,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    overflow: 'hidden',
    borderColor: 'white',
    borderWidth: 2,
  },
  album: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 32,
    marginBottom: 5,
  },
  statsBox: {
    alignItems: 'center',
  },
  mediaImageContainer: {
    width: 180,
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 15,
    borderColor: 'white',
  },
});
