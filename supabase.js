import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// 🔥 conditionally load AsyncStorage
let storage;

if (typeof window !== 'undefined') {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = AsyncStorage;
}

const supabaseUrl = 'https://pwwbyorzntppoqixrzoq.supabase.co';
const supabaseAnonKey = 'sb_publishable_Yv5XGRjrjD5RHUuDvFhTAQ_3nvigsBj';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage, // 🔥 FIX HERE
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});