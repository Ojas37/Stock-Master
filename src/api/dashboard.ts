import { DashboardSummary, RecentOperation } from '@/types';

// TODO: fetch dashboard summary from GET /dashboard/summary
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  // Mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalProducts: 1250,
        lowStockItems: 45,
        outOfStockItems: 12,
        pendingReceipts: 8,
        pendingDeliveries: 15,
        scheduledTransfers: 6,
      });
    }, 500);
  });
};

// TODO: fetch recent operations with filters from GET /dashboard/recent-operations
export const getRecentOperations = async (filters?: any): Promise<RecentOperation[]> => {
  // Mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          documentNo: 'REC-2024-001',
          type: 'receipt',
          status: 'done',
          warehouse: 'Main Warehouse',
          date: '2024-11-20',
          createdBy: 'John Doe',
        },
        {
          documentNo: 'DEL-2024-045',
          type: 'delivery',
          status: 'ready',
          warehouse: 'Main Warehouse',
          date: '2024-11-21',
          createdBy: 'Jane Smith',
        },
        {
          documentNo: 'TRF-2024-023',
          type: 'transfer',
          status: 'waiting',
          warehouse: 'Warehouse A',
          date: '2024-11-22',
          createdBy: 'Mike Johnson',
        },
      ]);
    }, 500);
  });
};
