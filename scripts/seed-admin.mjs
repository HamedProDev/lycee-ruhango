#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const FULL_NAME = process.env.ADMIN_FULL_NAME || 'Admin';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ADMIN_EMAIL) {
  console.error('Missing env. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ADMIN_EMAIL.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function main() {
  // Try to find an existing profile with this email
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id').eq('email', ADMIN_EMAIL).limit(1);
  if (pErr) {
    console.error('Error querying profiles:', pErr);
    process.exit(1);
  }

  let userId = profiles?.[0]?.id;

  if (!userId) {
    console.log('Creating auth user...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: FULL_NAME }
    });
    if (error) {
      console.error('Error creating user:', error);
      process.exit(1);
    }
    userId = data?.user?.id || data?.id;
    if (!userId) {
      console.error('Could not determine new user id:', data);
      process.exit(1);
    }
    console.log('Created user', userId);
  } else {
    console.log('Found existing profile id', userId);
  }

  // Insert admin role
  console.log('Granting admin role...');
  const { data: insertData, error: insertErr } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' }).select();
  if (insertErr) {
    const msg = insertErr?.message || '';
    if (msg.includes('duplicate') || msg.includes('already exists')) {
      console.log('Admin role already exists for this user.');
    } else {
      console.error('Error inserting role:', insertErr);
      process.exit(1);
    }
  } else {
    console.log('Inserted admin role:', insertData);
  }

  console.log('Done.');
  process.exit(0);
}

await main();
