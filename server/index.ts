import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'node:crypto';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'node:fs/promises';
import path from 'node:path';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 8080);
const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
if (!databaseUrl || !jwtSecret) throw new Error('DATABASE_URL and JWT_SECRET are required');

const pool = new Pool({ connectionString: databaseUrl, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined });
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

const roles: Record<string,string[]> = {
  admin: ['*'], manager: ['records:read','records:write','records:validate','tests:write','templates:write','audit:read','backup:write'],
  technician: ['records:read','records:write'], reception: ['records:read','records:write'], doctor: ['records:read']
};

type User = { id:string; username:string; display_name:string; role:string };
const auth = async (req: any, res: any, next: any) => {
  try {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i,'');
    const payload = jwt.verify(token, jwtSecret) as User;
    const { rows } = await pool.query('SELECT id, username, display_name, role, active FROM users WHERE id=$1',[payload.id]);
    if (!rows[0]?.active) return res.status(401).json({error:'Unauthorized'});
    req.user = rows[0]; next();
  } catch { res.status(401).json({error:'Unauthorized'}); }
};
const allow = (permission:string) => (req:any,res:any,next:any) => {
  const p = roles[req.user.role] || [];
  if (p.includes('*') || p.includes(permission)) return next();
  return res.status(403).json({error:'Forbidden'});
};
const audit = async (userId:string, action:string, entityType:string, entityId:string|null, before:any, after:any, reason?:string) => {
  await pool.query('INSERT INTO audit_logs(user_id,action,entity_type,entity_id,before_data,after_data,reason) VALUES($1,$2,$3,$4,$5,$6,$7)',[userId,action,entityType,entityId,before,after,reason||null]);
};
const id = () => crypto.randomUUID();

app.get('/api/health', async (_req,res) => { const r=await pool.query('SELECT now()'); res.json({ok:true, database:true, time:r.rows[0].now}); });

app.post('/api/auth/login', async (req,res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({error:'Username and password are required'});
  const { rows } = await pool.query('SELECT id,username,display_name,role,password_hash,active FROM users WHERE lower(username)=lower($1)',[username]);
  const u=rows[0];
  if (!u || !u.active || !(await bcrypt.compare(password,u.password_hash))) return res.status(401).json({error:'Invalid credentials'});
  const user={id:u.id,username:u.username,display_name:u.display_name,role:u.role};
  const token=jwt.sign(user,jwtSecret,{expiresIn:'8h'});
  await audit(u.id,'LOGIN','user',u.id,null,user);
  res.json({token,user});
});

app.get('/api/me',auth,(req:any,res)=>res.json({user:req.user}));

