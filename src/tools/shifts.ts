import type { When2WorkClient } from '../w2w-client.js';

interface TextContent {
  type: 'text';
  text: string;
}

export const shiftsToolSchema = {
  name: 'w2w_get_shifts',
  description: 'Get assigned shifts from When2Work for a date range. Supports automatic pagination for ranges over 31 days.',
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
      position_id: {
        type: 'string',
        description: 'Optional: Filter by position ID',
      },
    },
    required: ['start_date', 'end_date'],
  },
};

function validateDateFormat(dateStr: string): boolean {
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
  return regex.test(dateStr);
}

export async function handleGetShifts(
  client: When2WorkClient,
  args: { start_date: string; end_date: string; position_id?: string }
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

  const response = await client.getShifts(
    args.start_date,
    args.end_date,
    args.position_id
  );

  if (!response.shifts || response.shifts.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `No shifts found for the date range ${args.start_date} to ${args.end_date}.`,
        },
      ],
    };
  }

  // Group shifts by date for better readability
  const shiftsByDate = new Map<string, typeof response.shifts>();
  
  for (const shift of response.shifts) {
    const date = shift.START_DATE;
    if (!shiftsByDate.has(date)) {
      shiftsByDate.set(date, []);
    }
    shiftsByDate.get(date)!.push(shift);
  }

  // Sort dates
  const sortedDates = Array.from(shiftsByDate.keys()).sort();

  let output = `Found ${response.shifts.length} shifts from ${args.start_date} to ${args.end_date}:\n\n`;
  
  // Debug: Log first shift to diagnose missing employee names
  if (response.shifts.length > 0) {
    const firstShift = response.shifts[0];
    console.error('DEBUG - First shift raw data:', JSON.stringify(firstShift, null, 2));
  }

  for (const date of sortedDates) {
    const shifts = shiftsByDate.get(date)!;
    output += `## ${date}\n`;
    
    for (const shift of shifts) {
      output += `- ${shift.START_TIME} - ${shift.END_TIME}`;
      
      // Build employee name from FIRST_NAME and LAST_NAME (API returns these separately)
      const firstName = shift.FIRST_NAME || '';
      const lastName = shift.LAST_NAME || '';
      const empName = `${firstName} ${lastName}`.trim();
      
      if (empName) {
        output += ` | ${empName}`;
      }
      if (shift.POSITION_NAME) {
        output += ` | ${shift.POSITION_NAME}`;
      }
      if (shift.CATEGORY_NAME) {
        output += ` | ${shift.CATEGORY_NAME}`;
      }
      output += '\n';
    }
    output += '\n';
  }

  return {
    content: [
      {
        type: 'text',
        text: output,
      },
    ],
  };
}
