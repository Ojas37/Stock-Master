import axios from 'axios';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Function to get API key (reads at runtime, not at module load time)
function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY || '';
  if (!key) {
    console.error('❌ OPENROUTER_API_KEY not found in environment variables');
  }
  return key;
}

interface IntentResult {
  intent: 'GET_STOCK' | 'LOW_STOCK' | 'MOVE_HISTORY' | 'FORECAST' | 'UNKNOWN';
  product: string | null;
  warehouse: string | null;
  time_range: string | null;
  extra: Record<string, any>;
}

/**
 * Call OpenRouter LLM to interpret user intent
 */
export async function interpretIntent(userMessage: string): Promise<IntentResult> {
  const systemPrompt = `You are an AI Inventory Assistant for a warehouse system.
Understand the user query and extract these fields as JSON:

{
  "intent": "...",
  "product": "...",
  "warehouse": "...",
  "time_range": "...",
  "extra": {}
}

Valid intents:
- GET_STOCK (check current stock of a product)
- LOW_STOCK (show items below reorder level)
- MOVE_HISTORY (show stock movements/transactions)
- FORECAST (predict future stock)
- UNKNOWN (if you cannot determine intent)

If a value is not found in the query, set it to null.
Return ONLY the JSON object, no explanations.`;

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User query: ${userMessage}` }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${getApiKey()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://stockmaster.local',
          'X-Title': 'StockMaster IMS'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    // Extract JSON from response (handle if wrapped in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const intentData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    
    return intentData;
  } catch (error: any) {
    console.error('Error interpreting intent:', error.response?.data || error.message);
    return {
      intent: 'UNKNOWN',
      product: null,
      warehouse: null,
      time_range: null,
      extra: {}
    };
  }
}

/**
 * Format SQL results into natural language using LLM
 */
export async function formatAnswer(
  userMessage: string,
  sqlResult: any,
  intent: string
): Promise<string> {
  const systemPrompt = `You are a friendly AI assistant for an inventory management system.
Convert the raw database results into a clear, conversational response.
Be concise, professional, and helpful.`;

  const userPrompt = `User asked: "${userMessage}"

Query intent: ${intent}
Database result: ${JSON.stringify(sqlResult, null, 2)}

Please provide a friendly, natural response that answers the user's question.
If the result is empty, politely inform them that no data was found.`;

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${getApiKey()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://stockmaster.local',
          'X-Title': 'StockMaster IMS'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error formatting answer:', error.response?.data || error.message);
    return 'I apologize, but I encountered an error while processing your request. Please try again.';
  }
}

/**
 * Generate SQL query based on intent
 */
export function generateSQL(intentData: IntentResult): { query: string; params: any[] } {
  const { intent, product, warehouse, time_range } = intentData;

  switch (intent) {
    case 'GET_STOCK': {
      if (product && warehouse) {
        return {
          query: `
            SELECT 
              p.name as product_name,
              p.sku,
              w.name as warehouse_name,
              COALESCE(SUM(CASE WHEN sm.movement_type = 'in' THEN sm.quantity ELSE -sm.quantity END), 0) as current_stock,
              p.reorder_point
            FROM products p
            LEFT JOIN stock_moves sm ON p.id = sm.product_id
            LEFT JOIN warehouses w ON sm.warehouse_id = w.id
            WHERE p.name LIKE ? AND w.name LIKE ?
            GROUP BY p.id, w.id
          `,
          params: [`%${product}%`, `%${warehouse}%`]
        };
      } else if (product) {
        return {
          query: `
            SELECT 
              p.name as product_name,
              p.sku,
              p.total_stock as current_stock,
              p.reorder_point
            FROM products p
            WHERE p.name LIKE ?
          `,
          params: [`%${product}%`]
        };
      }
      return {
        query: 'SELECT name, sku, total_stock, reorder_point FROM products LIMIT 10',
        params: []
      };
    }

    case 'LOW_STOCK': {
      return {
        query: `
          SELECT 
            name as product_name,
            sku,
            total_stock as current_stock,
            reorder_point,
            (reorder_point - total_stock) as shortage
          FROM products
          WHERE total_stock <= reorder_point AND status = 'active'
          ORDER BY shortage DESC
        `,
        params: []
      };
    }

    case 'MOVE_HISTORY': {
      let query = `
        SELECT 
          sm.id,
          p.name as product_name,
          sm.quantity,
          sm.movement_type,
          w.name as warehouse_name,
          sm.created_at as timestamp
        FROM stock_moves sm
        JOIN products p ON sm.product_id = p.id
        LEFT JOIN warehouses w ON sm.warehouse_id = w.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (product) {
        query += ' AND p.name LIKE ?';
        params.push(`%${product}%`);
      }

      if (time_range) {
        // Parse time range (e.g., "last week", "last month")
        if (time_range.includes('week')) {
          query += " AND sm.created_at >= datetime('now', '-7 days')";
        } else if (time_range.includes('month')) {
          query += " AND sm.created_at >= datetime('now', '-30 days')";
        }
      }

      query += ' ORDER BY sm.created_at DESC LIMIT 20';

      return { query, params };
    }

    case 'FORECAST': {
      // Simple forecast: calculate average movement over last 30 days
      return {
        query: `
          SELECT 
            p.name as product_name,
            p.total_stock as current_stock,
            COALESCE(SUM(CASE WHEN sm.movement_type = 'in' THEN sm.quantity ELSE 0 END), 0) as total_in,
            COALESCE(SUM(CASE WHEN sm.movement_type = 'out' THEN sm.quantity ELSE 0 END), 0) as total_out,
            COUNT(*) as transaction_count
          FROM products p
          LEFT JOIN stock_moves sm ON p.id = sm.product_id 
            AND sm.created_at >= datetime('now', '-30 days')
          WHERE p.status = 'active'
          ${product ? "AND p.name LIKE ?" : ""}
          GROUP BY p.id
          LIMIT 10
        `,
        params: product ? [`%${product}%`] : []
      };
    }

    default:
      return {
        query: 'SELECT COUNT(*) as total_products FROM products',
        params: []
      };
  }
}
