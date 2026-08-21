import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompanyDashboardScreen from '../screens/company/dashboard/CompanyDashboardScreen';
import CandidatePoolScreen from '../screens/company/candidates/CandidatePoolScreen';
import CVReviewScreen from '../screens/user/activity/CVReviewScreen';

const Stack = createNativeStackNavigator();

export default function CompanyDashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardHome"
        component={CompanyDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CandidatePool"
        component={CandidatePoolScreen}
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












