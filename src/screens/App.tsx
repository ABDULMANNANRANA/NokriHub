import React, { useEffect } from 'react';
import { View, ActivityIndicator, Linking } from 'react-native';
import RootNavigator from '../navigation/RootNavigator';
import { useAuthStore } from './store/authStore';
import { completeLinkedInLogin } from './services/linkedin.service';
import ErrorBoundary from './components/shared/ErrorBoundary';

export default function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();

    const handleUrl = ({ url }: { url: string }) => {
      if (url.startsWith('nokrihub://auth-callback')) {
        completeLinkedInLogin(url).catch((err) =>
          console.log('LinkedIn login completion failed:', err)
        );
      }
    };

    // handles the redirect while the app is already running
    const sub = Linking.addEventListener('url', handleUrl);

    // handles the case where the redirect cold-launches the app
    Linking.getInitialURL().then((url) => {
      if (url && url.startsWith('nokrihub://auth-callback')) {
        completeLinkedInLogin(url).catch((err) =>
          console.log('LinkedIn login completion failed:', err)
        );
      }
    });

    return () => sub.remove();
  }, [initialize]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <RootNavigator />
    </ErrorBoundary>
  );
}












