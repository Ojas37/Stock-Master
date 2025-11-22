import { Transfer } from '../types';
import { fetchWithAuth, handleResponse } from './config';

// GET /api/operations?type=transfer - Fetch all transfers
export const getTransfers = async (filters?: any): Promise<Transfer[]> => {
  try {
    const queryParams = new URLSearchParams({ type: 'transfer' });
    if (filters?.status) queryParams.append('status', filters.status);

    const response = await fetchWithAuth(`/api/operations?${queryParams.toString()}`);
    const result = await handleResponse<{ success: boolean; operations: any[] }>(response);
    
    return result.operations.map((op: any) => ({
      id: op.id.toString(),
      transferNo: op.reference,
      fromWarehouseId: op.from_warehouse_id?.toString() || '',
      fromWarehouseName: 'Source Warehouse',
      toWarehouseId: op.to_warehouse_id?.toString() || '',
      toWarehouseName: 'Destination Warehouse',
      status: op.status,
      createdDate: new Date(op.created_at).toISOString().split('T')[0],
      createdBy: op.created_by?.toString() || 'System',
      lines: [],
    }));
  } catch (error) {
    console.error('Get transfers error:', error);
    return [];
  }
};

// GET /api/operations/:id - Fetch single transfer by ID
export const getTransfer = async (id: string): Promise<Transfer> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        transferNo: 'TRF-2024-023',
        fromWarehouseId: '1',
        fromWarehouseName: 'Main Warehouse',
        toWarehouseId: '2',
        toWarehouseName: 'Warehouse B',
        status: 'waiting',
        createdDate: '2024-11-22',
        createdBy: 'Mike Johnson',
        lines: [],
      });
    }, 500);
  });
};

// POST /api/operations - Create new transfer
export const createTransfer = async (data: any): Promise<Transfer> => {
  try {
    const payload = {
      type: data.type || 'transfer',
      productId: data.productId,
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      quantity: data.quantity,
      notes: data.notes,
    };
    
    console.log('Creating transfer with payload:', payload);
    
    const response = await fetchWithAuth('/api/operations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const result = await handleResponse<{ success: boolean; operation: any }>(response);
    
    return {
      id: result.operation.id.toString(),
      transferNo: result.operation.reference,
      fromWarehouseId: result.operation.from_warehouse_id?.toString() || '',
      fromWarehouseName: 'Source Warehouse',
      toWarehouseId: result.operation.to_warehouse_id?.toString() || '',
      toWarehouseName: 'Destination Warehouse',
      status: result.operation.status,
      createdDate: new Date(result.operation.created_at).toISOString().split('T')[0],
      createdBy: result.operation.created_by?.toString() || 'System',
      lines: [],
    };
  } catch (error: any) {
    console.error('Create transfer error:', error);
    throw error;
  }
};

// PUT /api/operations/:id - Update existing transfer
export const updateTransfer = async (id: string, transfer: Partial<Transfer>): Promise<Transfer> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        ...transfer,
      } as Transfer);
    }, 500);
  });
};

// PUT /api/operations/:id/confirm - Confirm transfer and move stock between warehouses
export const confirmTransfer = async (id: string): Promise<void> => {
  try {
    const response = await fetchWithAuth(`/api/operations/${id}/confirm`, {
      method: 'PUT',
    });
    await handleResponse(response);
  } catch (error) {
    console.error('Confirm transfer error:', error);
    throw error;
  }
};
