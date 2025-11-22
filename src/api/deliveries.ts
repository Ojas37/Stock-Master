import { Delivery } from '../types';

// TODO: GET /deliveries
export const getDeliveries = async (filters?: any): Promise<Delivery[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          deliveryNo: 'DEL-2024-045',
          customerName: 'ABC Corporation',
          warehouseId: '1',
          warehouseName: 'Main Warehouse',
          status: 'ready',
          createdDate: '2024-11-21',
          createdBy: 'Jane Smith',
          lines: [],
        },
      ]);
    }, 500);
  });
};

// TODO: GET /deliveries/{id}
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

// TODO: POST /deliveries
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

// TODO: PUT /deliveries/{id}
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

// TODO: POST /deliveries/{id}/confirm
export const confirmDelivery = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Delivery ${id} confirmed - stock decreased`);
      resolve();
    }, 500);
  });
};
