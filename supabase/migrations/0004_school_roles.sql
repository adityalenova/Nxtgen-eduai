-- School operations are authored and responded to by verified teachers or management.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('student','teacher','parent','management'));

create or replace function public.publish_group_post(requested_group uuid,post_kind text,post_title text,post_data jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare pid uuid; author_role text;
begin
 select role into author_role from public.profiles where id=auth.uid();
 if not exists(select 1 from public.group_members where group_id=requested_group and user_id=auth.uid()) then raise exception 'This group is not available to your account.'; end if;
 if post_kind not in ('announcements','events','ptm','fees','circulars','achievements','class-calendar','resources','timetable') then raise exception 'Choose a supported group tool.'; end if;
 if post_kind in ('fees','circulars','ptm','events') and author_role not in ('teacher','management') then raise exception 'This school tool is available to teachers and management.'; end if;
 if post_title is null or char_length(trim(post_title)) not between 1 and 500 then raise exception 'A title is required.'; end if;
 insert into public.group_posts(group_id,author_id,kind,title,data) values(requested_group,auth.uid(),post_kind,trim(post_title),coalesce(post_data,'{}'::jsonb)) returning id into pid;
 return pid;
end $$;

create or replace function public.react_to_group_post(requested_post uuid,response text)
returns boolean language plpgsql security definer set search_path='' as $$
declare expected text; gid uuid; actor_role text;
begin
 select group_id,case kind when 'ptm' then 'booked' when 'events' then 'attending' else 'read' end into gid,expected from public.group_posts where id=requested_post;
 select role into actor_role from public.profiles where id=auth.uid();
 if gid is null or not exists(select 1 from public.group_members where group_id=gid and user_id=auth.uid()) then raise exception 'This post is not available to your account.'; end if;
 if expected in ('booked','attending') and actor_role not in ('teacher','management') then raise exception 'RSVP and meeting reservations are managed by teachers and management.'; end if;
 if response='remove' then delete from public.post_reactions where post_id=requested_post and user_id=auth.uid(); return true; end if;
 if response<>expected then raise exception 'Invalid response.'; end if;
 insert into public.post_reactions(post_id,user_id,value) values(requested_post,auth.uid(),expected) on conflict(post_id,user_id) do update set value=excluded.value;
 return true;
end $$;
