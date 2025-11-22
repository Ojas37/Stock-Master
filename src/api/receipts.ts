import { Receipt } from '../types';

// TODO: GET /receipts
export const getReceipts = async (filters?: any): Promise<Receipt[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          receiptNo: 'REC-2024-001',
          supplier: 'TechSupply Inc.',
          warehouseId: '1',
          warehouseName: 'Main Warehouse',
          status: 'done',
          createdDate: '2024-11-20',
          createdBy: 'John Doe',
          lines: [
            {
              id: 'L1',
              productId: '1',
              productName: 'Laptop Computer',
              locationId: 'L1',
              locationName: 'Shelf A-01',
              quantity: 10,
            },
          ],
        },
      ]);
    }, 500);
  });
};

// TODO: GET /receipts/{id}
export const getReceipt = async (id: string): Promise<Receipt> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        receiptNo: 'REC-2024-001',
        supplier: 'TechSupply Inc.',
        warehouseId: '1',
        warehouseName: 'Main Warehouse',
        status: 'done',
        createdDate: '2024-11-20',
        createdBy: 'John Doe',
        lines: [],
      });
    }, 500);
  });
};

// TODO: POST /receipts
export const createReceipt = async (receipt: Partial<Receipt>): Promise<Receipt> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        ...receipt,
      } as Receipt);
    }, 500);
  });
};

// TODO: PUT /receipts/{id}
export const updateReceipt = async (id: string, receipt: Partial<Receipt>): Promise<Receipt> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        ...receipt,
      } as Receipt);
    }, 500);
  });
};

// TODO: POST /receipts/{id}/confirm
export const confirmReceipt = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Receipt ${id} confirmed - stock increased`);
      resolve();
    }, 500);
  });
};
