// src/lib/supabase.js

//import { createClient } from '@supabase/supabase-js';

//const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
//const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

//let supabase = null;

// ✅ 只在环境变量存在时初始化 Supabase（通常 App 才有）
//if (supabaseUrl && supabaseAnonKey) {
//  supabase = createClient(supabaseUrl, supabaseAnonKey);

  // ✅ 附加到全局方便调试
//  if (typeof window !== 'undefined') {
//    window.supabase = supabase;
//  }
//} else {
//  console.warn('[ReaText] Supabase 未初始化，当前环境缺少配置变量。');
//}

//export default supabase;
