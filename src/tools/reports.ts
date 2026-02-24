import type { When2WorkClient } from '../w2w-client.js';

interface TextContent {
  type: 'text';
  text: string;
}

export const dailyTotalsToolSchema = {
  name: 'w2w_get_daily_totals',
  description: 'Get daily schedule totals from When2Work for a date range. Shows assigned shifts and hours per day. Supports automatic pagination for ranges over 31 days.',
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

export const dailyPositionTotalsToolSchema = {
  name: 'w2w_get_daily_position_totals',
  description: 'Get daily schedule totals by position from When2Work for a date range. Shows assigned shifts and hours per day, broken down by position. Supports automatic pagination for ranges over 31 days.',
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

export async function handleGetDailyTotals(
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

  const response = await client.getDailyTotals(args.start_date, args.end_date);

  if (!response.dailyTotals || response.dailyTotals.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `No daily totals found for the date range ${args.start_date} to ${args.end_date}.`,
        },
      ],
    };
  }

  // Sort by date
  const sortedTotals = response.dailyTotals.sort((a, b) => {
    return new Date(a.SCHEDULE_DATE).getTime() - new Date(b.SCHEDULE_DATE).getTime();
  });

  let totalShifts = 0;
  let totalHours = 0;

  const totalsFormatted = sortedTotals
    .map((day) => {
      const shifts = parseInt(day.ASSIGNED_SHIFTS || '0', 10);
      const hours = parseFloat(day.ASSIGNED_HOURS || '0');
      totalShifts += shifts;
      totalHours += hours;

      return `- ${day.SCHEDULE_DATE}: ${shifts} shifts, ${hours.toFixed(2)} hours`;
    })
    .join('\n');

  const summary = `\n## Summary\nTotal: ${totalShifts} shifts, ${totalHours.toFixed(2)} hours\nAverage: ${(totalHours / sortedTotals.length).toFixed(2)} hours/day`;

  return {
    content: [
      {
        type: 'text',
        text: `Daily totals from ${args.start_date} to ${args.end_date}:\n\n${totalsFormatted}${summary}`,
      },
    ],
  };
}

export async function handleGetDailyPositionTotals(
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

  const response = await client.getDailyPositionTotals(args.start_date, args.end_date);

  if (!response.dailyPositionTotals || response.dailyPositionTotals.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `No daily position totals found for the date range ${args.start_date} to ${args.end_date}.`,
        },
      ],
    };
  }

  // Group by date
  const totalsByDate = new Map<string, typeof response.dailyPositionTotals>();
  
  for (const total of response.dailyPositionTotals) {
    const date = total.SCHEDULE_DATE;
    if (!totalsByDate.has(date)) {
      totalsByDate.set(date, []);
    }
    totalsByDate.get(date)!.push(total);
  }

  // Sort dates
  const sortedDates = Array.from(totalsByDate.keys()).sort();

  let output = `Daily position totals from ${args.start_date} to ${args.end_date}:\n\n`;

  // Calculate position summaries
  const positionSummary = new Map<string, { shifts: number; hours: number }>();

  for (const date of sortedDates) {
    const totals = totalsByDate.get(date)!;
    output += `## ${date}\n`;
    
    for (const total of totals) {
      const shifts = parseInt(total.ASSIGNED_SHIFTS || '0', 10);
      const hours = parseFloat(total.ASSIGNED_HOURS || '0');
      
      // Update position summary
      const posName = total.POSITION_NAME;
      const current = positionSummary.get(posName) || { shifts: 0, hours: 0 };
      current.shifts += shifts;
      current.hours += hours;
      positionSummary.set(posName, current);

      output += `- ${posName}: ${shifts} shifts, ${hours.toFixed(2)} hours\n`;
    }
    output += '\n';
  }

  // Add position summary
  output += '## Position Summary\n';
  for (const [posName, totals] of positionSummary) {
    output += `- ${posName}: ${totals.shifts} shifts, ${totals.hours.toFixed(2)} hours\n`;
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
