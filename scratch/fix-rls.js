import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map(part => part.trim()))
)

const supabaseUrl = env.VITE_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function fixRLS() {
  console.log('Fixing RLS policies for admin_users...')
  
  const sql = `
    -- Xoá policy cũ gây vòng lặp
    DROP POLICY IF EXISTS "admin_only_admin_users" ON admin_users;
    
    -- Cho phép user xem trạng thái admin của chính mình
    CREATE POLICY "admin_read_own_status" 
    ON admin_users 
    FOR SELECT 
    USING (auth.uid() = id);
    
    -- Cho phép admin quản lý tất cả record
    CREATE POLICY "admin_manage_all" 
    ON admin_users 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM admin_users WHERE id = auth.uid()
      )
    );
  `;

  // Since we don't have a direct SQL runner in standard supabase-js, 
  // and we are using service role key, we can try to perform an operation 
  // but better to just explain that I need to run this SQL.
  
  // WAIT: I can use supabase.rpc if I had a custom function, but I don't.
  // Actually, I can use the StitchMCP if it has a SQL tool? No.
  
  console.log('Please execute the following SQL in your Supabase SQL Editor to fix the login hang:')
  console.log(sql)
}

fixRLS()
