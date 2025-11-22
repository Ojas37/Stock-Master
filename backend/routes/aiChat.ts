import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { interpretIntent, generateSQL, formatAnswer } from '../services/aiChat';

const router = Router();
router.use(authenticateToken);

/**
 * POST /api/ai-chat
 * Main endpoint for AI chat assistant
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a string'
      });
    }

    console.log('🤖 AI Chat Query:', message);

    // Step 1: Interpret user intent using LLM
    const intentData = await interpretIntent(message);
    console.log('📊 Interpreted Intent:', intentData);

    if (intentData.intent === 'UNKNOWN') {
      return res.json({
        success: true,
        reply: "I'm sorry, I didn't quite understand that. I can help you with:\n" +
               "• Checking stock levels\n" +
               "• Finding low stock items\n" +
               "• Viewing movement history\n" +
               "• Forecasting future stock\n\n" +
               "Try asking something like 'How many Dell XPS do we have?' or 'Show me low stock items.'"
      });
    }

    // Step 2: Generate SQL query based on intent
    const { query: sqlQuery, params } = generateSQL(intentData);
    console.log('🔍 SQL Query:', sqlQuery, params);

    // Step 3: Execute SQL query
    const result = await query(sqlQuery, params);
    console.log('💾 Query Result:', result.rows);

    // Step 4: Format answer using LLM
    const formattedReply = await formatAnswer(message, result.rows, intentData.intent);
    console.log('💬 Final Reply:', formattedReply);

    // Step 5: Return response
    res.json({
      success: true,
      reply: formattedReply,
      metadata: {
        intent: intentData.intent,
        rowsReturned: result.rows.length
      }
    });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat request',
      details: error.message
    });
  }
});

/**
 * GET /api/ai-chat/suggestions
 * Returns suggested queries for users
 */
router.get('/suggestions', async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    suggestions: [
      "How many Dell XPS 15 laptops do we have?",
      "Show me all low stock items",
      "What was the movement for HP Printers last week?",
      "Predict stock levels for next month",
      "How much stock is in Main Warehouse?",
      "Show recent transfers between warehouses"
    ]
  });
});

export default router;
