import Avatar from "@/app/components/feedback/avatar";
import InviteMemberForm from "@/app/components/workspace/invite-member-form";
import { canManageCompany, listCompanyMembers } from "@/lib/companies";
import { formatDate } from "@/lib/feedback/labels";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { getWorkspaceContext } from "@/lib/workspace";

const ROLE_LABELS: Record<string, [string, string]> = {
  owner: ["مالک", "owner"],
  admin: ["مدیر", "admin"],
  member: ["عضو", "member"],
};

export default async function WorkspaceTeamPage() {
  const context = await getWorkspaceContext("/workspace/team");
  if (!context) return null;
  const { company, viewer, admin } = context;
  const locale = await getLocale();
  const t = translator(locale);

  const [members, canInvite] = await Promise.all([
    listCompanyMembers(company.id),
    canManageCompany(company.id, viewer.userId, admin),
  ]);

  return (
    <>
      <header className="wk-head">
        <div>
          <h1>{t("تیم", "Team")}</h1>
          <p>
            {t(
              `همه کسانی که این پنل رو می‌بینن و فیدبک‌های ${company.name} رو مدیریت می‌کنن.`,
              `Everyone who can see this workspace and manage ${company.name} feedback.`,
            )}
          </p>
        </div>
      </header>

      <div className="wk-grid-2">
        <section className="wk-table-wrap" aria-labelledby="wk-members">
          <div className="wk-panel-head">
            <h2 id="wk-members">{t("اعضا", "Members")}</h2>
            <span className="wk-num">{members.length}</span>
          </div>
          <div className="wk-table-scroll">
            <table className="wk-table">
              <thead>
                <tr>
                  <th scope="col">{t("شخص", "Person")}</th>
                  <th scope="col">{t("نقش", "Role")}</th>
                  <th scope="col">{t("عضویت", "Joined")}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.userId}>
                    <td>
                      <span className="wk-member-cell">
                        <span className="wk-member-avatar">
                          <Avatar name={member.name} src={member.avatarPath} size={28} />
                        </span>
                        <span>
                          {member.name ?? t("کاربر", "Member")}
                          <span className="wk-row-sub">
                            {member.email ?? t("بدون ایمیل", "No email")}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className={`wk-role ${member.role}`}>
                        {ROLE_LABELS[member.role] ? t(ROLE_LABELS[member.role][0], ROLE_LABELS[member.role][1]) : member.role}
                      </span>
                    </td>
                    <td className="wk-votes">{formatDate(member.joinedAt, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="wk-add-member">
          <div className="wk-panel-head" style={{ paddingInline: 0 }}>
            <h2 id="wk-add-member">{t("هم‌تیمی اضافه کن", "Add a teammate")}</h2>
          </div>
          <InviteMemberForm canInvite={canInvite} />
        </section>
      </div>
    </>
  );
}
