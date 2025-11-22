// Core Types for StockMaster IMS

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitOfMeasure: string;
  reorderLevel: number;
  totalStock: number;
}

export interface StockByLocation {
  warehouseId: string;
  warehouseName: string;
  locationId: string;
  locationName: string;
  quantity: number;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
}

export interface Location {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
}

export type OperationStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
export type OperationType = 'receipt' | 'delivery' | 'transfer' | 'adjustment';

export interface Receipt {
  id: string;
  receiptNo: string;
  supplier: string;
  warehouseId: string;
  warehouseName: string;
  status: OperationStatus;
  createdDate: string;
  createdBy: string;
  lines: ReceiptLine[];
}

export interface ReceiptLine {
  id: string;
  productId: string;
  productName: string;
  locationId: string;
  locationName: string;
  quantity: number;
}

export interface Delivery {
  id: string;
  deliveryNo: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;
  status: OperationStatus;
  createdDate: string;
  createdBy: string;
  lines: DeliveryLine[];
}

export interface DeliveryLine {
  id: string;
  productId: string;
  productName: string;
  locationId: string;
  locationName: string;
  quantity: number;
}

export interface Transfer {
  id: string;
  transferNo: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  status: OperationStatus;
  createdDate: string;
  createdBy: string;
  lines: TransferLine[];
}

export interface TransferLine {
  id: string;
  productId: string;
  productName: string;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  quantity: number;
}

export interface Adjustment {
  id: string;
  adjustmentNo: string;
  warehouseId: string;
  warehouseName: string;
  locationId: string;
  locationName: string;
  status: OperationStatus;
  reason: string;
  createdDate: string;
  createdBy: string;
  lines: AdjustmentLine[];
}

export interface AdjustmentLine {
  id: string;
  productId: string;
  productName: string;
  systemQuantity: number;
  countedQuantity: number;
  difference: number;
}

export interface StockMove {
  id: string;
  date: string;
  productId: string;
  productName: string;
  moveType: OperationType;
  documentType: string;
  documentNo: string;
  fromLocationId?: string;
  fromLocationName?: string;
  toLocationId?: string;
  toLocationName?: string;
  quantity: number;
  performedBy: string;
}

export interface DashboardSummary {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  scheduledTransfers: number;
}

export interface RecentOperation {
  documentNo: string;
  type: OperationType;
  status: OperationStatus;
  warehouse: string;
  date: string;
  createdBy: string;
}
