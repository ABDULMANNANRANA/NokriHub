import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuthStore } from '../../src/screens/store/authStore';

export default function PlaceholderScreen({ label }: { label: string }) {
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
      <View style={styles.buttonWrap}>
        <Button title="Logout" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: '500', marginBottom: 20 },
  buttonWrap: { width: '60%' },
});