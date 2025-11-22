# StockMaster - Intelligent Inventory Management System

A full-stack, production-ready Inventory Management System (IMS) with AI-powered natural language query capabilities. Built with Next.js 15, Express.js, SQLite, and OpenRouter LLM integration.

## ✨ Key Features

### 🤖 AI Chat Assistant (NEW)
- **Natural Language Queries**: Ask questions in plain English like "How many laptops do we have?"
- **Smart SQL Generation**: AI automatically converts queries to database operations
- **Real-time Insights**: Get instant answers about inventory, stock levels, and movement history
- **LLM-Powered**: Integrated with OpenRouter API (GPT-4o-mini) for intelligent responses

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **Email OTP verification** for account signup and password reset
- **Role-based access control** (Admin/User roles)
- **Password encryption** using bcrypt

### 📊 Dashboard
- **Real-time KPI cards**: Total products, low stock alerts, operations summary, warehouse capacity
- **Dynamic filtering**: Filter by warehouse, category, operation type, date range
- **Recent operations table**: Live view of all inventory movements
- **Low stock alerts**: Automatic notifications for products below reorder point

### 📦 Products Management
- **Complete CRUD operations** with validation
- **SKU-based tracking** for unique product identification
- **Category management** with dynamic filters
- **Unit pricing** and total stock calculations
- **Multi-warehouse stock visibility**
- **Reorder point alerts** for inventory optimization

### 🚚 Operations Module
- **Receipts**: Incoming goods from suppliers with line items
- **Deliveries**: Outgoing shipments to customers
- **Transfers**: Inter-warehouse stock movements
- **Physical Count & Adjustments**: Inventory reconciliation with reason tracking
- **Status workflow**: Pending → Completed with automatic stock updates
- **Reference tracking**: Unique operation IDs (RCP-001, DEL-001, etc.)

### 🏢 Warehouse Management
- **Multi-location support**: Manage multiple warehouse locations
- **Capacity tracking**: Monitor warehouse utilization
- **Manager assignment**: Assign warehouse managers with contact info
- **Stock distribution**: View stock across all locations

### 📈 Stock Ledger
- **Complete movement history**: Track every stock change
- **Audit trail**: Who, what, when, where for all operations
- **Balance tracking**: Real-time stock balances after each movement
- **Operation linking**: Connect movements to source operations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.6** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Express.js 5.1.0** - Node.js web framework
- **TypeScript** - Type-safe backend
- **better-sqlite3** - Fast, synchronous SQLite database
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service for OTP
- **dotenv** - Environment variable management

### AI Integration
- **OpenRouter API** - LLM provider gateway
- **GPT-4o-mini** - Natural language processing
- **Axios** - API communication

## 📁 Project Structure
```
my-app/
├── app/                      # Next.js pages (App Router)
│   ├── dashboard/           # Main dashboard
│   ├── products/            # Product management
│   ├── operations/          # Operations (receipts, deliveries, transfers, adjustments)
│   ├── warehouses/          # Warehouse management
│   ├── stock-ledger/        # Movement history
│   ├── ai-chat/            # AI Assistant page (NEW)
│   └── ...
├── backend/                 # Express.js backend
│   ├── server.ts           # Main server file
│   ├── routes/             # API endpoints
│   │   ├── auth.ts         # Authentication routes
│   │   ├── products.ts     # Product CRUD
│   │   ├── operations.ts   # Operations management
│   │   ├── warehouses.ts   # Warehouse CRUD
│   │   ├── aiChat.ts       # AI chat endpoints (NEW)
│   │   └── ...
│   ├── services/           # Business logic
│   │   ├── db.ts          # Database initialization
│   │   ├── email.ts       # Email service
│   │   ├── aiChat.ts      # AI service (NEW)
│   │   └── ...
│   └── middleware/         # Express middleware
├── src/
│   ├── api/               # Frontend API layer
│   ├── components/        # Reusable React components
│   ├── types/            # TypeScript definitions
│   └── lib/              # Utilities
├── database/
│   └── stockmaster.db    # SQLite database
├── components/
│   ├── AIChatAssistant.tsx  # AI chat UI (NEW)
│   └── ...
└── .env.local            # Environment variables
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Operations
- `GET /api/operations` - List operations with filters
- `POST /api/operations/receipt` - Create receipt
- `POST /api/operations/:id/complete` - Complete operation
- `POST /api/operations/transfer` - Transfer stock
- `POST /api/operations/adjustment` - Adjust stock

### Warehouses
- `GET /api/warehouses` - List all warehouses
- `POST /api/warehouses` - Create warehouse
- `PUT /api/warehouses/:id` - Update warehouse

### AI Chat (NEW)
- `POST /api/ai-chat` - Send natural language query
- `GET /api/ai-chat/suggestions` - Get example queries

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- OpenRouter API key (get one at https://openrouter.ai)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ojas37/Stock-Master.git
cd Stock-Master/my-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env.local` in the root directory:
```env
# Backend
PORT=5000
JWT_SECRET=your-secret-key-here

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# AI (OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

4. **Initialize database**

The database will be automatically created on first run at `database/stockmaster.db`

### Running the Application

**Start Backend (Terminal 1)**
```bash
npm run server:dev
# Backend runs on http://localhost:5000
```

**Start Frontend (Terminal 2)**
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

### Default Credentials
```
Email: admin@example.com
Password: admin123
```

## 🤖 Using the AI Chat Assistant

1. Navigate to **AI Assistant** in the sidebar (purple "NEW" badge)
2. Try example queries:
   - "How many Dell XPS 15 laptops do we have?"
   - "Show me all low stock items"
   - "What products are in the Main Warehouse?"
   - "Show me stock movements from last week"
3. The AI will:
   - Interpret your question
   - Generate appropriate SQL queries
   - Fetch real data from your database
   - Format a natural language response

### Supported Query Types
- **Stock Queries**: "How many [product] do we have?"
- **Low Stock**: "Show me low stock items"
- **Movement History**: "What moved last week?"
- **Forecasting**: "Predict demand for [product]"

## 📦 Database Schema

- **users** - User accounts with JWT authentication
- **products** - Product master data with SKU, pricing, reorder points
- **warehouses** - Warehouse locations with capacity
- **operations** - All inventory operations (receipts, deliveries, transfers, adjustments)
- **stock_moves** - Detailed movement history with balances
- **otp_verifications** - Email verification codes

## 🔧 Configuration

### Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password (Google Account → Security → App Passwords)
3. Add credentials to `.env.local`

### OpenRouter Setup
1. Sign up at https://openrouter.ai
2. Generate API key
3. Add `OPENROUTER_API_KEY` to `.env.local`
4. Estimated cost: ~$0.001 per query (GPT-4o-mini)

## 🎯 Use Cases

### For Small Businesses
- Track inventory across multiple store locations
- Monitor stock levels and get low stock alerts
- Manage supplier receipts and customer deliveries
- Perform physical inventory counts

### For Warehouses
- Multi-location inventory management
- Inter-warehouse transfers
- Real-time stock movement tracking
- Capacity planning and optimization

### For Retail Chains
- Centralized inventory control
- Category-wise stock analysis
- Automated reorder point notifications
- Historical movement analysis

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Ojas Neve**
- GitHub: [@Ojas37](https://github.com/Ojas37)
- Repository: [Stock-Master](https://github.com/Ojas37/Stock-Master)

## 🙏 Acknowledgments

- Built for hackathon demonstration
- Powered by OpenRouter AI
- Icons by Lucide React
- UI components with Tailwind CSS

## 📞 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

---

**⭐ If you find this project helpful, please give it a star on GitHub!**
