import React, {useContext} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../views/Login';
import {MainContext} from '../contexts/MainContext';
import {Icon} from '@rneui/themed';
import FeedPage from '../views/FeedPage';
import Upload from '../views/Upload';
import Profile from '../views/Profile';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Tabscreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        activeTintColor: '#FFFFFF',
        headerShown: false,
        tabBarStyle: {backgroundColor: '#000000'},
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedPage}
        options={{
          tabBarIcon: ({color}) => <Icon name="home" color={color} />,
          tabBarVisible: false, // this hides the tab bar only for this screen
        }}
      />
      <Tab.Screen
        name="Upload"
        component={Upload}
        options={{
          tabBarVisible: false, // this hides the tab bar only for this screen
          tabBarIcon: ({color}) => <Icon name="cloud-upload" color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({color}) => <Icon name="person" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const Stackscreen = () => {
  const {isLoggedIn} = useContext(MainContext);
  // const isLoggedIn = true;
  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <>
          <Stack.Screen
            name="Tabs"
            component={Tabscreen}
            options={{headerShown: false}}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
      )}
    </Stack.Navigator>
  );
};

const Navigator = () => {
  // setHeight tänne
  return (
    <NavigationContainer>
      <Stackscreen />
    </NavigationContainer>
  );
};

export default Navigator;
