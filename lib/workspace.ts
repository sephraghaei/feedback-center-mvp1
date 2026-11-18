import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listUserCompanies, type CompanyMembership, type CompanyRole } from "./companies";
import type { CompanyRow } from "./db/schema";
import { getViewer, isAdminRequest, type Viewer } from "./feedback/viewer";

export const WORKSPACE_COMPANY_COOKIE = "fc_workspace_company";

export type WorkspaceContext = {
  viewer: Viewer;
  company: CompanyRow;
  role: CompanyRole;
  memberships: CompanyMembership[];
  admin: boolean;
};

export async function getActiveCompanySlug(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(WORKSPACE_COMPANY_COOKIE)?.value;
}

export async function getWorkspaceContext(nextPath = "/workspace"): Promise<WorkspaceContext | null> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/?next=${encodeURIComponent(nextPath)}#account`);

  const [memberships, admin, activeSlug] = await Promise.all([
    listUserCompanies(viewer.userId),
    isAdminRequest(),
    getActiveCompanySlug(),
  ]);

  if (memberships.length === 0) return null;

  const chosen =
    (activeSlug && memberships.find((entry) => entry.company.slug === activeSlug)) ||
    memberships[0];

  return { viewer, company: chosen.company, role: chosen.role, memberships, admin };
}
