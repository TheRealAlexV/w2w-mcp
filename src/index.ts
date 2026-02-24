#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { When2WorkClient } from './w2w-client.js';

// Import tool schemas and handlers
import { employeesToolSchema, handleGetEmployees } from './tools/employees.js';
import { positionsToolSchema, handleGetPositions } from './tools/positions.js';
import { categoriesToolSchema, handleGetCategories } from './tools/categories.js';
import { shiftsToolSchema, handleGetShifts } from './tools/shifts.js';
import { timeoffToolSchema, handleGetTimeOff } from './tools/timeoff.js';
import {
  dailyTotalsToolSchema,
  dailyPositionTotalsToolSchema,
  handleGetDailyTotals,
  handleGetDailyPositionTotals,
} from './tools/reports.js';

// Get API key from environment
const apiKey = process.env.W2W_API_KEY;

if (!apiKey) {
  console.error('Error: W2W_API_KEY environment variable is required');
  console.error('Please set your When2Work API key:');
  console.error('  export W2W_API_KEY=your_api_key_here');
  process.exit(1);
}

// Initialize the When2Work client
const w2wClient = new When2WorkClient({ apiKey });

// Define all available tools
const tools = [
  employeesToolSchema,
  positionsToolSchema,
  categoriesToolSchema,
  shiftsToolSchema,
  timeoffToolSchema,
  dailyTotalsToolSchema,
  dailyPositionTotalsToolSchema,
];

// Create the MCP server
const server = new Server(
  {
    name: 'dvac-w2w-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'w2w_get_employees':
        return await handleGetEmployees(w2wClient);

      case 'w2w_get_positions':
        return await handleGetPositions(w2wClient);

      case 'w2w_get_categories':
        return await handleGetCategories(w2wClient);

      case 'w2w_get_shifts':
        if (!args || typeof args !== 'object') {
          throw new Error('Arguments required for w2w_get_shifts');
        }
        return await handleGetShifts(w2wClient, args as { start_date: string; end_date: string; position_id?: string });

      case 'w2w_get_timeoff':
        if (!args || typeof args !== 'object') {
          throw new Error('Arguments required for w2w_get_timeoff');
        }
        return await handleGetTimeOff(w2wClient, args as { start_date: string; end_date: string });

      case 'w2w_get_daily_totals':
        if (!args || typeof args !== 'object') {
          throw new Error('Arguments required for w2w_get_daily_totals');
        }
        return await handleGetDailyTotals(w2wClient, args as { start_date: string; end_date: string });

      case 'w2w_get_daily_position_totals':
        if (!args || typeof args !== 'object') {
          throw new Error('Arguments required for w2w_get_daily_position_totals');
        }
        return await handleGetDailyPositionTotals(w2wClient, args as { start_date: string; end_date: string });

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  
  console.error('When2Work MCP Server starting...');
  console.error('Available tools:');
  for (const tool of tools) {
    console.error(`  - ${tool.name}`);
  }
  
  await server.connect(transport);
  console.error('When2Work MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
