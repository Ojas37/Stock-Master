-- StockMaster Database Schema
-- PostgreSQL Database

-- Drop existing tables if they exist
DROP TABLE IF EXISTS stock_moves CASCADE;
DROP TABLE IF EXISTS operations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS otp_verifications CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP verifications table
CREATE TABLE otp_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'signup', 'reset'
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses table
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    manager VARCHAR(255),
    contact VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    unit_price DECIMAL(10, 2) NOT NULL,
    reorder_point INTEGER DEFAULT 0,
    total_stock INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Operations table (receipts, deliveries, transfers, adjustments)
CREATE TABLE operations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'receipt', 'delivery', 'transfer', 'adjustment'
    reference VARCHAR(100) UNIQUE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    from_warehouse_id INTEGER REFERENCES warehouses(id),
    to_warehouse_id INTEGER REFERENCES warehouses(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2),
    total_value DECIMAL(12, 2),
    status VARCHAR(20) DEFAULT 'pending',
    reason TEXT,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock moves table (real-time stock tracking)
CREATE TABLE stock_moves (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    operation_id INTEGER REFERENCES operations(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    movement_type VARCHAR(10) NOT NULL, -- 'in', 'out'
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_operations_type ON operations(type);
CREATE INDEX idx_operations_status ON operations(status);
CREATE INDEX idx_operations_product ON operations(product_id);
CREATE INDEX idx_stock_moves_product ON stock_moves(product_id);
CREATE INDEX idx_stock_moves_warehouse ON stock_moves(warehouse_id);
CREATE INDEX idx_otp_email ON otp_verifications(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO warehouses (name, location, capacity, manager, contact) VALUES
('Main Warehouse', 'New York, NY', 10000, 'John Smith', '+1-555-0101'),
('West Coast Hub', 'Los Angeles, CA', 8000, 'Sarah Johnson', '+1-555-0102'),
('East Distribution', 'Boston, MA', 6000, 'Mike Wilson', '+1-555-0103');

INSERT INTO products (sku, name, category, description, unit_price, reorder_point) VALUES
('LAPTOP-001', 'Dell XPS 15', 'Electronics', 'High-performance laptop', 1299.99, 10),
('MOUSE-001', 'Logitech MX Master', 'Electronics', 'Wireless mouse', 99.99, 50),
('DESK-001', 'Standing Desk Pro', 'Furniture', 'Adjustable height desk', 599.99, 5),
('CHAIR-001', 'Ergonomic Office Chair', 'Furniture', 'Comfortable office seating', 399.99, 8),
('MONITOR-001', 'Samsung 27" 4K', 'Electronics', '4K display monitor', 449.99, 15);

COMMENT ON TABLE users IS 'System users with authentication';
COMMENT ON TABLE otp_verifications IS 'OTP codes for email verification and password reset';
COMMENT ON TABLE warehouses IS 'Physical warehouse locations';
COMMENT ON TABLE products IS 'Product catalog';
COMMENT ON TABLE operations IS 'Inventory operations (receipts, deliveries, transfers, adjustments)';
COMMENT ON TABLE stock_moves IS 'Detailed stock movement history';
