import { Warehouse, Location } from '../types';
import { fetchWithAuth, handleResponse } from './config';

// GET /api/warehouses - Fetch all warehouses
export const getWarehouses = async (): Promise<Warehouse[]> => {
  try {
    const response = await fetchWithAuth('/api/warehouses');
    const result = await handleResponse<{ success: boolean; warehouses: any[] }>(response);
    
    return result.warehouses.map((w: any) => ({
      id: w.id.toString(),
      name: w.name,
      code: `WH-${w.id.toString().padStart(3, '0')}`,
      address: w.location,
      manager: w.manager,
      contact: w.contact,
      capacity: w.capacity,
      status: w.status,
    }));
  } catch (error) {
    console.error('Get warehouses error:', error);
    return [];
  }
};

// POST /api/warehouses - Create new warehouse
export const createWarehouse = async (warehouse: Partial<Warehouse>): Promise<Warehouse> => {
  try {
    const response = await fetchWithAuth('/api/warehouses', {
      method: 'POST',
      body: JSON.stringify({
        name: warehouse.name,
        location: warehouse.address,
        capacity: warehouse.capacity || 1000,
        manager: warehouse.manager,
        contact: warehouse.contact,
      }),
    });

    const result = await handleResponse<{ success: boolean; warehouse: any }>(response);
    
    return {
      id: result.warehouse.id.toString(),
      name: result.warehouse.name,
      code: `WH-${result.warehouse.id.toString().padStart(3, '0')}`,
      address: result.warehouse.location,
      manager: result.warehouse.manager,
      contact: result.warehouse.contact,
      capacity: result.warehouse.capacity,
      status: result.warehouse.status,
    };
  } catch (error: any) {
    console.error('Create warehouse error:', error);
    throw error;
  }
};

// PUT /api/warehouses/:id - Update warehouse
export const updateWarehouse = async (id: string, warehouse: Partial<Warehouse>): Promise<Warehouse> => {
  try {
    const response = await fetchWithAuth(`/api/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: warehouse.name,
        location: warehouse.address,
        capacity: warehouse.capacity,
        manager: warehouse.manager,
        contact: warehouse.contact,
        status: warehouse.status,
      }),
    });

    const result = await handleResponse<{ success: boolean; warehouse: any }>(response);
    
    return {
      id: result.warehouse.id.toString(),
      name: result.warehouse.name,
      code: `WH-${result.warehouse.id.toString().padStart(3, '0')}`,
      address: result.warehouse.location,
      manager: result.warehouse.manager,
      contact: result.warehouse.contact,
      capacity: result.warehouse.capacity,
      status: result.warehouse.status,
    };
  } catch (error: any) {
    console.error('Update warehouse error:', error);
    throw error;
  }
};

// GET /api/warehouses/:id/locations - Mock (backend doesn't have location subdivisions yet)
export const getWarehouseLocations = async (warehouseId: string): Promise<Location[]> => {
  // Backend doesn't have location subdivisions within warehouses yet
  // This would need additional backend implementation
  return [];
};

// POST /api/warehouses/:id/locations - Mock (not implemented in backend)
export const createLocation = async (warehouseId: string, location: Partial<Location>): Promise<Location> => {
  // Mock implementation - backend location subdivisions not yet implemented
  return {
    id: Date.now().toString(),
    warehouseId,
    name: location.name || '',
    code: location.code || '',
    capacity: 100,
    currentOccupancy: 0,
  };
};

// PUT /api/locations/:id - Mock (not implemented in backend)
export const updateLocation = async (id: string, location: Partial<Location>): Promise<Location> => {
  // Not implemented in backend yet
  throw new Error('Location management not implemented in backend');
};
