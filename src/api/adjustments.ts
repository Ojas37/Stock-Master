import { Adjustment } from '../types';
import { fetchWithAuth, handleResponse } from './config';

// GET /api/operations?type=adjustment - Fetch all adjustments
export const getAdjustments = async (filters?: any): Promise<Adjustment[]> => {
  try {
    const queryParams = new URLSearchParams({ type: 'adjustment' });
    if (filters?.status) queryParams.append('status', filters.status);

    const response = await fetchWithAuth(`/api/operations?${queryParams.toString()}`);
    const result = await handleResponse<{ success: boolean; operations: any[] }>(response);
    
    return result.operations.map((op: any) => ({
      id: op.id.toString(),
      adjustmentNo: op.reference,
      warehouseId: op.to_warehouse_id?.toString() || op.from_warehouse_id?.toString() || '',
      warehouseName: 'Warehouse',
      locationId: '',
      locationName: '',
      status: op.status,
      reason: op.reason || op.notes || 'Stock adjustment',
      createdDate: new Date(op.created_at).toISOString().split('T')[0],
      createdBy: op.created_by?.toString() || 'System',
      lines: [],
    }));
  } catch (error) {
    console.error('Get adjustments error:', error);
    return [];
  }
};

// GET /api/operations/:id - Fetch single adjustment by ID
export const getAdjustment = async (id: string): Promise<Adjustment> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        adjustmentNo: 'ADJ-2024-012',
        warehouseId: '1',
        warehouseName: 'Main Warehouse',
        locationId: 'L1',
        locationName: 'Shelf A-01',
        status: 'draft',
        reason: 'Physical count mismatch',
        createdDate: '2024-11-22',
        createdBy: 'John Doe',
        lines: [],
      });
    }, 500);
  });
};

// POST /api/operations - Create new adjustment
export const createAdjustment = async (data: any): Promise<Adjustment> => {
  try {
    console.log('Creating adjustment with data:', data);
    const response = await fetchWithAuth('/api/operations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'adjustment',
        productId: data.productId,
        toWarehouseId: data.toWarehouseId,
        quantity: data.quantity,
        notes: data.notes,
        reason: data.reason,
      }),
    });
    const result = await handleResponse<{ success: boolean; operation: any }>(response);
    console.log('Adjustment created:', result);
    
    return {
      id: result.operation.id.toString(),
      adjustmentNo: result.operation.reference,
      warehouseId: result.operation.to_warehouse_id?.toString() || result.operation.from_warehouse_id?.toString() || '',
      warehouseName: 'Warehouse',
      locationId: '',
      locationName: '',
      status: result.operation.status,
      reason: result.operation.notes || data.reason,
      createdDate: new Date(result.operation.created_at).toISOString().split('T')[0],
      createdBy: result.operation.created_by?.toString() || 'System',
      lines: [],
    };
  } catch (error) {
    console.error('Create adjustment error:', error);
    throw error;
  }
};

// PUT /api/operations/:id - Update existing adjustment
export const updateAdjustment = async (id: string, adjustment: Partial<Adjustment>): Promise<Adjustment> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        ...adjustment,
      } as Adjustment);
    }, 500);
  });
};

// PUT /api/operations/:id/confirm - Confirm adjustment and update stock quantities
export const confirmAdjustment = async (id: string): Promise<void> => {
  try {
    const response = await fetchWithAuth(`/api/operations/${id}/confirm`, {
      method: 'PUT',
    });
    await handleResponse(response);
  } catch (error) {
    console.error('Confirm adjustment error:', error);
    throw error;
  }
};
