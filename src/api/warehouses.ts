import { Warehouse, Location } from '../types';

// TODO: GET /warehouses
export const getWarehouses = async (): Promise<Warehouse[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          name: 'Main Warehouse',
          code: 'WH-001',
          address: '123 Main St, City, State 12345',
        },
        {
          id: '2',
          name: 'Warehouse B',
          code: 'WH-002',
          address: '456 Industrial Ave, City, State 12345',
        },
      ]);
    }, 500);
  });
};

// TODO: POST /warehouses
export const createWarehouse = async (warehouse: Partial<Warehouse>): Promise<Warehouse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        ...warehouse,
      } as Warehouse);
    }, 500);
  });
};

// TODO: PUT /warehouses/{id}
export const updateWarehouse = async (id: string, warehouse: Partial<Warehouse>): Promise<Warehouse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        ...warehouse,
      } as Warehouse);
    }, 500);
  });
};

// TODO: GET /warehouses/{id}/locations
export const getWarehouseLocations = async (warehouseId: string): Promise<Location[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'L1',
          warehouseId,
          name: 'Shelf A-01',
          code: 'A-01',
        },
        {
          id: 'L2',
          warehouseId,
          name: 'Shelf A-02',
          code: 'A-02',
        },
      ]);
    }, 500);
  });
};

// TODO: POST /warehouses/{id}/locations
export const createLocation = async (warehouseId: string, location: Partial<Location>): Promise<Location> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        warehouseId,
        ...location,
      } as Location);
    }, 500);
  });
};

// TODO: PUT /locations/{id}
export const updateLocation = async (id: string, location: Partial<Location>): Promise<Location> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        ...location,
      } as Location);
    }, 500);
  });
};
