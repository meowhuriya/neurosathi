import React from 'react';

/**
 * Status indicator pill that combines color AND accessible icons (✓, ⚠, ▲, ▼, →)
 * Never relies on color alone.
 */
export function StatusPill({ status, label, size = "md", className = "" }) {
  let style = "bg-slate-100 text-slate-800 border-slate-300";
  let icon = "→";

  switch (status) {
    case 'stable':
      style = "bg-emerald-50 text-emerald-800 border-emerald-300";
      icon = "✓";
      break;
    case 'flagged':
    case 'decline':
      style = "bg-amber-50 text-amber-900 border-amber-300";
      icon = "⚠";
      break;
    case 'danger':
      style = "bg-red-50 text-red-800 border-red-300";
      icon = "▼";
      break;
    case 'improved':
      style = "bg-emerald-50 text-emerald-800 border-emerald-300";
      icon = "▲";
      break;
    default:
      break;
  }

  const sizeClasses = size === 'sm' 
    ? "text-xs px-2.5 py-1" 
    : "text-sm px-3.5 py-1.5 font-medium";

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${sizeClasses} ${style} ${className}`}
      role="status"
    >
      <span className="font-bold text-base leading-none" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </span>
  );
}
