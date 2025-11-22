'use client';

import { DashboardLayout } from '@/src/components/DashboardLayout';
import { AIChatAssistant } from '@/components/AIChatAssistant';
import { Bot, Sparkles, Zap, TrendingUp } from 'lucide-react';

export default function AIChatPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="w-8 h-8 text-purple-600" />
            AI Inventory Assistant
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Ask questions about your inventory in natural language. Get instant insights powered by AI.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Natural Language</h3>
            </div>
            <p className="text-sm text-gray-700">
              Ask questions in plain English. No need to write complex queries.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Instant Insights</h3>
            </div>
            <p className="text-sm text-gray-700">
              Get real-time answers from your inventory database instantly.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Smart Forecasting</h3>
            </div>
            <p className="text-sm text-gray-700">
              Ask about future trends and get AI-powered predictions.
            </p>
          </div>
        </div>

        {/* Chat Component */}
        <AIChatAssistant />

        {/* Help Section */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">What can I ask?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <p className="text-sm text-gray-700">"How many Dell XPS laptops do we have in Main Warehouse?"</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <p className="text-sm text-gray-700">"Show me all products with low stock"</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <p className="text-sm text-gray-700">"What was the stock movement for HP Printers last week?"</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <p className="text-sm text-gray-700">"Predict stock levels for next month"</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
