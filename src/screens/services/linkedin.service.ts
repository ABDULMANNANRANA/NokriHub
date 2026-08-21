import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { supabase } from './supabase';

export type Role = 'candidate' | 'company-admin';

const REDIRECT_URL = 'nokrihub://auth-callback';
const PENDING_ROLE_KEY = 'pending_login_role';

/** Kicks off LinkedIn OAuth via in-app browser session */
export async function startLinkedInLogin(role: Role) {
  await AsyncStorage.setItem(PENDING_ROLE_KEY, role);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: REDIRECT_URL,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  if (data?.url) {
    // Optional chaining avoids null pointer crashes if native module isn't linked
    const isBrowserAvailable = await InAppBrowser?.isAvailable?.();

    if (isBrowserAvailable) {
      const result = await InAppBrowser.openAuth(data.url, REDIRECT_URL, {
        // Android Options
        showTitle: false,
        enableUrlBarHiding: true,
        enableDefaultShare: false,
        // iOS Options
        modalEnabled: true,
        dismissButtonStyle: 'cancel',
      });

      if (result.type === 'success' && result.url) {
        return await completeLinkedInLogin(result.url);
      } else {
        throw new Error('Authentication was cancelled or interrupted.');
      }
    } else {
      // Fallback to standard system browser
      await Linking.openURL(data.url);
    }
  }
}

/**
 * Parses the auth URL and exchanges PKCE code for session
 */
export async function completeLinkedInLogin(url: string) {
  const urlObj = new URL(url);
  const code = urlObj.searchParams.get('code');

  if (!code) {
    const errorDesc = urlObj.searchParams.get('error_description');
    throw new Error(errorDesc || 'Failed to obtain auth code from OAuth callback.');
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;

  const selectedRole = (await AsyncStorage.getItem(PENDING_ROLE_KEY)) as Role | null;
  await AsyncStorage.removeItem(PENDING_ROLE_KEY);

  if (data.session?.user && selectedRole) {
    await ensureUserProfile(data.session.user.id, selectedRole, data.session.user.user_metadata);
  }

  return data.session;
}

async function ensureUserProfile(userId: string, selectedRole: Role, metadata: any) {
  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (selectError) {
    console.error('Select User Error:', selectError.message);
  }

  if (!existing) {
    const payload = {
      id: userId,
      role: selectedRole,
      name: metadata?.name || metadata?.full_name || 'LinkedIn User',
      photo_url: metadata?.picture || metadata?.avatar_url || null,
      email: metadata?.email || null,
      linkedin_id: metadata?.sub || metadata?.provider_id || null,
      headline: metadata?.headline || null,
      star_count: 0,
    };

    const { error: insertError } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'id' });

    if (insertError) {
      // Log the exact error object to the terminal/console
      console.error('Postgres Insert Error Object:', insertError);

      // Display the actual error code and message on screen
      Alert.alert(
        'Database Constraint Error',
        `Code: ${insertError.code}\nMessage: ${insertError.message}\nDetails: ${insertError.details || 'None'}`
      );
      
      // Pass raw error message up
      throw new Error(`[${insertError.code}] ${insertError.message}`);
    }
    return;
  }

  if (existing.role !== selectedRole) {
    Alert.alert(
      'Different account type',
      `This LinkedIn account is already registered as ${
        existing.role === 'candidate' ? 'Candidate/Recommender' : 'Company Admin'
      }. Logging you into that portal instead.`
    );
  }
}





