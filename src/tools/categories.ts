import type { When2WorkClient } from '../w2w-client.js';

interface TextContent {
  type: 'text';
  text: string;
}

export const categoriesToolSchema = {
  name: 'w2w_get_categories',
  description: 'Get all shift categories from When2Work',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
};

export async function handleGetCategories(
  client: When2WorkClient
): Promise<{ content: TextContent[] }> {
  const response = await client.getCategories();

  if (!response.categories || response.categories.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: 'No categories found.',
        },
      ],
    };
  }

  const categoriesFormatted = response.categories
    .map(
      (cat) =>
        `- ${cat.CATEGORY_NAME} (ID: ${cat.CATEGORY_ID})` +
        `${cat.ACTIVE === '0' ? ' [INACTIVE]' : ''}`
    )
    .join('\n');

  return {
    content: [
      {
        type: 'text',
        text: `Found ${response.categories.length} categories:\n\n${categoriesFormatted}`,
      },
    ],
  };
}
