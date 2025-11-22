'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/DashboardLayout';
import { StatusBadge } from '@/src/components/StatusBadge';
import { getDeliveries } from '@/src/api/deliveries';
import { Delivery } from '@/src/types';
import { Plus } from 'lucide-react';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    const data = await getDeliveries();
    setDeliveries(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Orders (Outgoing Goods)</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
            <Plus className="w-5 h-5" />
            Create Delivery Order
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{delivery.deliveryNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.warehouseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={delivery.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.createdDate}</td>
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
