import { redirect } from "next/navigation";
import { getDefaultCompany } from "@/lib/companies";

export default async function FeedRedirect() {
  const company = await getDefaultCompany();
  if (company) redirect(`/c/${company.slug}`);
  redirect("/#boards");
}
