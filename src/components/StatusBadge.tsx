import { OperationStatus } from '../types';

interface StatusBadgeProps {
  status: OperationStatus;
}

const statusConfig: Record<OperationStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800 border-gray-300' },
  waiting: { label: 'Waiting', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  ready: { label: 'Ready', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  done: { label: 'Done', className: 'bg-green-100 text-green-800 border-green-300' },
  canceled: { label: 'Canceled', className: 'bg-red-100 text-red-800 border-red-300' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}
