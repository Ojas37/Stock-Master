import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// GET /api/warehouses - Get all warehouses
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM warehouses ORDER BY created_at DESC');
    res.json({ success: true, warehouses: result.rows });
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch warehouses' });
  }
});

// POST /api/warehouses - Create warehouse
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, location, capacity, manager, contact } = req.body;
    const result = await query(
      'INSERT INTO warehouses (name, location, capacity, manager, contact) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, location, capacity, manager, contact]
    );
    res.status(201).json({ success: true, warehouse: result.rows[0] });
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({ success: false, message: 'Failed to create warehouse' });
  }
});

// PUT /api/warehouses/:id - Update warehouse
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, capacity, manager, contact, status } = req.body;
    const result = await query(
      'UPDATE warehouses SET name = $1, location = $2, capacity = $3, manager = $4, contact = $5, status = $6 WHERE id = $7 RETURNING *',
      [name, location, capacity, manager, contact, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    res.json({ success: true, warehouse: result.rows[0] });
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({ success: false, message: 'Failed to update warehouse' });
  }
});

// DELETE /api/warehouses/:id - Delete warehouse
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM warehouses WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    res.json({ success: true, message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete warehouse' });
  }
});

export default router;
