import {cloudError,isSupabaseConfigured,supabase} from './supabase';

const cloudPaths=/^\/(signup|login|logout|forgot-password|update-password|me|profile|records(?:\/[^/]+)?|timer(?:\/complete)?|school(?:\/.*)?)$/;
const clean=(value,max=500)=>typeof value==='string'?value.trim().slice(0,max):'';
const rowRecord=row=>({...row,created:row.created_at});

async function currentUser(){
 const {data,error}=await supabase.auth.getUser();
 if(error||!data.user)throw Object.assign(new Error('Please log in to your learning space.'),{status:401});
 return data.user;
}

async function ensureProfile(user,details={}){
 const metadata=user.user_metadata||{};
 const profile={id:user.id,display_name:clean(details.name||metadata.full_name||metadata.name||user.email?.split('@')[0],80)||'Learner',role:['student','teacher','parent','management'].includes(details.role||metadata.role)?details.role||metadata.role:'student',grade:clean(details.grade??metadata.grade??'',80),language:clean(details.language??metadata.language??'English',40)||'English'};
 const {error}=await supabase.from('profiles').upsert(profile,{onConflict:'id',ignoreDuplicates:true});
 if(error)throw cloudError(error,'Your profile could not be created.');
 const {data, error:readError}=await supabase.from('profiles').select('*').eq('id',user.id).single();
 if(readError)throw cloudError(readError,'Your profile could not be loaded.');
 return data;
}

async function profileFor(user){
 let {data,error}=await supabase.from('profiles').select('*').eq('id',user.id).maybeSingle();
 if(error)throw cloudError(error);
 if(!data)data=await ensureProfile(user);
 return {id:user.id,email:user.email,name:data.display_name,role:data.role,language:data.language,grade:data.grade};
}

