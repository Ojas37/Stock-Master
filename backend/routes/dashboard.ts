import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// GET /api/dashboard/summary - Get dashboard KPIs
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Total products
    const productsResult = await query('SELECT COUNT(*) as count FROM products WHERE status = $1', ['active']);
    
    // Total warehouses
    const warehousesResult = await query('SELECT COUNT(*) as count FROM warehouses WHERE status = $1', ['active']);
    
    // Total stock value
    const stockValueResult = await query('SELECT COALESCE(SUM(total_stock * unit_price), 0) as value FROM products');
    
    // Recent operations count
    let opsQuery = 'SELECT COUNT(*) as count FROM operations WHERE 1=1';
    const params: any[] = [];
    if (startDate && endDate) {
      opsQuery += ' AND created_at BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }
    const opsResult = await query(opsQuery, params);

    // Low stock products
    const lowStockResult = await query('SELECT COUNT(*) as count FROM products WHERE total_stock <= reorder_point');

    // Total products in stock
    const inStockResult = await query('SELECT COALESCE(SUM(total_stock), 0) as total FROM products');

    res.json({
      success: true,
      summary: {
        totalProducts: parseInt((productsResult.rows[0] as any).count),
        totalWarehouses: parseInt((warehousesResult.rows[0] as any).count),
        totalValue: parseFloat((stockValueResult.rows[0] as any).value),
        recentOperations: parseInt((opsResult.rows[0] as any).count),
        lowStockItems: parseInt((lowStockResult.rows[0] as any).count),
        totalStock: parseInt((inStockResult.rows[0] as any).total),
      },
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard summary' });
  }
});

// GET /api/dashboard/recent-operations - Get recent operations
router.get('/recent-operations', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await query(
      `SELECT o.*, p.name as product_name, p.sku,
              w1.name as from_warehouse_name, w2.name as to_warehouse_name
       FROM operations o
       LEFT JOIN products p ON o.product_id = p.id
       LEFT JOIN warehouses w1 ON o.from_warehouse_id = w1.id
       LEFT JOIN warehouses w2 ON o.to_warehouse_id = w2.id
       ORDER BY o.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      operations: result.rows,
    });
  } catch (error) {
    console.error('Recent operations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent operations' });
  }
});

// GET /api/dashboard/stock-ledger - Get stock ledger
router.get('/stock-ledger', async (req: AuthRequest, res: Response) => {
  try {
    const { productId, warehouseId, startDate, endDate } = req.query;

    let queryText = `
      SELECT sm.*, p.name as product_name, p.sku,
             w.name as warehouse_name, o.reference, o.type as operation_type
      FROM stock_moves sm
      JOIN products p ON sm.product_id = p.id
      JOIN warehouses w ON sm.warehouse_id = w.id
      LEFT JOIN operations o ON sm.operation_id = o.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (productId) {
      queryText += ` AND sm.product_id = $${paramIndex}`;
      params.push(productId);
      paramIndex++;
    }
    if (warehouseId) {
      queryText += ` AND sm.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }
    if (startDate) {
      queryText += ` AND sm.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      queryText += ` AND sm.created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    queryText += ' ORDER BY sm.created_at DESC LIMIT 100';

    const result = await query(queryText, params);

    res.json({
      success: true,
      stockMoves: result.rows,
    });
  } catch (error) {
    console.error('Stock ledger error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock ledger' });
  }
});

export default router;
