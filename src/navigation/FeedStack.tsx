import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FeedScreen from '../screens/user/feed/FeedScreen';
import JobDetailScreen from '../screens/user/feed/JobDetailScreen';
import RequestRecommendationScreen from '../screens/user/recommend/RequestRecommendationScreen';
import RecommendSomeoneScreen from '../screens/user/recommend/RecommendSomeoneScreen';

const Stack = createNativeStackNavigator();

export default function FeedStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FeedList" component={FeedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="RequestRecommendation"
        component={RequestRecommendationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RecommendSomeone"
        component={RecommendSomeoneScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}












