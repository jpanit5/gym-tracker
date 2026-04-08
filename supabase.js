import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

let storage;

if (typeof window !== 'undefined') {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = AsyncStorage;
}

const supabaseUrl = 'https://pwwbyorzntppoqixrzoq.supabase.co';
const supabaseAnonKey = 'sb_publishable_Yv6XGRjrjD6RHUuDvFhTAQ_4nvigsBj';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
