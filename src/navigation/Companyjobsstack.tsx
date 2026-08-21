import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import JobListScreen from '../screens/company/jobs/JobListScreen';
import PostJobScreen from '../screens/company/jobs/PostJobScreen';

const Stack = createNativeStackNavigator();

export default function CompanyJobsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="JobList" component={JobListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PostJob" component={PostJobScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}