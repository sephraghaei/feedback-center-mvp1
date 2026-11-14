-- SAV Phase 1 schema, RLS, triggers and functions.
-- All objects live in the dedicated "sav" schema so the project can be
-- shared without colliding with other applications.

create schema if not exists sav;
grant usage on schema sav to anon, authenticated, service_role;

do $$ begin
  create type sav.app_role as enum ('user', 'platform_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sav.importance_level as enum ('normal', 'important', 'urgent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sav.announcement_status as enum ('draft', 'published', 'archived', 'removed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sav.business_status as enum ('pending', 'active', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sav.member_role as enum ('owner', 'editor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sav.notif_channel as enum ('in_app', 'email');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sav.notif_status as enum ('pending', 'sent', 'failed');
exception when duplicate_object then null; end $$;

create table if not exists sav.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  role sav.app_role not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists sav.topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_fa text not null,
  name_en text not null
);

create table if not exists sav.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  logo_url text,
  contact_email text,
  website_url text,
  primary_topic_id uuid references sav.topics(id),
  status sav.business_status not null default 'pending',
  urgent_allowed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists sav.business_members (
  business_id uuid references sav.businesses(id) on delete cascade,
  user_id uuid references sav.profiles(id) on delete cascade,
  role sav.member_role not null default 'editor',
  primary key (business_id, user_id)
);

create table if not exists sav.announcements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references sav.businesses(id) on delete cascade,
  created_by uuid not null references sav.profiles(id),
  title text not null,
  body text not null,
  importance sav.importance_level not null default 'normal',
  status sav.announcement_status not null default 'draft',
  attachment_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  constraint announcement_published_at_required
    check (status <> 'published' or published_at is not null)
);

create index if not exists announcements_status_published_idx
  on sav.announcements (status, published_at desc);
create index if not exists announcements_business_published_idx
  on sav.announcements (business_id, published_at desc);

create table if not exists sav.announcement_topics (
  announcement_id uuid references sav.announcements(id) on delete cascade,
  topic_id uuid references sav.topics(id) on delete cascade,
  primary key (announcement_id, topic_id)
);

create table if not exists sav.business_follows (
  user_id uuid references sav.profiles(id) on delete cascade,
  business_id uuid references sav.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, business_id)
);

create table if not exists sav.topic_follows (
  user_id uuid references sav.profiles(id) on delete cascade,
  topic_id uuid references sav.topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table if not exists sav.saved_announcements (
  user_id uuid references sav.profiles(id) on delete cascade,
  announcement_id uuid references sav.announcements(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, announcement_id)
);

create table if not exists sav.notification_preferences (
  user_id uuid primary key references sav.profiles(id) on delete cascade,
  normal_channels sav.notif_channel[] not null default '{in_app}',
  important_channels sav.notif_channel[] not null default '{in_app,email}',
  urgent_channels sav.notif_channel[] not null default '{in_app,email}'
);

create table if not exists sav.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references sav.profiles(id) on delete cascade,
  announcement_id uuid not null references sav.announcements(id) on delete cascade,
  channel sav.notif_channel not null,
  status sav.notif_status not null default 'pending',
  read_at timestamptz,
  sent_at timestamptz,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  unique (user_id, announcement_id, channel)
);
create index if not exists notifications_user_created_idx
  on sav.notifications (user_id, created_at desc);
create index if not exists notifications_pending_idx
  on sav.notifications (status, channel) where status = 'pending';

insert into sav.topics (slug, name_fa, name_en) values
  ('technology', 'فناوری', 'Technology'),
  ('education', 'آموزش', 'Education'),
  ('business', 'کسب‌وکار', 'Business'),
  ('economy', 'اقتصاد', 'Economy'),
  ('events', 'رویدادها', 'Events'),
  ('public-services', 'خدمات عمومی', 'Public services')
on conflict (slug) do update
  set name_fa = excluded.name_fa, name_en = excluded.name_en;

