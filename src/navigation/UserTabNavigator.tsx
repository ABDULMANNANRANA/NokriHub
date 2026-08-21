import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CVStack from './Cvstack';
import FeedStack from './FeedStack';
import ActivityStack from './ActivityStack';
import NetworkScreen from '../screens/user/network/NetworkScreen';
import UserProfileScreen from '../screens/user/profile/UserProfileScreen';
import { useAuthStore } from '../screens/store/authStore';
import { useNotificationsStore } from '../screens/store/notificationsStore';
import { subscribeToActivityUpdates } from '../screens/services/notifications.service';

const Tab = createBottomTabNavigator();

export default function UserTabNavigator() {
  const session = useAuthStore((s) => s.session);
  const pendingCount = useNotificationsStore((s) => s.pendingCount);

  useEffect(() => {
    if (!session?.user) return;
    const unsubscribe = subscribeToActivityUpdates(session.user.id);
    return unsubscribe;
  }, [session]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'My CVs') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Network') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Activity') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="My CVs"
        component={CVStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Network" component={NetworkScreen} options={{ headerShown: false }} />
      <Tab.Screen
        name="Activity"
        component={ActivityStack}
        options={{ headerShown: false, tabBarBadge: pendingCount > 0 ? pendingCount : undefined }}
      />
      <Tab.Screen name="Profile" component={UserProfileScreen} options={{ headerShown: false }}/>
    </Tab.Navigator>
  );
}












