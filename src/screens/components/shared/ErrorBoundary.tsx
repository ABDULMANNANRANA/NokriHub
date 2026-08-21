import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In a production build this is where you'd forward to a crash
    // reporting service (Sentry, Bugsnag, etc.) — logging locally for now.
    console.log('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app hit an unexpected error. You can try again, or close and
            reopen the app if the problem continues.
          </Text>
          <Text style={styles.debug}>{this.state.errorMessage}</Text>
          <View style={styles.buttonWrap}>
            <Button title="Try Again" onPress={this.handleReset} />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  message: { color: '#555', textAlign: 'center', marginBottom: 16 },
  debug: { color: '#999', fontSize: 11, textAlign: 'center', marginBottom: 24 },
  buttonWrap: { width: '60%' },
});