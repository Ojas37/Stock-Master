import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply authentication to all product routes
router.use(authenticateToken);

/**
 * GET /api/products
 * Get all products with optional filters
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, status } = req.query;

    let queryText = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      queryText += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (status) {
      queryText += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);

    res.json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
});

/**
 * GET /api/products/:id
 * Get product by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
});

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    console.log('Create product request body:', req.body);
    const { sku, name, category, description, unit_price, reorder_point } = req.body;

    if (!sku || !name || !category || !unit_price) {
      console.log('Validation failed:', { sku, name, category, unit_price });
      return res.status(400).json({
        success: false,
        message: 'SKU, name, category, and unit price are required',
      });
    }

    // Check if SKU already exists
    const existing = await query('SELECT id FROM products WHERE sku = $1', [sku]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'SKU already exists',
      });
    }

    const result = await query(
      'INSERT INTO products (sku, name, category, description, unit_price, reorder_point) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [sku, name, category, description || null, unit_price, reorder_point || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
    });
  }
});

/**
 * PUT /api/products/:id
 * Update a product
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { sku, name, category, description, unit_price, reorder_point, status } = req.body;

    // Check if product exists
    const existing = await query('SELECT id FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const result = await query(
      'UPDATE products SET sku = $1, name = $2, category = $3, description = $4, unit_price = $5, reorder_point = $6, status = $7 WHERE id = $8 RETURNING *',
      [sku, name, category, description, unit_price, reorder_point, status || 'active', id]
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
    });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
    });
  }
});

export default router;
