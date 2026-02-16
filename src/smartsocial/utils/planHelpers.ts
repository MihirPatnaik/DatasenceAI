//src/smartsocial/utils/planHelpers.ts


export function normalizePlanId(id?: string) {
  if (!id) return "free";
  const p = String(id).toLowerCase();
  if (p === "pro") return "pro"; // keep as 'pro' (your current canonical)
  if (p === "free") return "free";
  // if you later use pro_399 etc, allow them:
  if (["pro_399","pro_699","pro_999","pro"].includes(p)) return p;
  return "free";
}
