import { Delivery } from '../types';
import { fetchWithAuth, handleResponse } from './config';

// GET /api/operations?type=delivery - Fetch all deliveries
export const getDeliveries = async (filters?: any): Promise<Delivery[]> => {
  try {
    const queryParams = new URLSearchParams({ type: 'delivery' });
    if (filters?.status) queryParams.append('status', filters.status);

    const response = await fetchWithAuth(`/api/operations?${queryParams.toString()}`);
    const result = await handleResponse<{ success: boolean; operations: any[] }>(response);
    
    return result.operations.map((op: any) => ({
      id: op.id.toString(),
      deliveryNo: op.reference,
      customerName: op.notes || 'Customer',
      warehouseId: op.from_warehouse_id?.toString() || '',
      warehouseName: 'Warehouse',
      status: op.status,
      createdDate: new Date(op.created_at).toISOString().split('T')[0],
      createdBy: op.created_by?.toString() || 'System',
      lines: [],
    }));
  } catch (error) {
    console.error('Get deliveries error:', error);
    return [];
  }
};

// GET /api/operations/:id - Fetch single delivery by ID
export const getDelivery = async (id: string): Promise<Delivery> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        deliveryNo: 'DEL-2024-045',
        customerName: 'ABC Corporation',
        warehouseId: '1',
        warehouseName: 'Main Warehouse',
        status: 'ready',
        createdDate: '2024-11-21',
        createdBy: 'Jane Smith',
        lines: [],
      });
    }, 500);
  });
};

// POST /api/operations - Create new delivery
export const createDelivery = async (delivery: Partial<Delivery>): Promise<Delivery> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        ...delivery,
      } as Delivery);
    }, 500);
  });
};

// PUT /api/operations/:id - Update existing delivery
export const updateDelivery = async (id: string, delivery: Partial<Delivery>): Promise<Delivery> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        ...delivery,
      } as Delivery);
    }, 500);
  });
};

// PUT /api/operations/:id/confirm - Confirm delivery and decrease stock
export const confirmDelivery = async (id: string): Promise<void> => {
  try {
    const response = await fetchWithAuth(`/api/operations/${id}/confirm`, {
      method: 'PUT',
    });
    await handleResponse(response);
  } catch (error) {
    console.error('Confirm delivery error:', error);
    throw error;
  }
};
