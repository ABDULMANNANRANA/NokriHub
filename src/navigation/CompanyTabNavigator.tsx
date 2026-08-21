import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CompanyJobsStack from './Companyjobsstack';
import CompanyDashboardStack from './CompanyDashboardStack';
import CompanyProfileScreen from '../screens/company/profile/CompanyProfileScreen';
import JobPipelineScreen from '../screens/company/jobs/JobPipelineScreen';
import CandidatesStack from './CandidatesStack';

const Tab = createBottomTabNavigator();

export default function CompanyTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Post Job') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Pipeline') {
            iconName = focused ? 'git-network' : 'git-network-outline';
          } else if (route.name === 'Candidates') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'business' : 'business-outline';
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
        name="Dashboard"
        component={CompanyDashboardStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Post Job"
        component={CompanyJobsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Pipeline" component={JobPipelineScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Candidates" component={CandidatesStack} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={CompanyProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}












