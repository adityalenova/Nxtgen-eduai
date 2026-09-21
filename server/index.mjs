import {gemini,initVoice,voiceRoute} from './providers.mjs';
import {initSchool,schoolRoute} from './school.mjs';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try { process.loadEnvFile(resolve(root, '.env.local')); } catch {}
mkdirSync(resolve(root, 'data'), { recursive: true });
const db = new DatabaseSync(process.env.DB_PATH || resolve(root, 'data/nxtgen.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL,language TEXT DEFAULT 'English',grade TEXT DEFAULT '',created TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,kind TEXT NOT NULL,title TEXT NOT NULL,data TEXT NOT NULL,created TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS records_owner ON records(user_id,kind);
 CREATE TABLE IF NOT EXISTS activity(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,action TEXT NOT NULL,xp INTEGER NOT NULL,created TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS timers(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),minutes INTEGER,ends INTEGER,completed INTEGER DEFAULT 0);`);
initSchool(db);
initVoice(db,root);
const hash = x => createHash('sha256').update(x).digest('hex');
const safeUser = u => u && ({ id:u.id,email:u.email,name:u.name,role:u.role,language:u.language,grade:u.grade });
const read = (sql,...args) => db.prepare(sql).get(...args);
const all = (sql,...args) => db.prepare(sql).all(...args);
const run = (sql,...args) => db.prepare(sql).run(...args);
const now = () => new Date().toISOString();
const fail = (message, status=400) => { throw Object.assign(new Error(message),{status}); };
const text = (x,max=500) => typeof x === 'string' ? x.trim().slice(0,max) : '';
const attempts = new Map();
function rate(key, limit=30) { const a=attempts.get(key)||{n:0,until:Date.now()+600000}; if(Date.now()>a.until){a.n=0;a.until=Date.now()+600000;} a.n++; attempts.set(key,a); if(a.n>limit) fail('Too many attempts. Please try again in ten minutes.',429); }
function award(uid,action,xp,id=randomUUID()) { run('INSERT OR IGNORE INTO activity VALUES(?,?,?,?,?)',id,uid,action,xp,now()); }
function stats(uid) {
 const activity=all('SELECT * FROM activity WHERE user_id=? ORDER BY created DESC',uid);
 const dates=[...new Set(activity.map(a=>new Date(a.created).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'})))];
 let streak=0; const cursor=new Date(); const date=()=>cursor.toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
 if(!dates.includes(date())) cursor.setDate(cursor.getDate()-1);
 while(dates.includes(date())) {streak++;cursor.setDate(cursor.getDate()-1);}
 return {xp:activity.reduce((n,a)=>n+a.xp,0),streak,activity,minutes:read('SELECT COALESCE(SUM(minutes),0) n FROM timers WHERE user_id=? AND completed=1',uid).n};
}
export const server = createServer(async(req,res)=>{
 res.setHeader('Content-Type','application/json'); res.setHeader('Cache-Control','no-store'); res.setHeader('X-Content-Type-Options','nosniff');
 const send=(data,status=200)=>{res.statusCode=status;res.end(JSON.stringify(data));};
 try {
  const path=new URL(req.url,'http://localhost').pathname;
  if(!['GET','HEAD'].includes(req.method)) {
   const origin=req.headers.origin;
   if(origin && ![process.env.APP_ORIGIN||'http://127.0.0.1:5173','http://localhost:5173'].includes(origin)) fail('Request origin is not allowed.',403);
   if(!req.headers['content-type']?.startsWith('application/json')) fail('JSON content required.',415);
  }
  let raw=''; for await (const chunk of req){raw+=chunk;if(raw.length>16_000_000) fail('Request is too large.',413);}
  let body={}; try{body=raw?JSON.parse(raw):{};}catch{fail('Invalid request.');}
  if(path==='/api/health') return send({ok:true,ai:Boolean(process.env.GEMINI_API_KEY),voice:Boolean(process.env.ELEVENLABS_API_KEY)});
  const cookie=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('nxtgen_session='))?.slice(15);
  const session=cookie && read('SELECT * FROM sessions WHERE token=? AND expires>?',hash(cookie),Date.now());
  const user=session && read('SELECT * FROM users WHERE id=?',session.user_id);
  if(['/api/signup','/api/login'].includes(path) && req.method==='POST') {
   rate(req.socket.remoteAddress+'auth');
   const email=text(body.email,254).toLowerCase(), password=body.password;
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof password!=='string'||password.length<10||password.length>256) fail('Use a valid email and a password between 10 and 256 characters.');
   let u=read('SELECT * FROM users WHERE email=?',email);
   if(path==='/api/signup') {
    if(u) fail('An account already exists for this email. Please log in.',409);
    const name=text(body.name,80); if(!name) fail('Please enter your name.');
    const salt=randomBytes(16).toString('hex'); const digest=scryptSync(password,salt,64).toString('hex');
    const role=['student','teacher','parent'].includes(body.role)?body.role:'student';
    run('INSERT INTO users(id,email,name,password,role,created,grade) VALUES(?,?,?,?,?,?,?)',randomUUID(),email,name,`${salt}:${digest}`,role,now(),text(body.grade,80));
    u=read('SELECT * FROM users WHERE email=?',email);
   } else {
    const [salt,digest]=(u?.password||'invalid:'+ '00'.repeat(64)).split(':');
    const candidate=scryptSync(password,salt,64);
    if(!u||!timingSafeEqual(candidate,Buffer.from(digest,'hex'))) fail('Email or password is incorrect.',401);
   }
   const token=randomBytes(32).toString('hex');
   run('INSERT INTO sessions VALUES(?,?,?)',hash(token),u.id,Date.now()+7*86400000);
   res.setHeader('Set-Cookie',`nxtgen_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${process.env.NODE_ENV==='production'?'; Secure':''}`);
   return send({user:safeUser(u)});
  }
  if(!user) fail('Please log in to your learning space.',401);
  if(schoolRoute({db,path,method:req.method,body,user,send,fail}))return;
  if(await voiceRoute({db,root,path,req,res,body,user,send,rate}))return;
  if(path==='/api/me' && req.method==='GET') return send({user:safeUser(user),stats:stats(user.id)});
  if(path==='/api/logout' && req.method==='POST') {run('DELETE FROM sessions WHERE token=?',hash(cookie));res.setHeader('Set-Cookie','nxtgen_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');return send({ok:true});}
  if(path==='/api/profile' && req.method==='PATCH') {if(!text(body.name,80))fail('Your name is required.');run('UPDATE users SET name=?,language=?,grade=? WHERE id=?',text(body.name,80),text(body.language,40),text(body.grade,80),user.id);return send({user:safeUser(read('SELECT * FROM users WHERE id=?',user.id))});}
  if(path==='/api/records' && req.method==='GET') return send(all('SELECT * FROM records WHERE user_id=? ORDER BY created DESC',user.id).map(r=>({...r,data:JSON.parse(r.data)})));
  if(path==='/api/records' && req.method==='POST') {
   if(!text(body.title)||!text(body.kind,60))fail('A title and tool are required.');
   const id=randomUUID();run('INSERT INTO records VALUES(?,?,?,?,?,?)',id,user.id,text(body.kind,60),text(body.title),JSON.stringify(body.data||{}),now());
   if(body.kind==='notebooks') award(user.id,'Source added',5,id);
   if(body.kind==='mind-maps')award(user.id,'Mind map created',10,id);
   if(body.kind==='voice-notes')award(user.id,'Voice note saved',8,id);
   if(body.kind==='quiz-results') {
    const q=body.data?.questions, answers=body.data?.answers;
    if(Array.isArray(q)&&q.length&&answers){const score=Math.round(q.filter((item,i)=>String(answers[i]||'').trim().toLowerCase()===String(item.correct).trim().toLowerCase()).length/q.length*100);run('UPDATE records SET data=? WHERE id=?',JSON.stringify({...body.data,score}),id);award(user.id,'Quiz completed',score===100?50:score>=80?25:10,id);}
   }
   return send({id},201);
  }
  if(path.startsWith('/api/records/')) {
   const id=path.split('/').pop(); const record=read('SELECT * FROM records WHERE id=? AND user_id=?',id,user.id); if(!record)fail('This item was not found in your workspace.',404);
   if(req.method==='DELETE'){run('DELETE FROM records WHERE id=? AND user_id=?',id,user.id);return send({ok:true});}
   if(req.method==='PATCH'){run('UPDATE records SET title=?,data=? WHERE id=? AND user_id=?',text(body.title||record.title),JSON.stringify(body.data||JSON.parse(record.data)),id,user.id);if(body.data?.done && !JSON.parse(record.data).done)award(user.id,'Study task completed',5,`done-${id}`);return send({ok:true});}
  }
  if(path==='/api/timer' && req.method==='POST') {const minutes=Number(body.minutes);if(!Number.isInteger(minutes)||minutes<1||minutes>180)fail('Choose 1–180 minutes.');const id=randomUUID(),ends=Date.now()+minutes*60000;run('INSERT INTO timers(id,user_id,minutes,ends) VALUES(?,?,?,?)',id,user.id,minutes,ends);return send({id,ends});}
  if(path==='/api/timer/complete' && req.method==='POST') {const t=read('SELECT * FROM timers WHERE id=? AND user_id=?',text(body.id),user.id);if(!t||t.ends>Date.now())fail('This focus session is not complete yet.');run('UPDATE timers SET completed=1 WHERE id=?',t.id);award(user.id,'Focus session',20,t.id);return send(stats(user.id));}
  if(path==='/api/generate' && req.method==='POST') {
   rate(user.id+'ai',40);
   const content=text(body.content,150000),instruction=text(body.instruction,6000);
   if(!content&&!body.image)fail('Add your source material first.');
   if(body.image&&(!['image/jpeg','image/png','image/webp'].includes(body.image.mimeType)||typeof body.image.data!=='string'||body.image.data.length>14_000_000))fail('Choose a supported image smaller than 10 MB.');
   const output=await gemini({content,instruction,image:body.image,user,json:body.json===true});
   return send({output});
  }
  fail('Route not found.',404);
 } catch(error){send({error:error.status?error.message:'Something went wrong. Please try again.'},error.status||500);if(!error.status)console.error(error.message);}
});
server.listen(Number(process.env.API_PORT||3001),'127.0.0.1',()=>console.log('NxtGen API http://127.0.0.1:'+(process.env.API_PORT||3001)));
