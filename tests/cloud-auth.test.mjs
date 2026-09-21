import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';

const apiOrigin='http://127.0.0.1:3012';
let authServer,app;

function call(path,{token,method='GET',body}={}){
 return fetch(apiOrigin+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});
}

before(async()=>{
 authServer=createServer((req,res)=>{
  const token=req.headers.authorization?.replace('Bearer ','');
  const users={alice:{id:'10000000-0000-4000-8000-000000000001',email:'alice@cloud.test',user_metadata:{full_name:'Cloud Alice',role:'student'}},bob:{id:'10000000-0000-4000-8000-000000000002',email:'bob@cloud.test',user_metadata:{full_name:'Cloud Bob',role:'student'}}};
  res.setHeader('Content-Type','application/json');
  if(req.url==='/auth/v1/user'&&users[token])return res.end(JSON.stringify(users[token]));
  res.statusCode=401;res.end(JSON.stringify({message:'invalid token'}));
 });
 await new Promise(resolve=>authServer.listen(3020,'127.0.0.1',resolve));
 app=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,API_PORT:'3012',DB_PATH:':memory:',SUPABASE_URL:'http://127.0.0.1:3020',SUPABASE_ANON_KEY:'public-test-key'},stdio:'pipe'});
 await new Promise((resolve,reject)=>{app.stdout.on('data',resolve);app.on('error',reject);setTimeout(()=>reject(new Error('API did not start')),5000).unref();});
});

after(async()=>{app?.kill();await new Promise(resolve=>authServer?.close(resolve));});

test('Supabase bearer identities can use the API and remain isolated',async()=>{
 assert.equal((await call('/api/school/groups')).status,401);
 assert.equal((await call('/api/school/groups',{token:'invalid'})).status,401);
 const created=await call('/api/school/groups',{token:'alice',method:'POST',body:{name:'Cloud physics'}});
 assert.equal(created.status,201);
 const group=await created.json();
 const aliceGroups=await (await call('/api/school/groups',{token:'alice'})).json();
 assert.equal(aliceGroups[0].name,'Cloud physics');
 assert.equal((await call(`/api/school/groups/${group.id}/posts`,{token:'bob'})).status,404);
});
