import { Product, StockByLocation } from '../types';

// TODO: GET /products
export const getProducts = async (filters?: any): Promise<Product[]> => {
  // Mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          sku: 'PROD-001',
          name: 'Laptop Computer',
          category: 'Electronics',
          unitOfMeasure: 'Unit',
          reorderLevel: 10,
          totalStock: 45,
        },
        {
          id: '2',
          sku: 'PROD-002',
          name: 'Office Chair',
          category: 'Furniture',
          unitOfMeasure: 'Unit',
          reorderLevel: 5,
          totalStock: 23,
        },
        {
          id: '3',
          sku: 'PROD-003',
          name: 'Printer Paper A4',
          category: 'Stationery',
          unitOfMeasure: 'Box',
          reorderLevel: 50,
          totalStock: 120,
        },
      ]);
    }, 500);
  });
};

// TODO: GET /products/{id}
export const getProduct = async (id: string): Promise<Product> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        sku: 'PROD-001',
        name: 'Laptop Computer',
        category: 'Electronics',
        unitOfMeasure: 'Unit',
        reorderLevel: 10,
        totalStock: 45,
      });
    }, 500);
  });
};

// TODO: GET /products/{id}/stock-by-location
export const getProductStockByLocation = async (productId: string): Promise<StockByLocation[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          warehouseId: '1',
          warehouseName: 'Main Warehouse',
          locationId: 'L1',
          locationName: 'Shelf A-01',
          quantity: 25,
        },
        {
          warehouseId: '1',
          warehouseName: 'Main Warehouse',
          locationId: 'L2',
          locationName: 'Shelf A-02',
          quantity: 20,
        },
      ]);
    }, 500);
  });
};

// TODO: POST /products
export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        ...product,
      } as Product);
    }, 500);
  });
};

// TODO: PUT /products/{id}
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        ...product,
      } as Product);
    }, 500);
  });
};

// TODO: DELETE /products/{id}
export const deleteProduct = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};
