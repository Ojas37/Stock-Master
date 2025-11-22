import { StockMove } from '../types';
import { fetchWithAuth, handleResponse } from './config';

// GET /api/operations - Fetch all stock moves (operations history)
export const getStockMoves = async (filters?: any): Promise<StockMove[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.productId) queryParams.append('product_id', filters.productId);
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.warehouseId) queryParams.append('warehouse_id', filters.warehouseId);

    const response = await fetchWithAuth(`/api/operations?${queryParams.toString()}`);
    const result = await handleResponse<{ success: boolean; operations: any[] }>(response);
    
    return result.operations.map((op: any) => ({
      id: op.id.toString(),
      date: op.created_at,
      productId: op.product_id?.toString() || '',
      productName: op.product_name || 'Unknown Product',
      moveType: op.type,
      documentType: op.type.charAt(0).toUpperCase() + op.type.slice(1),
      documentNo: op.reference,
      toLocationId: op.to_warehouse_id?.toString(),
      toLocationName: 'Warehouse',
      fromLocationId: op.from_warehouse_id?.toString(),
      fromLocationName: 'Warehouse',
      quantity: op.type === 'delivery' ? -op.quantity : op.quantity,
      performedBy: op.created_by?.toString() || 'System',
    }));
  } catch (error) {
    console.error('Get stock moves error:', error);
    return [];
  }
};
