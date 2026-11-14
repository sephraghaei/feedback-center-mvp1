-- Changelog publication marks linked feedback as shipped.
create or replace function public.mark_changelog_posts_shipped()
returns trigger
language plpgsql
as $$
begin
  update public.posts
     set status = 'shipped',
         updated_at = now()
   where id = new.post_id
     and type = 'feedback';
  return new;
end;
$$;

drop trigger if exists changelog_posts_mark_shipped on public.changelog_posts;
create trigger changelog_posts_mark_shipped
after insert on public.changelog_posts
for each row execute function public.mark_changelog_posts_shipped();

-- Row level security is written for deployments that connect with a role that
-- does not bypass it. The current managed Postgres role has BYPASSRLS, so the
-- application also scopes every read in lib/feedback.
alter table public.posts enable row level security;
alter table public.attachments enable row level security;
alter table public.upvotes enable row level security;
alter table public.changelog_entries enable row level security;
alter table public.changelog_posts enable row level security;

drop policy if exists posts_select on public.posts;
create policy posts_select on public.posts for select using (
  (hidden = false and type = 'feedback')
  or author_id::text = current_setting('app.user_id', true)
  or current_setting('app.user_role', true) = 'admin'
);

drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts for insert with check (
  author_id::text = current_setting('app.user_id', true)
);

drop policy if exists posts_update on public.posts;
create policy posts_update on public.posts for update using (
  author_id::text = current_setting('app.user_id', true)
  or current_setting('app.user_role', true) = 'admin'
);

drop policy if exists posts_delete on public.posts;
create policy posts_delete on public.posts for delete using (
  current_setting('app.user_role', true) = 'admin'
);

drop policy if exists attachments_select on public.attachments;
create policy attachments_select on public.attachments for select using (
  exists (
    select 1 from public.posts p
     where p.id = attachments.post_id
       and (
         (p.hidden = false and p.type = 'feedback')
         or p.author_id::text = current_setting('app.user_id', true)
         or current_setting('app.user_role', true) = 'admin'
       )
  )
);

drop policy if exists attachments_insert on public.attachments;
create policy attachments_insert on public.attachments for insert with check (
  exists (
    select 1 from public.posts p
     where p.id = attachments.post_id
       and p.author_id::text = current_setting('app.user_id', true)
  )
);

drop policy if exists upvotes_select on public.upvotes;
create policy upvotes_select on public.upvotes for select using (
  exists (
    select 1 from public.posts p
     where p.id = upvotes.post_id
       and p.hidden = false
       and p.type = 'feedback'
  )
);

drop policy if exists upvotes_insert on public.upvotes;
create policy upvotes_insert on public.upvotes for insert with check (
  user_id::text = current_setting('app.user_id', true)
);

drop policy if exists upvotes_delete on public.upvotes;
create policy upvotes_delete on public.upvotes for delete using (
  user_id::text = current_setting('app.user_id', true)
);

drop policy if exists changelog_select on public.changelog_entries;
create policy changelog_select on public.changelog_entries for select using (true);

drop policy if exists changelog_write on public.changelog_entries;
create policy changelog_write on public.changelog_entries for all using (
  current_setting('app.user_role', true) = 'admin'
) with check (
  current_setting('app.user_role', true) = 'admin'
);

drop policy if exists changelog_links_select on public.changelog_posts;
create policy changelog_links_select on public.changelog_posts for select using (true);

drop policy if exists changelog_links_write on public.changelog_posts;
create policy changelog_links_write on public.changelog_posts for all using (
  current_setting('app.user_role', true) = 'admin'
) with check (
  current_setting('app.user_role', true) = 'admin'
);
