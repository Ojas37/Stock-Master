'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/DashboardLayout';
import { StatusBadge } from '@/src/components/StatusBadge';
import { getAdjustments } from '@/src/api/adjustments';
import { Adjustment } from '@/src/types';
import { Plus } from 'lucide-react';

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

  useEffect(() => {
    loadAdjustments();
  }, []);

  const loadAdjustments = async () => {
    const data = await getAdjustments();
    setAdjustments(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Stock Adjustments</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
            <Plus className="w-5 h-5" />
            New Adjustment
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adjustment No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adjustments.map((adjustment) => (
                <tr key={adjustment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{adjustment.adjustmentNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{adjustment.warehouseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{adjustment.locationName}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={adjustment.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{adjustment.createdDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800">Confirm</button>
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
