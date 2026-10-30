/**
 * Formatting utilities for dates, numbers, and trend indicators
 */

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return dateString;
  }
}

export function formatPct(val) {
  if (val === undefined || val === null) return "0%";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(1)}%`;
}

export function getTrendSymbol(changePct) {
  if (changePct <= -10) return "↓";
  if (changePct >= 10) return "↑";
  return "→";
}

export function getConditionBadgeColor(condition) {
  switch (condition?.toUpperCase()) {
    case 'MS':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'EPILEPSY':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'STROKE':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}
