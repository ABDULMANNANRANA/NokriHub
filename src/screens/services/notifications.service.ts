import { Alert } from 'react-native';
import { supabase } from './supabase';
import { getPendingActionItems } from './recommendations.service';
import { useNotificationsStore } from '../store/notificationsStore';

/**
 * Subscribes to live recommendation_requests changes relevant to this user
 * and keeps the notifications store's pendingCount in sync. Also pops a
 * lightweight in-app alert when a brand-new request arrives while the app
 * is open — this is the fallback for real push notifications, which would
 * additionally need Firebase set up to work while the app is backgrounded.
 *
 * Returns an unsubscribe function — call it in a useEffect cleanup.
 */
export function subscribeToActivityUpdates(userId: string) {
  const { setPendingCount } = useNotificationsStore.getState();

  const refreshCount = async () => {
    try {
      const items = await getPendingActionItems(userId);
      setPendingCount(items.length);
    } catch (err) {
      console.log('Failed to refresh pending count:', err);
    }
  };

  // initial count on mount
  refreshCount();

  const isTargetedAtMe = (row: any) => {
    const isTargetAsRecommender = row.recommender_id === userId && row.requested_by === 'candidate';
    const isTargetAsCandidate = row.candidate_id === userId && row.requested_by === 'recommender';
    return isTargetAsRecommender || isTargetAsCandidate;
  };

  const channel = supabase
    .channel(`activity-${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'recommendation_requests', filter: `recommender_id=eq.${userId}` },
      (payload) => {
        if (isTargetedAtMe(payload.new)) {
          Alert.alert('New request', 'Someone needs your response — check the Activity tab.');
          refreshCount();
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'recommendation_requests', filter: `candidate_id=eq.${userId}` },
      (payload) => {
        if (isTargetedAtMe(payload.new)) {
          Alert.alert('New request', 'Someone wants to recommend you — check the Activity tab.');
          refreshCount();
        }
      }
    )
    // status changes (accepted/declined elsewhere) should also update the count
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'recommendation_requests', filter: `recommender_id=eq.${userId}` },
      () => refreshCount()
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'recommendation_requests', filter: `candidate_id=eq.${userId}` },
      () => refreshCount()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}