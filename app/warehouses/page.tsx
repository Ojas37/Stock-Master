'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/DashboardLayout';
import { getWarehouses, getWarehouseLocations } from '@/src/api/warehouses';
import { Warehouse, Location } from '@/src/types';
import { Plus } from 'lucide-react';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    const data = await getWarehouses();
    setWarehouses(data);
  };

  const handleSelectWarehouse = async (warehouseId: string) => {
    setSelectedWarehouse(warehouseId);
    const locs = await getWarehouseLocations(warehouseId);
    setLocations(locs);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Warehouses & Locations</h1>

        {/* Warehouses Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Warehouses</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
              <Plus className="w-5 h-5" />
              Add Warehouse
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {warehouses.map((warehouse) => (
                <tr 
                  key={warehouse.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectWarehouse(warehouse.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{warehouse.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{warehouse.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{warehouse.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Locations Section */}
        {selectedWarehouse && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Locations</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                <Plus className="w-5 h-5" />
                Add Location
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{location.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{location.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
