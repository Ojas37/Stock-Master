'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/DashboardLayout';
import { StatusBadge } from '@/src/components/StatusBadge';
import { Modal } from '@/src/components/Modal';
import { getReceipts, confirmReceipt } from '@/src/api/receipts';
import { Receipt } from '@/src/types';
import { Plus, Search } from 'lucide-react';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Partial<Receipt>>({
    receiptNo: `REC-${Date.now()}`,
    supplier: '',
    warehouseId: '',
    status: 'draft',
    lines: [],
  });

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    const data = await getReceipts();
    setReceipts(data);
  };

  const handleValidate = async (id: string) => {
    if (confirm('Confirm this receipt? Stock will be increased.')) {
      await confirmReceipt(id);
      loadReceipts();
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  placeholder="Enter supplier name"
                  value={editingReceipt.supplier}
                  onChange={(e) => setEditingReceipt({ ...editingReceipt, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={editingReceipt.warehouseId}
                  onChange={(e) => setEditingReceipt({ ...editingReceipt, warehouseId: e.target.value })}
                >
                  <option value="">Select Warehouse</option>
                  <option value="1">Main Warehouse</option>
                  <option value="2">Warehouse B</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
              <p className="text-sm text-gray-500 mb-4">Add products and quantities (feature coming soon)</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  alert('Receipt saved as draft');
                  setIsFormModalOpen(false);
                }}
                className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Save as Draft
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
