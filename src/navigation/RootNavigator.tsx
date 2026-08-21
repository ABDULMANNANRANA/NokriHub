import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../../src/screens/store/authStore';
import AuthStack from './AuthStack';
import UserTabNavigator from './UserTabNavigator';
import CompanyTabNavigator from './CompanyTabNavigator';

export default function RootNavigator() {
  const { isLoggedIn, role } = useAuthStore();

  return (
    <NavigationContainer>
      {!isLoggedIn && <AuthStack />}
      {isLoggedIn && role === 'candidate' && <UserTabNavigator />}
      {isLoggedIn && role === 'company-admin' && <CompanyTabNavigator />}
    </NavigationContainer>
  );
}