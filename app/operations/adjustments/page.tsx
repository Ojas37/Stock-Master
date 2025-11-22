'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/DashboardLayout';
import { StatusBadge } from '@/src/components/StatusBadge';
import { getAdjustments, createAdjustment, confirmAdjustment } from '@/src/api/adjustments';
import { getProducts } from '@/src/api/products';
import { getWarehouses } from '@/src/api/warehouses';
import { Adjustment, Product, Warehouse } from '@/src/types';
import { Plus, Trash2 } from 'lucide-react';

interface LineItem {
  productId: string;
  productName: string;
  currentStock: number;
  countedStock: number;
  difference: number;
}

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState<any>({
    warehouseId: '',
    notes: '',
    lines: [] as LineItem[],
  });
  const [currentLine, setCurrentLine] = useState({
    productId: '',
    countedStock: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [adjustmentsData, productsData, warehousesData] = await Promise.all([
      getAdjustments(),
      getProducts(),
      getWarehouses(),
    ]);
    setAdjustments(adjustmentsData);
    setProducts(productsData);
    setWarehouses(warehousesData);
  };

  const loadAdjustments = async () => {
    const data = await getAdjustments();
    setAdjustments(data);
  };

  const handleAddLineItem = () => {
    if (!currentLine.productId) {
      alert('Please select a product');
      return;
    }

    const product = products.find((p) => p.id === currentLine.productId);
    if (!product) return;

    const currentStock = product.totalStock || 0;
    const difference = currentLine.countedStock - currentStock;

    const newLine: LineItem = {
      productId: product.id,
      productName: product.name,
      currentStock,
      countedStock: currentLine.countedStock,
      difference,
    };

    setEditingAdjustment({
      ...editingAdjustment,
      lines: [...editingAdjustment.lines, newLine],
    });

    setCurrentLine({ productId: '', countedStock: 0 });
  };

  const handleRemoveLine = (index: number) => {
    setEditingAdjustment({
      ...editingAdjustment,
      lines: editingAdjustment.lines.filter((_: any, i: number) => i !== index),
    });
  };

  const handleSaveAdjustment = async () => {
    if (!editingAdjustment.warehouseId) {
      alert('Please select a warehouse');
      return;
    }

    if (editingAdjustment.lines.length === 0) {
      alert('Please add at least one product');
      return;
    }

    try {
      // Create adjustment for each line item
      for (const line of editingAdjustment.lines) {
        await createAdjustment({
          productId: line.productId,
          toWarehouseId: editingAdjustment.warehouseId,
          quantity: line.difference,
          reason: line.difference >= 0 ? 'Physical count - increase' : 'Physical count - decrease',
          notes: editingAdjustment.notes,
        });
      }

      setShowModal(false);
      setEditingAdjustment({ warehouseId: '', notes: '', lines: [] });
      loadAdjustments();
    } catch (error) {
      console.error('Error creating adjustment:', error);
      alert('Failed to create adjustment');
    }
  };

  const handleValidate = async (adjustmentId: string) => {
    try {
      await confirmAdjustment(adjustmentId);
      loadAdjustments();
    } catch (error) {
      console.error('Error confirming adjustment:', error);
      alert('Failed to confirm adjustment');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Physical Count & Stock Adjustments</h1>
            <p className="text-sm text-gray-600 mt-1">Record physical inventory counts and adjust stock levels</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
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
                    {adjustment.status === 'pending' && (
                      <button 
                        onClick={() => handleValidate(adjustment.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Confirm
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* New Adjustment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">New Physical Count & Adjustment</h2>
              
              <div className="space-y-4">
                {/* Warehouse Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                  <select
                    value={editingAdjustment.warehouseId}
                    onChange={(e) => setEditingAdjustment({ ...editingAdjustment, warehouseId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                    ))}
                  </select>
                </div>

                {/* Add Line Item Section */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Add Product to Count</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                      <select
                        value={currentLine.productId}
                        onChange={(e) => setCurrentLine({ ...currentLine, productId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} (Current: {product.totalStock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Counted Stock</label>
                      <input
                        type="number"
                        value={currentLine.countedStock}
                        onChange={(e) => setCurrentLine({ ...currentLine, countedStock: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        min="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddLineItem}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add Product
                      </button>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                {editingAdjustment.lines.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Current Stock</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Counted Stock</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Difference</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {editingAdjustment.lines.map((line: LineItem, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{line.productName}</td>
                            <td className="px-4 py-2 text-sm text-right">{line.currentStock}</td>
                            <td className="px-4 py-2 text-sm text-right font-semibold">{line.countedStock}</td>
                            <td className={`px-4 py-2 text-sm text-right font-semibold ${line.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {line.difference >= 0 ? '+' : ''}{line.difference}
                            </td>
                            <td className="px-4 py-2 text-right">
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
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editingAdjustment.notes}
                    onChange={(e) => setEditingAdjustment({ ...editingAdjustment, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Add notes about this physical count..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingAdjustment({ warehouseId: '', notes: '', lines: [] });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAdjustment}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Save Adjustment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
