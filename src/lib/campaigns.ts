/** Stable, non-personal campaign tags for future email links. */
export function emailCampaignUrl(
  url: string,
  campaign: string,
  content = "cta",
): string {
  const target = new URL(url);
  target.searchParams.set("utm_source", "imtihan");
  target.searchParams.set("utm_medium", "email");
  target.searchParams.set("utm_campaign", campaign);
  target.searchParams.set("utm_content", content);
  return target.toString();
}
