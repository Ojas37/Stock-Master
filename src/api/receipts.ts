import { Receipt } from '../types';
import { fetchWithAuth, handleResponse } from './config';

// GET /api/operations?type=receipt - Fetch all receipts
export const getReceipts = async (filters?: any): Promise<Receipt[]> => {
  try {
    const queryParams = new URLSearchParams({ type: 'receipt' });
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.warehouseId) queryParams.append('warehouse_id', filters.warehouseId);

    const response = await fetchWithAuth(`/api/operations?${queryParams.toString()}`);
    const result = await handleResponse<{ success: boolean; operations: any[] }>(response);
    
    return result.operations.map((op: any) => ({
      id: op.id.toString(),
      receiptNo: op.reference,
      supplier: op.notes || 'N/A',
      warehouseId: op.to_warehouse_id?.toString() || '',
      warehouseName: 'Warehouse',
      status: op.status,
      createdDate: new Date(op.created_at).toISOString().split('T')[0],
      createdBy: op.created_by?.toString() || 'System',
      lines: [],
    }));
  } catch (error) {
    console.error('Get receipts error:', error);
    return [];
  }
};

// GET /api/operations/:id - Fetch single receipt
export const getReceipt = async (id: string): Promise<Receipt | null> => {
  try {
    const receipts = await getReceipts();
    return receipts.find(r => r.id === id) || null;
  } catch (error) {
    console.error('Get receipt error:', error);
    return null;
  }
};

// POST /api/operations - Create new receipt
export const createReceipt = async (data: any): Promise<Receipt> => {
  try {
    const payload = {
      type: data.type || 'receipt',
      productId: data.productId,
      toWarehouseId: data.toWarehouseId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      notes: data.notes,
    };
    
    console.log('Creating receipt with payload:', payload);
    
    const response = await fetchWithAuth('/api/operations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const result = await handleResponse<{ success: boolean; operation: any }>(response);
    
    return {
      id: result.operation.id.toString(),
      receiptNo: result.operation.reference,
      supplier: result.operation.notes || '',
      warehouseId: result.operation.to_warehouse_id?.toString() || '',
      warehouseName: 'Warehouse',
      status: result.operation.status,
      createdDate: new Date(result.operation.created_at).toISOString().split('T')[0],
      createdBy: result.operation.created_by?.toString() || 'System',
      lines: [],
    };
  } catch (error: any) {
    console.error('Create receipt error:', error);
    throw error;
  }
};

// PUT /api/operations/:id - Update receipt
export const updateReceipt = async (id: string, receipt: Partial<Receipt>): Promise<Receipt> => {
  try {
    const response = await fetchWithAuth(`/api/operations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: receipt.status,
        notes: receipt.supplier,
      }),
    });

    const result = await handleResponse<{ success: boolean; operation: any }>(response);
    
    return {
      id: result.operation.id.toString(),
      receiptNo: result.operation.reference,
      supplier: result.operation.notes || '',
      warehouseId: result.operation.to_warehouse_id?.toString() || '',
      warehouseName: 'Warehouse',
      status: result.operation.status,
      createdDate: new Date(result.operation.created_at).toISOString().split('T')[0],
      createdBy: result.operation.created_by?.toString() || 'System',
      lines: [],
    };
  } catch (error: any) {
    console.error('Update receipt error:', error);
    throw error;
  }
};

// PUT /api/operations/:id/confirm - Confirm receipt and increase stock
export const confirmReceipt = async (id: string): Promise<void> => {
  try {
    const response = await fetchWithAuth(`/api/operations/${id}/confirm`, {
      method: 'PUT',
    });
    await handleResponse(response);
  } catch (error: any) {
    console.error('Confirm receipt error:', error);
    throw error;
  }
};
