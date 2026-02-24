import type { When2WorkClient } from '../w2w-client.js';

interface TextContent {
  type: 'text';
  text: string;
}

export const positionsToolSchema = {
  name: 'w2w_get_positions',
  description: 'Get all positions from When2Work',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
};

export async function handleGetPositions(
  client: When2WorkClient
): Promise<{ content: TextContent[] }> {
  const response = await client.getPositions();

  if (!response.positions || response.positions.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: 'No positions found.',
        },
      ],
    };
  }

  const positionsFormatted = response.positions
    .map(
      (pos) =>
        `- ${pos.POSITION_NAME} (ID: ${pos.POSITION_ID})` +
        `${pos.POSITION_CODE ? ` - Code: ${pos.POSITION_CODE}` : ''}` +
        `${pos.ACTIVE === '0' ? ' [INACTIVE]' : ''}`
    )
    .join('\n');

  return {
    content: [
      {
        type: 'text',
        text: `Found ${response.positions.length} positions:\n\n${positionsFormatted}`,
      },
    ],
  };
}
