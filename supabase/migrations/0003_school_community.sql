-- Shared school and community workspaces. All reads are scoped to group membership.
create table if not exists public.study_groups (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(char_length(name) between 1 and 150),
 invite_code text unique not null, created_at timestamptz not null default now()
);
create table if not exists public.group_members (
 group_id uuid not null references public.study_groups(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 share_name boolean not null default false, created_at timestamptz not null default now(), primary key(group_id,user_id)
);
create table if not exists public.group_posts (
 id uuid primary key default gen_random_uuid(), group_id uuid not null references public.study_groups(id) on delete cascade,
 author_id uuid not null references auth.users(id) on delete cascade, kind text not null,
 title text not null check(char_length(title) between 1 and 500), data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table if not exists public.post_reactions (
 post_id uuid not null references public.group_posts(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
 value text not null, created_at timestamptz not null default now(), primary key(post_id,user_id)
);
create index if not exists group_members_user_idx on public.group_members(user_id);
create index if not exists group_posts_group_idx on public.group_posts(group_id,created_at desc);

create or replace function public.create_study_group(group_name text)
returns table(id uuid, invite_code text) language plpgsql security definer set search_path='' as $$
declare gid uuid; code text;
begin
 if auth.uid() is null or group_name is null or char_length(trim(group_name)) not between 1 and 150 then raise exception 'Enter a name for your group.'; end if;
 gid:=gen_random_uuid(); code:=encode(extensions.gen_random_bytes(16),'hex');
 insert into public.study_groups(id,owner_id,name,invite_code) values(gid,auth.uid(),trim(group_name),code);
 insert into public.group_members(group_id,user_id) values(gid,auth.uid());
 return query select gid,code;
end $$;
create or replace function public.join_study_group(code text)
returns uuid language plpgsql security definer set search_path='' as $$
declare gid uuid;
begin
 if auth.uid() is null then raise exception 'Please log in.'; end if;
 select id into gid from public.study_groups where invite_code=trim(code);
 if gid is null then raise exception 'That invitation code was not found.'; end if;
 insert into public.group_members(group_id,user_id) values(gid,auth.uid()) on conflict do nothing;
 return gid;
end $$;
create or replace function public.my_study_groups()
returns table(id uuid,name text,owner_id uuid,created_at timestamptz,share_name boolean,invite_code text)
language sql security definer set search_path='' as $$
 select g.id,g.name,g.owner_id,g.created_at,m.share_name,case when g.owner_id=auth.uid() then g.invite_code else null end
 from public.study_groups g join public.group_members m on m.group_id=g.id where m.user_id=auth.uid() order by g.created_at desc;
$$;
create or replace function public.publish_group_post(requested_group uuid,post_kind text,post_title text,post_data jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare pid uuid; owner boolean;
begin
 select owner_id=auth.uid() into owner from public.study_groups where id=requested_group;
 if not exists(select 1 from public.group_members where group_id=requested_group and user_id=auth.uid()) then raise exception 'This group is not available to your account.'; end if;
 if post_kind not in ('announcements','events','ptm','fees','circulars','achievements','class-calendar','resources','timetable') then raise exception 'Choose a supported group tool.'; end if;
 if not coalesce(owner,false) and post_kind not in ('resources','achievements') then raise exception 'Only the group organizer can publish this item.'; end if;
 if post_title is null or char_length(trim(post_title)) not between 1 and 500 then raise exception 'A title is required.'; end if;
 if post_kind='ptm' and (post_data->>'date' is null or post_data->>'start_time' is null) then raise exception 'Choose a meeting date and time.'; end if;
 insert into public.group_posts(group_id,author_id,kind,title,data) values(requested_group,auth.uid(),post_kind,trim(post_title),coalesce(post_data,'{}'::jsonb)) returning id into pid; return pid;
end $$;
create or replace function public.react_to_group_post(requested_post uuid,response text)
returns boolean language plpgsql security definer set search_path='' as $$
declare expected text; gid uuid;
begin
 select group_id,case kind when 'ptm' then 'booked' when 'events' then 'attending' else 'read' end into gid,expected from public.group_posts where id=requested_post;
 if gid is null or not exists(select 1 from public.group_members where group_id=gid and user_id=auth.uid()) then raise exception 'This post is not available to your account.'; end if;
 if response='remove' then delete from public.post_reactions where post_id=requested_post and user_id=auth.uid(); return true; end if;
 if response<>expected then raise exception 'Invalid response.'; end if;
 if expected='booked' and exists(select 1 from public.post_reactions where post_id=requested_post and user_id<>auth.uid()) then raise exception 'This meeting has already been reserved. Choose another time.'; end if;
 insert into public.post_reactions(post_id,user_id,value) values(requested_post,auth.uid(),expected) on conflict(post_id,user_id) do update set value=excluded.value; return true;
end $$;
create or replace function public.delete_group_post(requested_post uuid)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 delete from public.group_posts p using public.study_groups g where p.id=requested_post and p.group_id=g.id and (p.author_id=auth.uid() or g.owner_id=auth.uid());
 if not found then raise exception 'Only the author or organizer can change this post.'; end if; return true;
end $$;
create or replace function public.set_group_name_preference(requested_group uuid,visible boolean)
returns boolean language plpgsql security definer set search_path='' as $$
begin update public.group_members set share_name=visible where group_id=requested_group and user_id=auth.uid(); if not found then raise exception 'This group is not available to your account.'; end if; return true; end $$;
create or replace function public.group_feed(requested_group uuid)
returns table(id uuid,group_id uuid,author_id uuid,kind text,title text,data jsonb,created_at timestamptz,author text,can_edit boolean,reaction text,reaction_count bigint)
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.group_members where group_id=requested_group and user_id=auth.uid()) then raise exception 'This group is not available to your account.'; end if;
 return query select p.id,p.group_id,p.author_id,p.kind,p.title,p.data,p.created_at,
  case when p.author_id=auth.uid() or coalesce(m.share_name,false) then pr.display_name else 'Anonymous learner' end,
  (g.owner_id=auth.uid() or p.author_id=auth.uid()),r.value,(select count(*) from public.post_reactions rr where rr.post_id=p.id)
 from public.group_posts p join public.study_groups g on g.id=p.group_id join public.group_members m on m.group_id=p.group_id and m.user_id=p.author_id join public.profiles pr on pr.id=p.author_id
 left join public.post_reactions r on r.post_id=p.id and r.user_id=auth.uid() where p.group_id=requested_group order by p.created_at desc;
end $$;
create or replace function public.group_leaderboard(requested_group uuid)
returns table(user_id uuid,name text,self boolean,all_xp bigint,week_xp bigint,month_xp bigint)
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.group_members where group_id=requested_group and user_id=auth.uid()) then raise exception 'This group is not available to your account.'; end if;
 return query select m.user_id,case when m.user_id=auth.uid() or m.share_name then p.display_name else 'Anonymous learner' end,(m.user_id=auth.uid()),
  coalesce(sum(a.xp),0)::bigint,coalesce(sum(a.xp) filter(where a.created_at>=date_trunc('week',now())),0)::bigint,coalesce(sum(a.xp) filter(where a.created_at>=date_trunc('month',now())),0)::bigint
 from public.group_members m join public.profiles p on p.id=m.user_id left join public.activity a on a.user_id=m.user_id where m.group_id=requested_group group by m.user_id,m.share_name,p.display_name;
end $$;

alter table public.study_groups enable row level security; alter table public.group_members enable row level security; alter table public.group_posts enable row level security; alter table public.post_reactions enable row level security;
create policy group_member_list on public.group_members for select to authenticated using(exists(select 1 from public.group_members own where own.group_id=group_members.group_id and own.user_id=auth.uid()));
create policy group_member_preference on public.group_members for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy group_post_delete on public.group_posts for delete to authenticated using(author_id=auth.uid() or exists(select 1 from public.study_groups g where g.id=group_id and g.owner_id=auth.uid()));
create policy reaction_read on public.post_reactions for select to authenticated using(exists(select 1 from public.group_posts p join public.group_members m on m.group_id=p.group_id where p.id=post_id and m.user_id=auth.uid()));
create policy reaction_write on public.post_reactions for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.group_posts p join public.group_members m on m.group_id=p.group_id where p.id=post_id and m.user_id=auth.uid()));
create policy reaction_delete on public.post_reactions for delete to authenticated using(user_id=auth.uid());
grant execute on function public.create_study_group(text),public.join_study_group(text),public.my_study_groups(),public.publish_group_post(uuid,text,text,jsonb),public.react_to_group_post(uuid,text),public.delete_group_post(uuid),public.set_group_name_preference(uuid,boolean),public.group_feed(uuid),public.group_leaderboard(uuid) to authenticated;