app.get('/api/tests',auth,async (_req,res)=>res.json((await pool.query('SELECT id,name_en as "nameEn",name_ar as "nameAr",unit,ref_range_m as "refRangeM",ref_range_f as "refRangeF",category,result_type as "resultType",specimen,method,active,version FROM lab_tests WHERE active=true ORDER BY name_en')).rows));
app.post('/api/tests',auth,allow('tests:write'),async (req:any,res)=>{const t=req.body; await pool.query('INSERT INTO lab_tests(id,name_en,name_ar,unit,ref_range_m,ref_range_f,category,result_type,specimen,method) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[t.id,t.nameEn,t.nameAr||null,t.unit||'',t.refRangeM||'',t.refRangeF||'',t.category||null,t.resultType||'numeric',t.specimen||null,t.method||null]); await audit(req.user.id,'CREATE','lab_test',t.id,null,t); res.status(201).json(t);});

app.get('/api/templates',auth,async (_req,res)=>res.json((await pool.query('SELECT id,name_en as "nameEn",name_ar as "nameAr",category,items,active,version FROM lab_templates WHERE active=true ORDER BY name_en')).rows));

app.get('/api/records',auth,async (_req,res)=>res.json((await pool.query('SELECT id,patient_name as "patientName",age,gender,test_date as date,order_no as "orderNo",lab_no as "labNo",doctor_name as "doctorName",template_id as "templateId",template_name as "templateName",results,notes,created_at as "createdAt",updated_at as "updatedAt",status,version FROM patient_records WHERE status <> $1 ORDER BY test_date DESC,created_at DESC',['void'])).rows));

app.post('/api/records',auth,allow('records:write'),async (req:any,res)=>{
  const r=req.body; const recordId=r.id||id();
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const orderNo=r.orderNo || `ORD-${new Date().getFullYear()}-${Date.now()}`;
    const labNo=r.labNo || `LAB-${new Date().getFullYear()}-${Date.now()}`;
    const q=await client.query(`INSERT INTO patient_records(id,patient_name,age,gender,test_date,order_no,lab_no,doctor_name,template_id,template_name,results,notes,status,created_by,updated_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending',$13,$13) RETURNING *`,[recordId,r.patientName,r.age||'',r.gender,r.date||new Date().toISOString().slice(0,10),orderNo,labNo,r.doctorName||'',r.templateId||null,r.templateName||null,JSON.stringify(r.results||[]),r.notes||null,req.user.id]);
    await client.query('COMMIT'); await audit(req.user.id,'CREATE','patient_record',recordId,null,q.rows[0]); res.status(201).json(q.rows[0]);
  } catch(e:any){await client.query('ROLLBACK'); res.status(400).json({error:e.code==='23505'?'Duplicate order/lab number':e.message});} finally{client.release();}
});

app.put('/api/records/:id',auth,allow('records:write'),async (req:any,res)=>{
  const client=await pool.connect(); try{await client.query('BEGIN');
    const old=(await client.query('SELECT * FROM patient_records WHERE id=$1 FOR UPDATE',[req.params.id])).rows[0];
    if(!old) return res.status(404).json({error:'Not found'});
    if(old.status==='validated' && req.user.role!=='admin') return res.status(409).json({error:'Validated result requires administrator amendment'});
    const r=req.body;
    const updated=(await client.query(`UPDATE patient_records SET patient_name=$2,age=$3,gender=$4,test_date=$5,doctor_name=$6,template_id=$7,template_name=$8,results=$9,notes=$10,status='pending',updated_at=now(),updated_by=$11,version=version+1 WHERE id=$1 RETURNING *`,[req.params.id,r.patientName,r.age||'',r.gender,r.date,r.doctorName||'',r.templateId||null,r.templateName||null,JSON.stringify(r.results||[]),r.notes||null,req.user.id])).rows[0];
    await client.query('COMMIT'); await audit(req.user.id,'UPDATE','patient_record',req.params.id,old,updated,r.reason); res.json(updated);
  }catch(e:any){await client.query('ROLLBACK');res.status(400).json({error:e.message});}finally{client.release();}
});

app.post('/api/records/:id/validate',auth,allow('records:validate'),async(req:any,res)=>{const q=await pool.query("UPDATE patient_records SET status='validated',verified_by=$2,verified_at=now(),updated_by=$2,updated_at=now(),version=version+1 WHERE id=$1 AND status <> 'void' RETURNING *",[req.params.id,req.user.id]);if(!q.rows[0])return res.status(404).json({error:'Not found'});await audit(req.user.id,'VALIDATE','patient_record',req.params.id,null,q.rows[0]);res.json(q.rows[0]);});

app.post('/api/records/:id/void',auth,allow('records:validate'),async(req:any,res)=>{if(!req.body?.reason)return res.status(400).json({error:'Reason is required'});const q=await pool.query("UPDATE patient_records SET status='void',updated_by=$2,updated_at=now(),version=version+1 WHERE id=$1 RETURNING *",[req.params.id,req.user.id]);if(!q.rows[0])return res.status(404).json({error:'Not found'});await audit(req.user.id,'VOID','patient_record',req.params.id,q.rows[0],null,req.body.reason);res.json({ok:true});});

app.get('/api/audit',auth,allow('audit:read'),async(_req,res)=>res.json((await pool.query('SELECT a.*,u.username FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 1000')).rows));

app.get('/api/backup/export',auth,allow('backup:write'),async(req:any,res)=>{
  const tables=['users','lab_tests','lab_templates','patient_records','audit_logs']; const out:any={version:1,createdAt:new Date().toISOString(),tables:{}};
  for(const t of tables) out.tables[t]=(await pool.query(`SELECT * FROM ${t}`)).rows;
  const dir=process.env.BACKUP_DIR||'/tmp/haitham-backups'; await fs.mkdir(dir,{recursive:true}); const name=`lis-${Date.now()}.json`; await fs.writeFile(path.join(dir,name),JSON.stringify(out)); await pool.query('INSERT INTO backups(created_by,storage,object_name,size_bytes) VALUES($1,$2,$3,$4)',[req.user.id,'local',name,Buffer.byteLength(JSON.stringify(out))]); res.download(path.join(dir,name),name);
});

app.use(express.static(path.resolve(process.cwd(),'dist')));
app.get('*',(_req,res)=>res.sendFile(path.resolve(process.cwd(),'dist/index.html')));
app.listen(port,()=>console.log(`LIS server listening on ${port}`));
