import {createClient} from '@supabase/supabase-js';

// Supabase publishable keys are designed to be shipped to browsers. Environment
// variables can override these values for previews or future project moves.
const url=import.meta.env.VITE_SUPABASE_URL?.trim()||'https://qxhopdgryktcaibpkobc.supabase.co';
const key=import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()||'sb_publishable_n-BMalaMyAUDGHWbYUzqXw_opffN67Y';

export const isSupabaseConfigured=Boolean(url&&key&&/^https:\/\//.test(url)&&key.length>20);
export const supabase=isSupabaseConfigured?createClient(url,key,{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'nxtgen-auth'},
}):null;

export function cloudError(error,fallback='Request failed'){
 const message=error?.message||fallback;
 const status=/session|jwt|login|credential|email not confirmed/i.test(message)?401:400;
 return Object.assign(new Error(message),{status});
}
