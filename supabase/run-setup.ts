import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSetup() {
  const sql = readFileSync(join(__dirname, 'setup.sql'), 'utf-8');

  console.log('Running setup SQL...\n');

  // Split by semicolons and run each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    const firstLine = statement.split('\n').find(l => l.trim() && !l.trim().startsWith('--')) || '';
    console.log(`Running: ${firstLine.substring(0, 60)}...`);

    const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

    if (error) {
      // Try direct query for DDL statements
      const { error: error2 } = await supabase.from('_exec').select(statement);
      if (error2 && !error2.message.includes('does not exist')) {
        console.log(`  Note: ${error.message}`);
      }
    }
  }

  console.log('\nSetup complete! Checking if table exists...');

  const { data, error } = await supabase.from('memories').select('id').limit(1);

  if (error && error.code === '42P01') {
    console.log('\n⚠️  Table not created - you need to run the SQL manually in Supabase dashboard.');
    console.log('   Go to: SQL Editor → paste contents of supabase/setup.sql → Run');
  } else if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('✓ memories table exists and is ready!');
  }
}

runSetup();