-- Helpers -----------------------------------------------------------------

create or replace function sav.is_admin()
returns boolean
language sql
stable
security definer
set search_path = sav, public
as $$
  select exists (
    select 1 from sav.profiles
    where id = auth.uid() and role = 'platform_admin'
  );
$$;

create or replace function sav.is_member(target_business uuid)
returns boolean
language sql
stable
security definer
set search_path = sav, public
as $$
  select exists (
    select 1 from sav.business_members
    where business_id = target_business and user_id = auth.uid()
  );
$$;

grant execute on function sav.is_admin() to anon, authenticated;
grant execute on function sav.is_member(uuid) to anon, authenticated;

-- Guard profile roles ------------------------------------------------------

create or replace function sav.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = sav, public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not sav.is_admin() then
    raise exception 'profile_role_forbidden' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on sav.profiles;
create trigger profiles_guard_role
  before update on sav.profiles
  for each row execute function sav.guard_profile_role();

-- Signup bootstrap ---------------------------------------------------------

create or replace function sav.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = sav, public
as $$
begin
  insert into sav.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;

  insert into sav.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists sav_on_auth_user_created on auth.users;
create trigger sav_on_auth_user_created
  after insert on auth.users
  for each row execute function sav.handle_new_user();

-- Business creation and protected columns ----------------------------------

create or replace function sav.guard_business_columns()
returns trigger
language plpgsql
security definer
set search_path = sav, public
as $$
begin
  if auth.uid() is not null
     and not sav.is_admin()
     and (new.status is distinct from old.status
          or new.urgent_allowed is distinct from old.urgent_allowed) then
    raise exception 'business_admin_fields' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists businesses_guard_columns on sav.businesses;
create trigger businesses_guard_columns
  before update on sav.businesses
  for each row execute function sav.guard_business_columns();

