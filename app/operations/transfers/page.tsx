'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/DashboardLayout';
import { StatusBadge } from '@/src/components/StatusBadge';
import { getTransfers } from '@/src/api/transfers';
import { Transfer } from '@/src/types';
import { Plus } from 'lucide-react';

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    const data = await getTransfers();
    setTransfers(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Internal Transfers</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
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
                    <button className="text-blue-600 hover:text-blue-800">Validate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
