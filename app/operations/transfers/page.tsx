'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/DashboardLayout';
import { StatusBadge } from '@/src/components/StatusBadge';
import { Modal } from '@/src/components/Modal';
import { getTransfers, createTransfer, confirmTransfer } from '@/src/api/transfers';
import { getProducts } from '@/src/api/products';
import { getWarehouses } from '@/src/api/warehouses';
import { Transfer, Product, Warehouse } from '@/src/types';
import { Plus, Trash2 } from 'lucide-react';

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<any>({
    transferNo: `TRF-${Date.now()}`,
    fromWarehouseId: '',
    toWarehouseId: '',
    status: 'draft',
    lines: [],
  });

  const [currentLine, setCurrentLine] = useState({
    productId: '',
    quantity: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [transfersData, productsData, warehousesData] = await Promise.all([
      getTransfers(),
      getProducts(),
      getWarehouses(),
    ]);
    setTransfers(transfersData);
    setProducts(productsData);
    setWarehouses(warehousesData);
  };

  const handleAddLineItem = () => {
    if (!currentLine.productId || currentLine.quantity <= 0) {
      alert('Please select a product and enter a valid quantity');
      return;
    }

    const product = products.find(p => p.id === currentLine.productId);
    if (!product) return;

    const newLine = {
      productId: currentLine.productId,
      productName: product.name,
      sku: product.sku,
      quantity: currentLine.quantity,
    };

    setEditingTransfer({
      ...editingTransfer,
      lines: [...(editingTransfer.lines || []), newLine],
    });

    setCurrentLine({ productId: '', quantity: 0 });
  };

  const handleRemoveLine = (index: number) => {
    const lines = [...(editingTransfer.lines || [])];
    lines.splice(index, 1);
    setEditingTransfer({ ...editingTransfer, lines });
  };

  const handleSaveTransfer = async () => {
    try {
      if (!editingTransfer.fromWarehouseId || !editingTransfer.toWarehouseId) {
        alert('Please select both source and destination warehouses');
        return;
      }

      if (editingTransfer.fromWarehouseId === editingTransfer.toWarehouseId) {
        alert('Source and destination warehouses cannot be the same');
        return;
      }

      if (!editingTransfer.lines || editingTransfer.lines.length === 0) {
        alert('Please add at least one product');
        return;
      }

      const firstLine = editingTransfer.lines[0];
      await createTransfer({
        type: 'transfer',
        productId: firstLine.productId,
        fromWarehouseId: editingTransfer.fromWarehouseId,
        toWarehouseId: editingTransfer.toWarehouseId,
        quantity: firstLine.quantity,
        notes: `Transfer from warehouse ${editingTransfer.fromWarehouseId} to ${editingTransfer.toWarehouseId}`,
      });

      setIsFormModalOpen(false);
      setEditingTransfer({
        transferNo: `TRF-${Date.now()}`,
        fromWarehouseId: '',
        toWarehouseId: '',
        status: 'draft',
        lines: [],
      });
      loadData();
      alert('Transfer created successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to create transfer');
    }
  };

  const handleValidate = async (id: string) => {
    if (confirm('Confirm this transfer? Stock will be moved between warehouses.')) {
      await confirmTransfer(id);
      loadData();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Internal Transfers</h1>
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus className="w-5 h-5" />
            Create Transfer
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transfer No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{transfer.transferNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{transfer.fromWarehouseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{transfer.toWarehouseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={transfer.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{transfer.createdDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleValidate(transfer.id)}
                      disabled={transfer.status === 'completed'}
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

        {/* Create Transfer Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title="Create Transfer"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transfer No</label>
                <input
                  type="text"
                  value={editingTransfer.transferNo}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Warehouse *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={editingTransfer.fromWarehouseId}
                  onChange={(e) => setEditingTransfer({ ...editingTransfer, fromWarehouseId: e.target.value })}
                >
                  <option value="">Select Source Warehouse</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">To Warehouse *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={editingTransfer.toWarehouseId}
                  onChange={(e) => setEditingTransfer({ ...editingTransfer, toWarehouseId: e.target.value })}
                >
                  <option value="">Select Destination Warehouse</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Product</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <select
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={currentLine.productId}
                  onChange={(e) => setCurrentLine({ ...currentLine, productId: e.target.value })}
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Quantity"
                  min="1"
                  value={currentLine.quantity || ''}
                  onChange={(e) => setCurrentLine({ ...currentLine, quantity: parseInt(e.target.value) || 0 })}
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
            {editingTransfer.lines && editingTransfer.lines.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {editingTransfer.lines.map((line: any, index: number) => (
                        <tr key={index}>
                          <td className="px-3 py-2 text-sm">{line.productName}</td>
                          <td className="px-3 py-2 text-sm">{line.sku}</td>
                          <td className="px-3 py-2 text-sm">{line.quantity}</td>
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
                onClick={handleSaveTransfer}
                className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Create Transfer
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
