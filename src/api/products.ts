import { Product, StockByLocation } from '../types';
import { fetchWithAuth, handleResponse } from './config';

// GET /api/products - Fetch all products with optional filters
export const getProducts = async (filters?: any): Promise<Product[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.status) queryParams.append('status', filters.status);

    const response = await fetchWithAuth(`/api/products?${queryParams.toString()}`);
    const result = await handleResponse<{ success: boolean; products: any[] }>(response);
    
    // Map backend response to frontend Product type
    return result.products.map((p: any) => ({
      id: p.id.toString(),
      sku: p.sku,
      name: p.name,
      category: p.category,
      description: p.description,
      unitOfMeasure: 'Unit', // Backend doesn't have this field
      reorderLevel: p.reorder_point,
      totalStock: p.total_stock,
      unitPrice: p.unit_price,
      status: p.status,
    }));
  } catch (error) {
    console.error('Get products error:', error);
    return [];
  }
};

// GET /api/products/:id - Fetch single product
export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const products = await getProducts();
    return products.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Get product error:', error);
    return null;
  }
};

// GET /api/products/:id/stock-by-location - Mock for now (backend doesn't have warehouse-level stock yet)
export const getProductStockByLocation = async (productId: string): Promise<StockByLocation[]> => {
  // This would need a separate backend endpoint for warehouse-level stock tracking
  // For now, return empty array or implement when backend supports it
  return [];
};

// POST /api/products - Create new product
export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  try {
    const payload = {
      sku: product.sku,
      name: product.name,
      category: product.category,
      description: product.description,
      unit_price: product.unitPrice || 0,
      reorder_point: product.reorderLevel || 0,
    };
    
    console.log('Creating product with payload:', payload);
    
    const response = await fetchWithAuth('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const result = await handleResponse<{ success: boolean; product: any }>(response);
    
    return {
      id: result.product.id.toString(),
      sku: result.product.sku,
      name: result.product.name,
      category: result.product.category,
      description: result.product.description,
      unitOfMeasure: 'Unit',
      reorderLevel: result.product.reorder_point,
      totalStock: result.product.total_stock,
      unitPrice: result.product.unit_price,
      status: result.product.status,
    };
  } catch (error: any) {
    console.error('Create product error:', error);
    throw error;
  }
};

// PUT /api/products/:id - Update product
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    const response = await fetchWithAuth(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        sku: product.sku,
        name: product.name,
        category: product.category,
        description: product.description,
        unit_price: product.unitPrice,
        reorder_point: product.reorderLevel,
        status: product.status,
      }),
    });

    const result = await handleResponse<{ success: boolean; product: any }>(response);
    
    return {
      id: result.product.id.toString(),
      sku: result.product.sku,
      name: result.product.name,
      category: result.product.category,
      description: result.product.description,
      unitOfMeasure: 'Unit',
      reorderLevel: result.product.reorder_point,
      totalStock: result.product.total_stock,
      unitPrice: result.product.unit_price,
      status: result.product.status,
    };
  } catch (error: any) {
    console.error('Update product error:', error);
    throw error;
  }
};

// DELETE /api/products/:id - Delete product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const response = await fetchWithAuth(`/api/products/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<{ success: boolean }>(response);
  } catch (error: any) {
    console.error('Delete product error:', error);
    throw error;
  }
};
