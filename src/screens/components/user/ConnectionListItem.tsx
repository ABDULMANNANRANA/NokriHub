import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getAcceptedConnections } from '../../services/connections.service';
import { useAuthStore } from '../../store/authStore';

interface Props {
  onSelect: (userId: string, name: string) => void;
  selectedId?: string | null;
}

export default function ConnectionPicker({ onSelect, selectedId }: Props) {
  const session = useAuthStore((s) => s.session);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      getAcceptedConnections(session.user.id)
        .then(setConnections)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (loading) return <ActivityIndicator style={{ marginVertical: 12 }} />;

  if (connections.length === 0) {
    return (
      <Text style={styles.empty}>
        You have no accepted connections yet. Invite someone from the Network
        tab first.
      </Text>
    );
  }

  return (
    <View>
      {connections.map((c) => {
        const isRequester = c.requester.id === session?.user?.id;
        const other = isRequester ? c.addressee : c.requester;
        const selected = selectedId === other.id;
        return (
          <TouchableOpacity
            key={c.id}
            style={[styles.item, selected && styles.itemSelected]}
            onPress={() => onSelect(other.id, other.name)}
          >
            <Text style={styles.name}>{other.name || 'Unnamed user'}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: '#999', padding: 12 },
  item: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  name: { fontWeight: '600' },
});