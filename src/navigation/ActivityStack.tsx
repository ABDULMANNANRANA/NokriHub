import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ActivityScreen from '../screens/user/activity/ActivityScreen';
import CVReviewScreen from '../screens/user/activity/CVReviewScreen';
import AcceptOfferScreen from '../screens/user/activity/AcceptOfferScreen';

const Stack = createNativeStackNavigator();

export default function ActivityStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ActivityHome" component={ActivityScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="CVReview" component={CVReviewScreen}options={{ headerShown: false }} />
      <Stack.Screen name="AcceptOffer" component={AcceptOfferScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
