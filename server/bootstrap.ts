import bcrypt from 'bcryptjs';
import pg from 'pg';
const { Pool } = pg;

export async function bootstrap() {
  const databaseUrl=process.env.DATABASE_URL;
  if(!databaseUrl) throw new Error('DATABASE_URL is required');
  const pool=new Pool({connectionString:databaseUrl,ssl:process.env.NODE_ENV==='production'?{rejectUnauthorized:false}:undefined});
  const adminUser=process.env.ADMIN_USERNAME||'admin';
  const adminPassword=process.env.ADMIN_PASSWORD;
  if(!adminPassword || adminPassword.length<12) throw new Error('ADMIN_PASSWORD must be configured and at least 12 characters');
  const hash=await bcrypt.hash(adminPassword,12);
  await pool.query(`INSERT INTO users(username,password_hash,display_name,role) VALUES($1,$2,$3,'admin') ON CONFLICT(username) DO UPDATE SET password_hash=EXCLUDED.password_hash,active=true`,[adminUser,hash,process.env.ADMIN_DISPLAY_NAME||'مدير النظام']);
  await pool.end();
}
