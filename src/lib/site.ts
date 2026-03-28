import siteData from "../content/site.json";

export const site = siteData;

export function isFeatureEnabled(feature: keyof typeof siteData.features): boolean {
  return siteData.features[feature] ?? false;
}
