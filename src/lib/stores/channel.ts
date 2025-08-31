import { supabase } from '$lib/supabase';

// ---- Shared channel management ----
let channel: ReturnType<typeof supabase.channel> | null = null;
let refCount = 0;

export const getChannel = () => {
  if (!channel) {
    channel = supabase.channel('app-realtime');
  }
  refCount++;
  return channel;
};

export const releaseChannel = () => {
  refCount--;
  if (refCount <= 0 && channel) {
    channel.unsubscribe();
    channel = null;
    refCount = 0;
  }
};
