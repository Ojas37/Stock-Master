'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/DashboardLayout';
import { StatusBadge } from '@/src/components/StatusBadge';
import { Modal } from '@/src/components/Modal';
import { getReceipts, confirmReceipt, createReceipt } from '@/src/api/receipts';
import { getProducts } from '@/src/api/products';
import { getWarehouses } from '@/src/api/warehouses';
import { Receipt, Product, Warehouse } from '@/src/types';
import { Plus, Search, Trash2 } from 'lucide-react';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Partial<Receipt>>({
    receiptNo: `REC-${Date.now()}`,
    supplier: '',
    warehouseId: '',
    status: 'draft',
    lines: [],
  });

  // Line item being edited
  const [currentLine, setCurrentLine] = useState({
    productId: '',
    quantity: 0,
    unitPrice: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [receiptsData, productsData, warehousesData] = await Promise.all([
      getReceipts(),
      getProducts(),
      getWarehouses(),
    ]);
    setReceipts(receiptsData);
    setProducts(productsData);
    setWarehouses(warehousesData);
  };

  const handleValidate = async (id: string) => {
    if (confirm('Confirm this receipt? Stock will be increased.')) {
      await confirmReceipt(id);
      loadData();
    }
  };

  const handleAddLineItem = () => {
    if (!currentLine.productId || currentLine.quantity <= 0 || currentLine.unitPrice <= 0) {
      alert('Please select a product and enter valid quantity and price');
      return;
    }

    const product = products.find(p => p.id === currentLine.productId);
    if (!product) return;

    const newLine = {
      productId: currentLine.productId,
      productName: product.name,
      sku: product.sku,
      quantity: currentLine.quantity,
      unitPrice: currentLine.unitPrice,
      total: currentLine.quantity * currentLine.unitPrice,
    };

    setEditingReceipt({
      ...editingReceipt,
      lines: [...(editingReceipt.lines || []), newLine],
    });

    // Reset form
    setCurrentLine({ productId: '', quantity: 0, unitPrice: 0 });
  };

  const handleRemoveLine = (index: number) => {
    const lines = [...(editingReceipt.lines || [])];
    lines.splice(index, 1);
    setEditingReceipt({ ...editingReceipt, lines });
  };

  const handleSaveReceipt = async () => {
    try {
      if (!editingReceipt.supplier || !editingReceipt.warehouseId) {
        alert('Please fill in supplier and warehouse');
        return;
      }

      if (!editingReceipt.lines || editingReceipt.lines.length === 0) {
        alert('Please add at least one product');
        return;
      }

      // Create receipt with first line item (simplified for now)
      const firstLine = editingReceipt.lines[0];
      await createReceipt({
        type: 'receipt',
        productId: firstLine.productId,
        toWarehouseId: editingReceipt.warehouseId,
        quantity: firstLine.quantity,
        unitPrice: firstLine.unitPrice,
        notes: `Supplier: ${editingReceipt.supplier}`,
      });

      setIsFormModalOpen(false);
      setEditingReceipt({
        receiptNo: `REC-${Date.now()}`,
        supplier: '',
        warehouseId: '',
        status: 'draft',
        lines: [],
      });
      loadData();
      alert('Receipt created successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to create receipt');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Receipts (Incoming Goods)</h1>
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus className="w-5 h-5" />
            Create New Receipt
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search by receipt number..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="done">Done</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Warehouses</option>
              <option value="1">Main Warehouse</option>
            </select>
          </div>
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{receipt.receiptNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{receipt.supplier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{receipt.warehouseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={receipt.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{receipt.createdDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleValidate(receipt.id)}
                      disabled={receipt.status === 'done'}
                      className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                    >
                      Validate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Receipt Modal - Simplified */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title="Create Receipt"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt No</label>
                <input
                  type="text"
                  value={editingReceipt.receiptNo}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                <input
                  type="text"
                  placeholder="Enter supplier name"
                  value={editingReceipt.supplier}
                  onChange={(e) => setEditingReceipt({ ...editingReceipt, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={editingReceipt.warehouseId}
                  onChange={(e) => setEditingReceipt({ ...editingReceipt, warehouseId: e.target.value })}
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Product</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <select
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={currentLine.productId}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value);
                    setCurrentLine({
                      ...currentLine,
                      productId: e.target.value,
                      unitPrice: product?.unitPrice || 0,
                    });
                  }}
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={currentLine.quantity || ''}
                  onChange={(e) => setCurrentLine({ ...currentLine, quantity: parseInt(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="number"
                  placeholder="Price"
                  min="0"
                  step="0.01"
                  value={currentLine.unitPrice || ''}
                  onChange={(e) => setCurrentLine({ ...currentLine, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button
                onClick={handleAddLineItem}
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                + Add Line Item
              </button>
            </div>

            {/* Line Items List */}
            {editingReceipt.lines && editingReceipt.lines.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {editingReceipt.lines.map((line: any, index: number) => (
                        <tr key={index}>
                          <td className="px-3 py-2 text-sm">{line.productName}</td>
                          <td className="px-3 py-2 text-sm">{line.quantity}</td>
                          <td className="px-3 py-2 text-sm">${line.unitPrice}</td>
                          <td className="px-3 py-2 text-sm font-medium">${line.total.toFixed(2)}</td>
                          <td className="px-3 py-2 text-sm">
                            <button
                              onClick={() => handleRemoveLine(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveReceipt}
                className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Create Receipt
              </button>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
