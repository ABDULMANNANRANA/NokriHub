import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Props {
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Couldn't load this</Text>
      <Text style={styles.message}>
        {message ?? 'Check your connection and try again.'}
      </Text>
      <View style={styles.buttonWrap}>
        <Button title="Retry" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  message: { color: '#666', textAlign: 'center', marginBottom: 16 },
  buttonWrap: { width: '50%' },
});