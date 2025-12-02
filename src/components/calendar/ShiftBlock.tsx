import { Shift, ShiftStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ShiftBlockProps {
  shift: Shift;
  onClick?: (e: React.MouseEvent) => void;
}

const statusStyles: Record<ShiftStatus, string> = {
  planned: 'bg-amber-100 border-amber-300 text-amber-800',
  worked: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  absent: 'bg-red-100 border-red-300 text-red-800',
  late: 'bg-orange-100 border-orange-300 text-orange-800',
};

const statusLabels: Record<ShiftStatus, string> = {
  planned: '📅',
  worked: '✓',
  absent: '✗',
  late: '⏰',
};

export function ShiftBlock({ shift, onClick }: ShiftBlockProps) {
  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  return (
    <div
      className={cn(
        'rounded-md border px-2 py-1.5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-sm',
        statusStyles[shift.status]
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-medium">
          {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
        </span>
        <span className="text-xs">{statusLabels[shift.status]}</span>
      </div>
    </div>
  );
}
