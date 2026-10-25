import { ChangeIntensityCategory } from '../types/analysis';

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatPercentage(pct: number): string {
  return `${pct.toFixed(2)}%`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  } catch {
    return isoString;
  }
}

export function getIntensityBadgeStyle(category: ChangeIntensityCategory): {
  bg: string;
  text: string;
  border: string;
} {
  switch (category) {
    case 'Negligible':
      return {
        bg: 'bg-emerald-950/60',
        text: 'text-emerald-400',
        border: 'border-emerald-700/50',
      };
    case 'Low':
      return {
        bg: 'bg-blue-950/60',
        text: 'text-blue-400',
        border: 'border-blue-700/50',
      };
    case 'Moderate':
      return {
        bg: 'bg-amber-950/60',
        text: 'text-amber-400',
        border: 'border-amber-700/50',
      };
    case 'Significant':
      return {
        bg: 'bg-orange-950/60',
        text: 'text-orange-400',
        border: 'border-orange-700/50',
      };
    case 'Extensive':
      return {
        bg: 'bg-coral-500/20',
        text: 'text-coral-400',
        border: 'border-coral-500/50',
      };
    default:
      return {
        bg: 'bg-slate-800',
        text: 'text-slate-300',
        border: 'border-slate-700',
      };
  }
}
