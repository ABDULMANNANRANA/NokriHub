import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CandidatePoolOverviewScreen from '../screens/company/candidates/CandidatePoolOverviewScreen';
import CVReviewScreen from '../screens/user/activity/CVReviewScreen';

const Stack = createNativeStackNavigator();

export default function CandidatesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CandidatesHome"
        component={CandidatePoolOverviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CVReview"
        component={CVReviewScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}