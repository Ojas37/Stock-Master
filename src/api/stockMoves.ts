import { StockMove } from '../types';

// TODO: GET /stock-moves with query params
export const getStockMoves = async (filters?: any): Promise<StockMove[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          date: '2024-11-20T10:30:00',
          productId: '1',
          productName: 'Laptop Computer',
          moveType: 'receipt',
          documentType: 'Receipt',
          documentNo: 'REC-2024-001',
          toLocationId: 'L1',
          toLocationName: 'Shelf A-01',
          quantity: 10,
          performedBy: 'John Doe',
        },
        {
          id: '2',
          date: '2024-11-21T14:15:00',
          productId: '1',
          productName: 'Laptop Computer',
          moveType: 'delivery',
          documentType: 'Delivery',
          documentNo: 'DEL-2024-045',
          fromLocationId: 'L1',
          fromLocationName: 'Shelf A-01',
          quantity: -5,
          performedBy: 'Jane Smith',
        },
      ]);
    }, 500);
  });
};
