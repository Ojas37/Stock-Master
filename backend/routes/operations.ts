import { Router, Response } from 'express';
import { query, getClient } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// GET /api/operations - Get all operations with filters
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    let queryText = `
      SELECT o.*, p.name as product_name, p.sku,
             w1.name as from_warehouse_name, w2.name as to_warehouse_name,
             u.name as created_by_name
      FROM operations o
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN warehouses w1 ON o.from_warehouse_id = w1.id
      LEFT JOIN warehouses w2 ON o.to_warehouse_id = w2.id
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      queryText += ` AND o.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    if (status) {
      queryText += ` AND o.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (startDate) {
      queryText += ` AND o.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      queryText += ` AND o.created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    queryText += ' ORDER BY o.created_at DESC LIMIT 100';

    const result = await query(queryText, params);
    res.json({ success: true, operations: result.rows });
  } catch (error) {
    console.error('Get operations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch operations' });
  }
});

// POST /api/operations - Create new operation
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, productId, fromWarehouseId, toWarehouseId, quantity, unitPrice, reason, notes } = req.body;
    const reference = `${type.toUpperCase()}-${Date.now()}`;
    const totalValue = unitPrice ? quantity * unitPrice : null;

    // Insert operation with 'pending' status - will be confirmed later
    const opResult = await query(
      `INSERT INTO operations (type, reference, product_id, from_warehouse_id, to_warehouse_id, quantity, unit_price, total_value, status, reason, notes, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [type, reference, productId, fromWarehouseId || null, toWarehouseId || null, quantity, unitPrice || null, totalValue, 'pending', reason || null, notes || null, req.user?.id]
    );

    const operation = opResult.rows[0];

    // Stock movements will be created when operation is confirmed
    res.status(201).json({ success: true, operation: operation as any });
  } catch (error) {
    console.error('Create operation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create operation' });
  }
});

// PUT /api/operations/:id/confirm - Confirm operation and update stock
router.put('/:id/confirm', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get operation details
    const opResult = await query('SELECT * FROM operations WHERE id = $1', [id]);
    if (opResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Operation not found' });
    }

    const operation = opResult.rows[0] as any;
    if (operation.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Operation already confirmed' });
    }

    const { type, product_id: productId, from_warehouse_id: fromWarehouseId, to_warehouse_id: toWarehouseId, quantity } = operation;

    // Update stock based on operation type
    if (type === 'receipt') {
      // Stock IN to warehouse
      const balanceResult = await query(
        "SELECT COALESCE(SUM(CASE WHEN movement_type = 'in' THEN quantity ELSE -quantity END), 0) as balance FROM stock_moves WHERE product_id = $1 AND warehouse_id = $2",
        [productId, toWarehouseId]
      );
      const currentBalance = (balanceResult.rows[0] as any)?.balance || 0;
      
      await query(
        'INSERT INTO stock_moves (product_id, warehouse_id, operation_id, quantity, movement_type, balance_after) VALUES ($1, $2, $3, $4, $5, $6)',
        [productId, toWarehouseId, id, quantity, 'in', currentBalance + quantity]
      );
      await query('UPDATE products SET total_stock = total_stock + $1 WHERE id = $2', [quantity, productId]);
    } else if (type === 'delivery') {
      // Stock OUT from warehouse
      const balanceResult = await query(
        "SELECT COALESCE(SUM(CASE WHEN movement_type = 'in' THEN quantity ELSE -quantity END), 0) as balance FROM stock_moves WHERE product_id = $1 AND warehouse_id = $2",
        [productId, fromWarehouseId]
      );
      const currentBalance = (balanceResult.rows[0] as any)?.balance || 0;
      
      await query(
        'INSERT INTO stock_moves (product_id, warehouse_id, operation_id, quantity, movement_type, balance_after) VALUES ($1, $2, $3, $4, $5, $6)',
        [productId, fromWarehouseId, id, quantity, 'out', currentBalance - quantity]
      );
      await query('UPDATE products SET total_stock = total_stock - $1 WHERE id = $2', [quantity, productId]);
    } else if (type === 'transfer') {
      // Stock OUT from source
      const fromBalanceResult = await query(
        "SELECT COALESCE(SUM(CASE WHEN movement_type = 'in' THEN quantity ELSE -quantity END), 0) as balance FROM stock_moves WHERE product_id = $1 AND warehouse_id = $2",
        [productId, fromWarehouseId]
      );
      const fromBalance = (fromBalanceResult.rows[0] as any)?.balance || 0;
      
      await query(
        'INSERT INTO stock_moves (product_id, warehouse_id, operation_id, quantity, movement_type, balance_after) VALUES ($1, $2, $3, $4, $5, $6)',
        [productId, fromWarehouseId, id, quantity, 'out', fromBalance - quantity]
      );
      
      // Stock IN to destination
      const toBalanceResult = await query(
        "SELECT COALESCE(SUM(CASE WHEN movement_type = 'in' THEN quantity ELSE -quantity END), 0) as balance FROM stock_moves WHERE product_id = $1 AND warehouse_id = $2",
        [productId, toWarehouseId]
      );
      const toBalance = (toBalanceResult.rows[0] as any)?.balance || 0;
      
      await query(
        'INSERT INTO stock_moves (product_id, warehouse_id, operation_id, quantity, movement_type, balance_after) VALUES ($1, $2, $3, $4, $5, $6)',
        [productId, toWarehouseId, id, quantity, 'in', toBalance + quantity]
      );
    } else if (type === 'adjustment') {
      // Adjust stock (can be + or -)
      const movementType = quantity > 0 ? 'in' : 'out';
      const absQuantity = Math.abs(quantity);
      const warehouseId = toWarehouseId || fromWarehouseId;
      
      const balanceResult = await query(
        "SELECT COALESCE(SUM(CASE WHEN movement_type = 'in' THEN quantity ELSE -quantity END), 0) as balance FROM stock_moves WHERE product_id = $1 AND warehouse_id = $2",
        [productId, warehouseId]
      );
      const currentBalance = (balanceResult.rows[0] as any)?.balance || 0;
      
      await query(
        'INSERT INTO stock_moves (product_id, warehouse_id, operation_id, quantity, movement_type, balance_after) VALUES ($1, $2, $3, $4, $5, $6)',
        [productId, warehouseId, id, absQuantity, movementType, currentBalance + quantity]
      );
      await query('UPDATE products SET total_stock = total_stock + $1 WHERE id = $2', [quantity, productId]);
    }

    // Update operation status to completed
    await query('UPDATE operations SET status = $1 WHERE id = $2', ['completed', id]);

    res.json({ success: true, message: 'Operation confirmed and stock updated' });
  } catch (error) {
    console.error('Create operation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create operation' });
  }
});

export default router;
