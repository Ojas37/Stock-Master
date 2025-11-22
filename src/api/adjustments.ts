import { Adjustment } from '../types';

// TODO: GET /adjustments
export const getAdjustments = async (filters?: any): Promise<Adjustment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
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
        },
      ]);
    }, 500);
  });
};

// TODO: GET /adjustments/{id}
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

// TODO: POST /adjustments
export const createAdjustment = async (adjustment: Partial<Adjustment>): Promise<Adjustment> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        ...adjustment,
      } as Adjustment);
    }, 500);
  });
};

// TODO: PUT /adjustments/{id}
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

// TODO: POST /adjustments/{id}/confirm
export const confirmAdjustment = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Adjustment ${id} confirmed - stock quantities updated`);
      resolve();
    }, 500);
  });
};
