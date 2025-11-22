import { Transfer } from '../types';

// TODO: GET /transfers
export const getTransfers = async (filters?: any): Promise<Transfer[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          transferNo: 'TRF-2024-023',
          fromWarehouseId: '1',
          fromWarehouseName: 'Main Warehouse',
          toWarehouseId: '2',
          toWarehouseName: 'Warehouse B',
          status: 'waiting',
          createdDate: '2024-11-22',
          createdBy: 'Mike Johnson',
          lines: [],
        },
      ]);
    }, 500);
  });
};

// TODO: GET /transfers/{id}
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

// TODO: POST /transfers
export const createTransfer = async (transfer: Partial<Transfer>): Promise<Transfer> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        ...transfer,
      } as Transfer);
    }, 500);
  });
};

// TODO: PUT /transfers/{id}
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

// TODO: POST /transfers/{id}/confirm
export const confirmTransfer = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Transfer ${id} confirmed - stock moved between locations`);
      resolve();
    }, 500);
  });
};
