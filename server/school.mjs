import {randomUUID,randomBytes} from 'node:crypto';
export function initSchool(db){db.exec(`
 CREATE TABLE IF NOT EXISTS study_groups(id TEXT PRIMARY KEY,owner_id TEXT REFERENCES users(id),name TEXT NOT NULL,code TEXT UNIQUE NOT NULL,created TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS group_members(group_id TEXT REFERENCES study_groups(id) ON DELETE CASCADE,user_id TEXT REFERENCES users(id),share_name INTEGER DEFAULT 0,PRIMARY KEY(group_id,user_id));
 CREATE TABLE IF NOT EXISTS group_posts(id TEXT PRIMARY KEY,group_id TEXT REFERENCES study_groups(id) ON DELETE CASCADE,author_id TEXT REFERENCES users(id),kind TEXT NOT NULL,title TEXT NOT NULL,data TEXT NOT NULL,created TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS post_reactions(post_id TEXT REFERENCES group_posts(id) ON DELETE CASCADE,user_id TEXT REFERENCES users(id),value TEXT NOT NULL,PRIMARY KEY(post_id,user_id));
`);}
export function schoolRoute({db,path,method,body,user,send,fail}){
 if(!path.startsWith('/api/school'))return false;
 const all=(s,...a)=>db.prepare(s).all(...a),get=(s,...a)=>db.prepare(s).get(...a),run=(s,...a)=>db.prepare(s).run(...a);
 const clean=(s,max=150)=>typeof s==='string'?s.trim().slice(0,max):'';
 const groups=()=>all('SELECT g.id,g.name,g.owner_id,g.created,m.share_name FROM study_groups g JOIN group_members m ON m.group_id=g.id WHERE m.user_id=?',user.id).map(g=>({...g,code:g.owner_id===user.id?get('SELECT code FROM study_groups WHERE id=?',g.id).code:undefined}));
 if(path==='/api/school/groups'&&method==='GET'){send(groups());return true;}
 if(path==='/api/school/groups'&&method==='POST'){
  if(!clean(body.name))fail('Enter a name for your group.');
  const id=randomUUID(),code=randomBytes(16).toString('hex');
  run('INSERT INTO study_groups VALUES(?,?,?,?,?)',id,user.id,clean(body.name),code,new Date().toISOString());run('INSERT INTO group_members(group_id,user_id) VALUES(?,?)',id,user.id);send({id,code},201);return true;
 }
 if(path==='/api/school/join'&&method==='POST'){
  const g=get('SELECT * FROM study_groups WHERE code=?',clean(body.code,64));if(!g)fail('That invitation code was not found.',404);
  run('INSERT OR IGNORE INTO group_members(group_id,user_id) VALUES(?,?)',g.id,user.id);send({id:g.id});return true;
 }
 const match=path.match(/^\/api\/school\/groups\/([^/]+)(?:\/(.*))?$/);if(!match)fail('School route not found.',404);
 const [,id,action='']=match,group=get('SELECT g.* FROM study_groups g JOIN group_members m ON m.group_id=g.id WHERE g.id=? AND m.user_id=?',id,user.id);if(!group)fail('This group is not available to your account.',404);
 const owner=group.owner_id===user.id;
 if(action==='preferences'&&method==='PATCH'){run('UPDATE group_members SET share_name=? WHERE group_id=? AND user_id=?',body.share_name?1:0,id,user.id);send({ok:true});return true;}
 if(action==='leaderboard'&&method==='GET'){
  const range=clean(body.range)||'all';const rows=all('SELECT u.id,u.name,m.share_name FROM group_members m JOIN users u ON u.id=m.user_id WHERE m.group_id=?',id);
  send(rows.map(u=>{const activity=all('SELECT xp,created FROM activity WHERE user_id=?',u.id);const date=new Date(),day=(date.getDay()+6)%7;date.setDate(date.getDate()-day);date.setHours(0,0,0,0);const month=new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString();return {id:u.id===user.id?u.id:undefined,name:u.id===user.id?u.name:u.share_name?u.name:'Anonymous learner',self:u.id===user.id,all:activity.reduce((n,a)=>n+a.xp,0),week:activity.filter(a=>a.created>=date.toISOString()).reduce((n,a)=>n+a.xp,0),month:activity.filter(a=>a.created>=month).reduce((n,a)=>n+a.xp,0)};}));return true;
 }
 if(action==='posts'&&method==='GET'){
  send(all('SELECT p.*,u.name author FROM group_posts p JOIN users u ON p.author_id=u.id WHERE group_id=? ORDER BY p.created DESC',id).map(p=>({...p,data:JSON.parse(p.data),mine:p.author_id===user.id,canEdit:owner||p.author_id===user.id,reaction:get('SELECT value FROM post_reactions WHERE post_id=? AND user_id=?',p.id,user.id)?.value,count:get('SELECT COUNT(*) n FROM post_reactions WHERE post_id=?',p.id).n})));return true;
 }
 if(action==='posts'&&method==='POST'){
  if(!['announcements','events','ptm','circulars','achievements','class-calendar','resources','timetable'].includes(body.kind))fail('Choose a supported group tool.');
  if(!owner&&!['resources','achievements'].includes(body.kind))fail('Only the group organizer can publish this item.',403);
  if(!clean(body.title))fail('A title is required.');
  if(JSON.stringify(body.data||{}).length>100000)fail('This post is too long.');
  if(body.kind==='ptm'&&(!body.data?.date||!body.data?.start_time))fail('Choose a meeting date and time.');
  const pid=randomUUID();run('INSERT INTO group_posts VALUES(?,?,?,?,?,?,?)',pid,id,user.id,body.kind,clean(body.title),JSON.stringify(body.data||{}),new Date().toISOString());send({id:pid},201);return true;
 }
 const postMatch=action.match(/^posts\/([^/]+)(?:\/(react))?$/);
 if(postMatch){const [,pid,reaction]=postMatch,p=get('SELECT * FROM group_posts WHERE id=? AND group_id=?',pid,id);if(!p)fail('This post was not found.',404);
  if(reaction&&method==='POST'){
   if(body.value==='remove'){run('DELETE FROM post_reactions WHERE post_id=? AND user_id=?',pid,user.id);send({ok:true});return true;}
   const expected=p.kind==='ptm'?'booked':p.kind==='events'?'attending':'read';if(body.value!==expected)fail('Invalid response.');
   if(p.kind==='ptm'&&get('SELECT 1 FROM post_reactions WHERE post_id=? AND user_id!=?',pid,user.id))fail('This meeting has already been reserved. Choose another time.',409);
   run('INSERT INTO post_reactions VALUES(?,?,?) ON CONFLICT(post_id,user_id) DO UPDATE SET value=excluded.value',pid,user.id,expected);send({ok:true});return true;
  }
  if(!owner&&p.author_id!==user.id)fail('Only the author or organizer can change this post.',403);
  if(method==='DELETE'){run('DELETE FROM group_posts WHERE id=?',pid);send({ok:true});return true;}
 }
 fail('School route not found.',404);
}
