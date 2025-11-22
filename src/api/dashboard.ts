import { DashboardSummary, RecentOperation } from '@/src/types';
import { fetchWithAuth, handleResponse } from './config';

// GET /api/dashboard/summary - Fetch dashboard KPIs
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const response = await fetchWithAuth('/api/dashboard/summary');
    const result = await handleResponse<{ success: boolean; summary: any }>(response);
    
    return {
      totalProducts: result.summary.totalProducts || 0,
      lowStockItems: result.summary.lowStockItems || 0,
      outOfStockItems: 0, // Backend doesn't track this separately
      pendingReceipts: 0, // Would need operations count by type
      pendingDeliveries: 0,
      scheduledTransfers: 0,
      totalWarehouses: result.summary.totalWarehouses || 0,
      totalValue: result.summary.totalValue || 0,
      totalStock: result.summary.totalStock || 0,
      recentOperations: result.summary.recentOperations || 0,
    };
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    return {
      totalProducts: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      pendingReceipts: 0,
      pendingDeliveries: 0,
      scheduledTransfers: 0,
    };
  }
};

// GET /api/operations - Fetch recent operations (using operations endpoint)
export const getRecentOperations = async (filters?: any): Promise<RecentOperation[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.documentType) queryParams.append('type', filters.documentType);
    if (filters?.status) queryParams.append('status', filters.status);
    
    const response = await fetchWithAuth(`/api/operations?${queryParams.toString()}`);
    const result = await handleResponse<{ success: boolean; operations: any[] }>(response);
    
    // Apply client-side filtering for warehouse and category (backend doesn't support these yet)
    let filteredOps = result.operations;
    
    if (filters?.warehouse) {
      filteredOps = filteredOps.filter((op: any) => 
        op.from_warehouse_id?.toString() === filters.warehouse || 
        op.to_warehouse_id?.toString() === filters.warehouse
      );
    }
    
    return filteredOps.slice(0, 20).map((op: any) => ({
      documentNo: op.reference,
      type: op.type,
      status: op.status,
      warehouse: op.to_warehouse_name || op.from_warehouse_name || 'N/A',
      date: new Date(op.created_at).toISOString().split('T')[0],
      createdBy: op.created_by?.toString() || 'System',
    }));
  } catch (error) {
    console.error('Get recent operations error:', error);
    return [];
  }
};

// GET /api/products - Fetch low stock products
export const getLowStockProducts = async (): Promise<any[]> => {
  try {
    const response = await fetchWithAuth('/api/products');
    const result = await handleResponse<{ success: boolean; products: any[] }>(response);
    
    // Filter products where total_stock <= reorder_point
    const lowStock = result.products.filter((p: any) => 
      p.total_stock <= p.reorder_point && p.status === 'active'
    );
    
    return lowStock.map((p: any) => ({
      id: p.id.toString(),
      sku: p.sku,
      name: p.name,
      category: p.category,
      totalStock: p.total_stock,
      reorderLevel: p.reorder_point,
      unitPrice: p.unit_price,
      status: p.status,
    }));
  } catch (error) {
    console.error('Get low stock products error:', error);
    return [];
  }
};