create or replace function sav.create_business(
  p_name text,
  p_slug text,
  p_description text default null,
  p_logo_url text default null,
  p_contact_email text default null,
  p_website_url text default null,
  p_primary_topic_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = sav, public
as $$
declare
  new_id uuid;
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'invalid_slug' using errcode = '22023';
  end if;

  insert into sav.businesses
    (slug, name, description, logo_url, contact_email, website_url, primary_topic_id, status)
  values
    (p_slug, trim(p_name), nullif(p_description, ''), nullif(p_logo_url, ''),
     nullif(p_contact_email, ''), nullif(p_website_url, ''), p_primary_topic_id, 'pending')
  returning id into new_id;

  insert into sav.business_members (business_id, user_id, role)
  values (new_id, me, 'owner');

  return new_id;
exception
  when unique_violation then
    raise exception 'slug_taken' using errcode = '23505';
end;
$$;

grant execute on function sav.create_business(text, text, text, text, text, text, uuid)
  to authenticated;

-- Announcement guard and fan-out ------------------------------------------

create or replace function sav.guard_announcement_publish()
returns trigger
language plpgsql
security definer
set search_path = sav, public
as $$
begin
  if new.status = 'published' then
    new.published_at := coalesce(new.published_at, now());
    if new.importance = 'urgent' then
      if not exists (
        select 1 from sav.businesses
        where id = new.business_id and urgent_allowed
      ) then
        raise exception 'urgent_not_allowed' using errcode = '23514';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists announcements_guard_publish on sav.announcements;
create trigger announcements_guard_publish
  before insert or update on sav.announcements
  for each row execute function sav.guard_announcement_publish();

create or replace function sav.fanout_announcement(target_announcement uuid)
returns void
language plpgsql
security definer
set search_path = sav, public
as $$
declare
  target_importance sav.importance_level;
  target_business uuid;
begin
  select importance, business_id into target_importance, target_business
  from sav.announcements where id = target_announcement;

  insert into sav.notifications (user_id, announcement_id, channel, status)
  select distinct
    recipients.user_id,
    target_announcement,
    lanes.channel,
    case when lanes.channel = 'in_app'
      then 'sent'::sav.notif_status
      else 'pending'::sav.notif_status
    end
  from (
    select bf.user_id
    from sav.business_follows bf
    where bf.business_id = target_business
    union
    select tf.user_id
    from sav.topic_follows tf
    join sav.announcement_topics at
      on at.topic_id = tf.topic_id
    where at.announcement_id = target_announcement
  ) recipients
  join sav.notification_preferences np on np.user_id = recipients.user_id
  cross join lateral unnest(
    case target_importance
      when 'urgent' then np.urgent_channels
      when 'important' then np.important_channels
      else np.normal_channels
    end
  ) as lanes(channel)
  on conflict (user_id, announcement_id, channel) do nothing;
end;
$$;

create or replace function sav.on_announcement_published()
returns trigger
language plpgsql
security definer
set search_path = sav, public
as $$
begin
  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    perform sav.fanout_announcement(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists announcements_fanout on sav.announcements;
create trigger announcements_fanout
  after insert or update of status on sav.announcements
  for each row execute function sav.on_announcement_published();

create or replace function sav.guard_notification_update()
returns trigger
language plpgsql
security definer
set search_path = sav, public
as $$
begin
  if auth.uid() is not null
     and (new.user_id is distinct from old.user_id
          or new.announcement_id is distinct from old.announcement_id
          or new.channel is distinct from old.channel
          or new.status is distinct from old.status
          or new.sent_at is distinct from old.sent_at
          or new.attempts is distinct from old.attempts) then
    raise exception 'notification_read_only' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists notifications_guard_update on sav.notifications;
create trigger notifications_guard_update
  before update on sav.notifications
  for each row execute function sav.guard_notification_update();

-- Search -------------------------------------------------------------------

create or replace function sav.search_announcements(
  p_q text default null,
  p_topic text default null,
  p_business text default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_importance text default null
)
returns setof uuid
language sql
stable
as $$
  select a.id
  from sav.announcements a
  join sav.businesses b on b.id = a.business_id
  where a.status = 'published'
    and b.status = 'active'
    and (
      p_q is null or p_q = ''
      or a.title ilike '%' || p_q || '%'
      or a.body ilike '%' || p_q || '%'
    )
    and (
      p_topic is null or p_topic = ''
      or exists (
        select 1
        from sav.announcement_topics at
        join sav.topics t on t.id = at.topic_id
        where at.announcement_id = a.id and t.slug = p_topic
      )
    )
    and (p_business is null or p_business = '' or b.slug = p_business)
    and (p_from is null or a.published_at >= p_from)
    and (p_to is null or a.published_at <= p_to)
    and (
      p_importance is null or p_importance = ''
      or a.importance::text = p_importance
    )
  order by a.published_at desc
  limit 100;
$$;

grant execute on function sav.search_announcements(text, text, text, timestamptz, timestamptz, text)
  to anon, authenticated;

-- Row level security -------------------------------------------------------

alter table sav.profiles enable row level security;
alter table sav.topics enable row level security;
alter table sav.businesses enable row level security;
alter table sav.business_members enable row level security;
alter table sav.announcements enable row level security;
alter table sav.announcement_topics enable row level security;
alter table sav.business_follows enable row level security;
alter table sav.topic_follows enable row level security;
alter table sav.saved_announcements enable row level security;
alter table sav.notification_preferences enable row level security;
alter table sav.notifications enable row level security;

drop policy if exists profiles_select on sav.profiles;
create policy profiles_select on sav.profiles
  for select using (id = auth.uid() or sav.is_admin());

drop policy if exists profiles_update_own on sav.profiles;
create policy profiles_update_own on sav.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_update on sav.profiles;
create policy profiles_admin_update on sav.profiles
  for update using (sav.is_admin()) with check (sav.is_admin());

drop policy if exists topics_select on sav.topics;
create policy topics_select on sav.topics
  for select using (true);

drop policy if exists topics_admin_write on sav.topics;
create policy topics_admin_write on sav.topics
  for all using (sav.is_admin()) with check (sav.is_admin());

drop policy if exists businesses_select on sav.businesses;
create policy businesses_select on sav.businesses
  for select using (status = 'active' or sav.is_member(id) or sav.is_admin());

drop policy if exists businesses_member_update on sav.businesses;
create policy businesses_member_update on sav.businesses
  for update using (sav.is_member(id) or sav.is_admin())
  with check (sav.is_member(id) or sav.is_admin());

drop policy if exists business_members_select on sav.business_members;
create policy business_members_select on sav.business_members
  for select using (user_id = auth.uid() or sav.is_admin());

drop policy if exists announcements_select on sav.announcements;
create policy announcements_select on sav.announcements
  for select using (
    status = 'published' or sav.is_member(business_id) or sav.is_admin()
  );

drop policy if exists announcements_member_insert on sav.announcements;
create policy announcements_member_insert on sav.announcements
  for insert with check (
    (sav.is_member(business_id) and created_by = auth.uid()) or sav.is_admin()
  );

drop policy if exists announcements_member_update on sav.announcements;
create policy announcements_member_update on sav.announcements
  for update using (sav.is_member(business_id) or sav.is_admin())
  with check (sav.is_member(business_id) or sav.is_admin());

drop policy if exists announcements_admin_delete on sav.announcements;
create policy announcements_admin_delete on sav.announcements
  for delete using (sav.is_admin());

drop policy if exists announcement_topics_select on sav.announcement_topics;
create policy announcement_topics_select on sav.announcement_topics
  for select using (
    exists (select 1 from sav.announcements a where a.id = announcement_id)
  );

drop policy if exists announcement_topics_member_insert on sav.announcement_topics;
create policy announcement_topics_member_insert on sav.announcement_topics
  for insert with check (
    exists (
      select 1 from sav.announcements a
      where a.id = announcement_id
        and (sav.is_member(a.business_id) or sav.is_admin())
    )
  );

drop policy if exists announcement_topics_member_delete on sav.announcement_topics;
create policy announcement_topics_member_delete on sav.announcement_topics
  for delete using (
    exists (
      select 1 from sav.announcements a
      where a.id = announcement_id
        and (sav.is_member(a.business_id) or sav.is_admin())
    )
  );

drop policy if exists business_follows_own on sav.business_follows;
create policy business_follows_own on sav.business_follows
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists topic_follows_own on sav.topic_follows;
create policy topic_follows_own on sav.topic_follows
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists saved_own on sav.saved_announcements;
create policy saved_own on sav.saved_announcements
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists preferences_own on sav.notification_preferences;
create policy preferences_own on sav.notification_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notifications_own_select on sav.notifications;
create policy notifications_own_select on sav.notifications
  for select using (user_id = auth.uid() or sav.is_admin());

drop policy if exists notifications_own_update on sav.notifications;
create policy notifications_own_update on sav.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Privileges ---------------------------------------------------------------

grant select on sav.topics, sav.businesses, sav.announcements, sav.announcement_topics
  to anon, authenticated;
grant select, update on sav.profiles to authenticated;
grant select on sav.business_members to authenticated;
grant select, update on sav.businesses to authenticated;
grant select, insert, update, delete on sav.announcements to authenticated;
grant select, insert, delete on sav.announcement_topics to authenticated;
grant select, insert, delete on sav.business_follows to authenticated;
grant select, insert, delete on sav.topic_follows to authenticated;
grant select, insert, delete on sav.saved_announcements to authenticated;
grant select, insert, update on sav.notification_preferences to authenticated;
grant select, update on sav.notifications to authenticated;

grant all on all tables in schema sav to service_role;
grant all on all functions in schema sav to service_role;

-- Expose the schema to PostgREST ------------------------------------------

alter role authenticator set pgrst.db_schemas = 'public, storage, graphql_public, sav';
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
