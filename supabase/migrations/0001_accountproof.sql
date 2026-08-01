-- AccountProof production-shaped schema contract. Not applied to any provider.
create extension if not exists pgcrypto;

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.tenant_memberships (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('TAM', 'ACCOUNT_OWNER', 'SUPPORT_OWNER', 'BUSINESS_OWNER', 'AUDITOR')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create function public.is_tenant_member(target_tenant uuid)
returns boolean language sql stable security definer
set search_path = public
as $$ select exists(select 1 from public.tenant_memberships m where m.tenant_id = target_tenant and m.user_id = auth.uid()) $$;

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  external_ref text not null,
  region text not null,
  state text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  unique (tenant_id, external_ref)
);

create table public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  source_system text not null,
  source_version text not null,
  source_digest text not null check (source_digest ~ '^[a-f0-9]{64}$'),
  observed_at timestamptz not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table public.health_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  input_digest text not null,
  receipt_digest text not null unique,
  rules_version text not null,
  state text not null,
  receipt jsonb not null,
  authored_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.review_decisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  health_review_id uuid not null references public.health_reviews(id) on delete restrict,
  reviewer_id uuid not null references auth.users(id),
  decision text not null check (decision in ('ACCEPT', 'HOLD', 'ESCALATE')),
  decision_digest text not null unique,
  rationale text not null,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  actor_id uuid not null references auth.users(id),
  action text not null,
  record_type text not null,
  record_id uuid not null,
  before_digest text,
  after_digest text not null,
  occurred_at timestamptz not null default now()
);

alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.accounts enable row level security;
alter table public.evidence_items enable row level security;
alter table public.health_reviews enable row level security;
alter table public.review_decisions enable row level security;
alter table public.audit_events enable row level security;

create policy "tenant creators may read tenant" on public.tenants for select using (created_by = auth.uid() or public.is_tenant_member(id));
create policy "authenticated users may create tenant" on public.tenants for insert to authenticated with check (created_by = auth.uid());
create policy "members may read own membership" on public.tenant_memberships for select using (user_id = auth.uid());
create policy "tenant creators may create membership" on public.tenant_memberships for insert to authenticated with check (exists(select 1 from public.tenants t where t.id = tenant_id and t.created_by = auth.uid()));
create policy "members may read accounts" on public.accounts for select using (public.is_tenant_member(tenant_id));
create policy "members may create accounts" on public.accounts for insert to authenticated with check (public.is_tenant_member(tenant_id));
create policy "members may read evidence" on public.evidence_items for select using (public.is_tenant_member(tenant_id));
create policy "members may create evidence" on public.evidence_items for insert to authenticated with check (public.is_tenant_member(tenant_id));
create policy "members may read health reviews" on public.health_reviews for select using (public.is_tenant_member(tenant_id));
create policy "members may create health reviews" on public.health_reviews for insert to authenticated with check (public.is_tenant_member(tenant_id) and authored_by = auth.uid());
create policy "members may read review decisions" on public.review_decisions for select using (public.is_tenant_member(tenant_id));
create policy "reviewers may create own decisions" on public.review_decisions for insert to authenticated with check (public.is_tenant_member(tenant_id) and reviewer_id = auth.uid());
create policy "members may read audit events" on public.audit_events for select using (public.is_tenant_member(tenant_id));
create policy "actors may create audit events" on public.audit_events for insert to authenticated with check (public.is_tenant_member(tenant_id) and actor_id = auth.uid());

revoke all on function public.is_tenant_member(uuid) from public;
grant execute on function public.is_tenant_member(uuid) to authenticated;
