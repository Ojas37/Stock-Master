'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/DashboardLayout';
import { getStockMoves } from '@/src/api/stockMoves';
import { StockMove } from '@/src/types';

export default function StockLedgerPage() {
  const [moves, setMoves] = useState<StockMove[]>([]);

  useEffect(() => {
    loadMoves();
  }, []);

  const loadMoves = async () => {
    const data = await getStockMoves();
    setMoves(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Stock Ledger / Move History</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search product..."
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Warehouses</option>
              <option value="1">Main Warehouse</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Move Types</option>
              <option value="receipt">Receipt</option>
              <option value="delivery">Delivery</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjustment</option>
            </select>
            <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Stock Moves Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Move Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {moves.map((move) => (
                <tr key={move.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(move.date).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{move.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{move.moveType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{move.documentNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{move.fromLocationName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{move.toLocationName || '-'}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${move.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {move.quantity > 0 ? '+' : ''}{move.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{move.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