function streakFrom(activity){
 const dates=new Set(activity.map(a=>new Date(a.created_at).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'})));const cursor=new Date();let streak=0;const day=()=>cursor.toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});if(!dates.has(day()))cursor.setDate(cursor.getDate()-1);while(dates.has(day())){streak++;cursor.setDate(cursor.getDate()-1);}return streak;
}

async function cloudStats(userId){
 const [{data:activity,error:aError},{data:timers,error:tError}]=await Promise.all([supabase.from('activity').select('*').eq('user_id',userId).order('created_at',{ascending:false}),supabase.from('focus_timers').select('minutes').eq('user_id',userId).eq('completed',true)]);
 if(aError||tError)throw cloudError(aError||tError);
 return {xp:activity.reduce((sum,item)=>sum+item.xp,0),streak:streakFrom(activity),activity:activity.map(a=>({...a,created:a.created_at})),minutes:timers.reduce((sum,t)=>sum+t.minutes,0)};
}

async function award(userId,action,xp,dedupeKey){
 const {error}=await supabase.rpc('award_activity',{event_action:action,event_xp:xp,event_key:dedupeKey||crypto.randomUUID()});if(error)throw cloudError(error);
}

async function schoolApi(path,{method='GET',body={}}={}){
 const user=await currentUser();
 const call=async(name,args={})=>{const {data,error}=await supabase.rpc(name,args);if(error)throw cloudError(error);return data;};
 if(path==='/school/groups'&&method==='GET')return call('my_study_groups');
 if(path==='/school/groups'&&method==='POST'){const rows=await call('create_study_group',{group_name:clean(body.name,150)});return Array.isArray(rows)?rows[0]:rows;}
 if(path==='/school/join'&&method==='POST'){const id=await call('join_study_group',{code:clean(body.code,64)});return {id};}
 const match=path.match(/^\/school\/groups\/([^/]+)(?:\/(.*))?$/);if(!match)throw Object.assign(new Error('School route not found.'),{status:404});
 const [,groupId,action='']=match;
 if(action==='posts'&&method==='GET'){const rows=await call('group_feed',{requested_group:groupId});return rows.map(row=>({...row,created:row.created_at,canEdit:row.can_edit,count:Number(row.reaction_count||0)}));}
 if(action==='posts'&&method==='POST'){const id=await call('publish_group_post',{requested_group:groupId,post_kind:body.kind,post_title:clean(body.title,500),post_data:body.data||{}});return {id};}
 if(action==='leaderboard'&&method==='GET'){const rows=await call('group_leaderboard',{requested_group:groupId});return rows.map(row=>({id:row.user_id,name:row.name,self:row.self,all:Number(row.all_xp||0),week:Number(row.week_xp||0),month:Number(row.month_xp||0)}));}
 if(action==='preferences'&&method==='PATCH'){await call('set_group_name_preference',{requested_group:groupId,visible:!!body.share_name});return {ok:true};}
 const post=action.match(/^posts\/([^/]+)(?:\/(react))?$/);if(post){if(post[2]&&method==='POST'){await call('react_to_group_post',{requested_post:post[1],response:body.value});return {ok:true};}if(method==='DELETE'){await call('delete_group_post',{requested_post:post[1]});return {ok:true};}}
 throw Object.assign(new Error('School route not found.'),{status:404});
}

async function cloudApi(path,{method='GET',body={}}={}){
 if(path==='/signup'&&method==='POST'){
  const email=clean(body.email,254).toLowerCase(),password=body.password;if(!email||typeof password!=='string'||password.length<10)throw Object.assign(new Error('Use a valid email and a password of at least 10 characters.'),{status:400});
  const metadata={full_name:clean(body.name,80),role:body.role||'student',grade:clean(body.grade,80),language:'English'};
  const {data,error}=await supabase.auth.signUp({email,password,options:{data:metadata,emailRedirectTo:`${location.origin}/auth`}});if(error)throw cloudError(error);if(data.user&&data.session)await ensureProfile(data.user,body);return {user:data.user,needsConfirmation:!data.session};
 }
 if(path==='/login'&&method==='POST'){
  const {data,error}=await supabase.auth.signInWithPassword({email:clean(body.email,254).toLowerCase(),password:body.password});if(error)throw cloudError(error);await ensureProfile(data.user);return {user:await profileFor(data.user)};
 }
 if(path==='/forgot-password'&&method==='POST'){
  const email=clean(body.email,254).toLowerCase();if(!email)throw Object.assign(new Error('Enter your email address.'),{status:400});const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}/auth?reset=1`});if(error)throw cloudError(error);return {ok:true};
 }
 if(path==='/update-password'&&method==='POST'){
  if(typeof body.password!=='string'||body.password.length<10)throw Object.assign(new Error('Use a password of at least 10 characters.'),{status:400});const {error}=await supabase.auth.updateUser({password:body.password});if(error)throw cloudError(error);return {ok:true};
 }
 if(path==='/logout'&&method==='POST'){const {error}=await supabase.auth.signOut();if(error)throw cloudError(error);return {ok:true};}
 if(path.startsWith('/school/'))return schoolApi(path,{method,body});
 const user=await currentUser();
 if(path==='/me'&&method==='GET')return {user:await profileFor(user),stats:await cloudStats(user.id)};
 if(path==='/profile'&&method==='PATCH'){
  const values={display_name:clean(body.name,80),language:clean(body.language,40)||'English',grade:clean(body.grade,80),updated_at:new Date().toISOString()};if(!values.display_name)throw Object.assign(new Error('Your name is required.'),{status:400});const {error}=await supabase.from('profiles').update(values).eq('id',user.id);if(error)throw cloudError(error);return {user:await profileFor(user)};
 }
 if(path==='/records'&&method==='GET'){
  const {data,error}=await supabase.from('records').select('*').eq('user_id',user.id).order('created_at',{ascending:false});if(error)throw cloudError(error);return data.map(rowRecord);
 }
 if(path==='/records'&&method==='POST'){
  const kind=clean(body.kind,60),title=clean(body.title,500);if(!kind||!title)throw Object.assign(new Error('A title and tool are required.'),{status:400});const payload={...(body.data||{})};if(kind==='quiz-results'&&Array.isArray(payload.questions)&&payload.questions.length&&payload.answers){payload.score=Math.round(payload.questions.filter((q,i)=>String(payload.answers[i]||'').trim().toLowerCase()===String(q.correct).trim().toLowerCase()).length/payload.questions.length*100);}
  const {data,error}=await supabase.from('records').insert({user_id:user.id,kind,title,data:payload}).select('id').single();if(error)throw cloudError(error);if(kind==='notebooks')await award(user.id,'Source added',5,data.id);if(kind==='mind-maps')await award(user.id,'Mind map created',10,data.id);if(kind==='voice-notes')await award(user.id,'Voice note saved',8,data.id);if(kind==='quiz-results')await award(user.id,'Quiz completed',payload.score===100?50:payload.score>=80?25:10,data.id);return {id:data.id};
 }
 const recordMatch=path.match(/^\/records\/([^/]+)$/);
 if(recordMatch&&method==='DELETE'){const {error}=await supabase.from('records').delete().eq('id',recordMatch[1]).eq('user_id',user.id);if(error)throw cloudError(error);return {ok:true};}
 if(recordMatch&&method==='PATCH'){
  const {data:old,error:readError}=await supabase.from('records').select('*').eq('id',recordMatch[1]).eq('user_id',user.id).single();if(readError)throw cloudError(readError);const next={title:clean(body.title||old.title,500),data:body.data||old.data,updated_at:new Date().toISOString()};const {error}=await supabase.from('records').update(next).eq('id',old.id);if(error)throw cloudError(error);if(next.data?.done&&!old.data?.done)await award(user.id,'Study task completed',5,`done-${old.id}`);return {ok:true};
 }
 if(path==='/timer'&&method==='POST'){
  const minutes=Number(body.minutes);if(!Number.isInteger(minutes)||minutes<1||minutes>180)throw Object.assign(new Error('Choose 1–180 minutes.'),{status:400});const {data,error}=await supabase.from('focus_timers').insert({user_id:user.id,minutes,ends_at:new Date(Date.now()+minutes*60000).toISOString()}).select('id,ends_at').single();if(error)throw cloudError(error);return {id:data.id,ends:new Date(data.ends_at).getTime()};
 }
 if(path==='/timer/complete'&&method==='POST'){const {data,error}=await supabase.rpc('complete_focus_timer',{timer_id:body.id});if(error)throw cloudError(error);if(!data)throw Object.assign(new Error('This focus session is not complete yet.'),{status:400});return cloudStats(user.id);}
 throw Object.assign(new Error('Cloud route not found.'),{status:404});
}

export async function api(path,options={}){
 if(isSupabaseConfigured&&cloudPaths.test(path))return cloudApi(path,options);
 const headers={'Content-Type':'application/json',...options.headers};if(isSupabaseConfigured){const {data}=await supabase.auth.getSession();if(data.session)headers.Authorization=`Bearer ${data.session.access_token}`;}
 const base=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');const response=await fetch(`${base}/api${path}`,{credentials:'same-origin',...options,headers,body:options.body?JSON.stringify(options.body):undefined});const data=await response.json().catch(()=>({error:'The application service is unavailable.'}));if(!response.ok)throw Object.assign(new Error(data.error||'Request failed'),{status:response.status});return data;
}

export const saveRecord=(kind,title,data)=>api('/records',{method:'POST',body:{kind,title,data}});
export function download(name,content,type='text/plain'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
