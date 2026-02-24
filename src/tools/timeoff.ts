import type { When2WorkClient } from '../w2w-client.js';

interface TextContent {
  type: 'text';
  text: string;
}

export const timeoffToolSchema = {
  name: 'w2w_get_timeoff',
  description: 'Get approved time off from When2Work for a date range. Supports automatic pagination for ranges over 31 days.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      start_date: {
        type: 'string',
        description: 'Start date in mm/dd/yyyy format (e.g., 01/15/2024)',
      },
      end_date: {
        type: 'string',
        description: 'End date in mm/dd/yyyy format (e.g., 01/31/2024)',
      },
    },
    required: ['start_date', 'end_date'],
  },
};

function validateDateFormat(dateStr: string): boolean {
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
  return regex.test(dateStr);
}

export async function handleGetTimeOff(
  client: When2WorkClient,
  args: { start_date: string; end_date: string }
): Promise<{ content: TextContent[] }> {
  // Validate date formats
  if (!validateDateFormat(args.start_date)) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: Invalid start_date format. Expected mm/dd/yyyy (e.g., 01/15/2024)`,
        },
      ],
    };
  }

  if (!validateDateFormat(args.end_date)) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: Invalid end_date format. Expected mm/dd/yyyy (e.g., 01/31/2024)`,
        },
      ],
    };
  }

  const response = await client.getTimeOff(args.start_date, args.end_date);

  if (!response.timeoff || response.timeoff.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `No approved time off found for the date range ${args.start_date} to ${args.end_date}.`,
        },
      ],
    };
  }

  // Sort time off by start date
  const sortedTimeOff = response.timeoff.sort((a, b) => {
    return new Date(a.START_DATE).getTime() - new Date(b.START_DATE).getTime();
  });

  const timeoffFormatted = sortedTimeOff
    .map((to) => {
      let line = `- ${to.EMPLOYEE_NAME || `Employee ${to.W2W_EMPLOYEE_ID}`}`;
      
      if (to.START_DATE === to.END_DATE) {
        line += ` | ${to.START_DATE}`;
      } else {
        line += ` | ${to.START_DATE} to ${to.END_DATE}`;
      }

      if (to.PARTIAL_DAY === '1' && to.START_TIME && to.END_TIME) {
        line += ` | ${to.START_TIME} - ${to.END_TIME}`;
      }

      if (to.DESCRIPTION) {
        line += ` | ${to.DESCRIPTION}`;
      }

      return line;
    })
    .join('\n');

  return {
    content: [
      {
        type: 'text',
        text: `Found ${response.timeoff.length} approved time off entries from ${args.start_date} to ${args.end_date}:\n\n${timeoffFormatted}`,
      },
    ],
  };
}
