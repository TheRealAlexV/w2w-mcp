import type { When2WorkClient } from '../w2w-client.js';

interface TextContent {
  type: 'text';
  text: string;
}

export const employeesToolSchema = {
  name: 'w2w_get_employees',
  description: 'Get all employees from When2Work',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
};

export async function handleGetEmployees(
  client: When2WorkClient
): Promise<{ content: TextContent[] }> {
  const response = await client.getEmployees();

  if (!response.employees || response.employees.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: 'No employees found.',
        },
      ],
    };
  }

  const employeesFormatted = response.employees
    .map(
      (emp) =>
        `- ${emp.FIRST_NAME} ${emp.LAST_NAME} (ID: ${emp.W2W_EMPLOYEE_ID})` +
        `${emp.EMAILS ? ` - Email: ${emp.EMAILS}` : ''}` +
        `${emp.PHONE ? ` - Phone: ${emp.PHONE}` : ''}` +
        `${emp.ACTIVE === '0' ? ' [INACTIVE]' : ''}`
    )
    .join('\n');

  return {
    content: [
      {
        type: 'text',
        text: `Found ${response.employees.length} employees:\n\n${employeesFormatted}`,
      },
    ],
  };
}
