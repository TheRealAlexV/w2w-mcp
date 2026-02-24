# When2Work MCP Server

A Model Context Protocol (MCP) server that provides integration with the When2Work scheduling API. This server exposes When2Work data as MCP tools, allowing AI assistants to query employee schedules, shifts, time off, and reports.

## Features

- **Employee Management**: List all employees with contact information
- **Position Management**: List all positions/job roles
- **Category Management**: List all shift categories
- **Shift Queries**: Get assigned shifts with date range support and automatic pagination
- **Time Off Tracking**: Get approved time off requests
- **Daily Reports**: Get daily schedule totals and position breakdowns
- **Automatic Pagination**: Handles When2Work's 31-day limit by chunking requests automatically
- **Type Safety**: Full TypeScript support with proper type definitions

## Prerequisites

- Node.js 18 or higher
- When2Work Pro Plan with API access
- When2Work API key

## Installation

### 1. Clone or create the project

```bash
cd /home/dvac_workspace/DVAC/dvac-w2w-mcp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the project

```bash
npm run build
```

### 4. Set up environment variables

```bash
export W2W_API_KEY=your_api_key_here
```

To make this permanent, add it to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
echo 'export W2W_API_KEY=your_api_key_here' >> ~/.bashrc
source ~/.bashrc
```

## Usage

### Running the server

```bash
npm start
```

Or directly:

```bash
node dist/index.js
```

For development with auto-rebuild:

```bash
npm run dev
```

### Using with Claude Desktop

Add this server to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "when2work": {
      "command": "node",
      "args": ["/home/dvac_workspace/DVAC/dvac-w2w-mcp/dist/index.js"],
      "env": {
        "W2W_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### `w2w_get_employees`

Get all employees from When2Work.

**Parameters**: None

**Example**:
```json
{
  "name": "w2w_get_employees",
  "arguments": {}
}
```

### `w2w_get_positions`

Get all positions from When2Work.

**Parameters**: None

**Example**:
```json
{
  "name": "w2w_get_positions",
  "arguments": {}
}
```

### `w2w_get_categories`

Get all shift categories from When2Work.

**Parameters**: None

**Example**:
```json
{
  "name": "w2w_get_categories",
  "arguments": {}
}
```

### `w2w_get_shifts`

Get assigned shifts for a date range. Automatically handles pagination for ranges over 31 days.

**Parameters**:
- `start_date` (string, required): Start date in mm/dd/yyyy format (e.g., "01/15/2024")
- `end_date` (string, required): End date in mm/dd/yyyy format (e.g., "01/31/2024")
- `position_id` (string, optional): Filter by position ID

**Example**:
```json
{
  "name": "w2w_get_shifts",
  "arguments": {
    "start_date": "01/01/2024",
    "end_date": "01/31/2024",
    "position_id": "12345"
  }
}
```

### `w2w_get_timeoff`

Get approved time off for a date range. Automatically handles pagination for ranges over 31 days.

**Parameters**:
- `start_date` (string, required): Start date in mm/dd/yyyy format
- `end_date` (string, required): End date in mm/dd/yyyy format

**Example**:
```json
{
  "name": "w2w_get_timeoff",
  "arguments": {
    "start_date": "01/01/2024",
    "end_date": "01/31/2024"
  }
}
```

### `w2w_get_daily_totals`

Get daily schedule totals (shifts and hours) for a date range. Automatically handles pagination for ranges over 31 days.

**Parameters**:
- `start_date` (string, required): Start date in mm/dd/yyyy format
- `end_date` (string, required): End date in mm/dd/yyyy format

**Example**:
```json
{
  "name": "w2w_get_daily_totals",
  "arguments": {
    "start_date": "01/01/2024",
    "end_date": "01/31/2024"
  }
}
```

### `w2w_get_daily_position_totals`

Get daily schedule totals broken down by position for a date range. Automatically handles pagination for ranges over 31 days.

**Parameters**:
- `start_date` (string, required): Start date in mm/dd/yyyy format
- `end_date` (string, required): End date in mm/dd/yyyy format

**Example**:
```json
{
  "name": "w2w_get_daily_position_totals",
  "arguments": {
    "start_date": "01/01/2024",
    "end_date": "01/31/2024"
  }
}
```

## API Details

### When2Work API Constraints

- **Date Format**: All dates must be in mm/dd/yyyy format (not ISO 8601)
- **Date Range Limit**: Maximum 31 days per query (this server handles pagination automatically)
- **Authentication**: Bearer token via Authorization header
- **Plan Requirement**: Pro Plan required for API access

### Automatic Pagination

The server automatically handles When2Work's 31-day limit by:
1. Splitting date ranges > 31 days into chunks
2. Making multiple API requests in parallel
3. Merging results into a single response

This allows you to query any date range without worrying about the limit.

## Development

### Project Structure

```
dvac-w2w-mcp/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── w2w-client.ts         # When2Work API client
│   ├── tools/                # MCP tool implementations
│   │   ├── employees.ts
│   │   ├── positions.ts
│   │   ├── categories.ts
│   │   ├── shifts.ts
│   │   ├── timeoff.ts
│   │   └── reports.ts
│   └── types/
│       └── w2w.ts            # TypeScript interfaces
```

### Adding New Tools

1. Create a new file in `src/tools/`
2. Define the tool schema and handler function
3. Export both from the file
4. Import and register in `src/index.ts`

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Error: "W2W_API_KEY environment variable is required"

Make sure you've set the `W2W_API_KEY` environment variable:

```bash
export W2W_API_KEY=your_api_key_here
```

### Error: "When2Work API error (401)"

Your API key may be invalid or expired. Verify your API key in your When2Work account settings.

### Error: "Invalid date format"

Make sure dates are in mm/dd/yyyy format (e.g., "01/15/2024"), not ISO 8601 format.

### Error: "When2Work API error (429)"

You're being rate limited. The server automatically handles most rate limiting through pagination, but very large queries may still hit limits. Try reducing your date range.

## License

MIT

## Support

For issues related to this MCP server, please check:
1. Your When2Work Pro Plan subscription status
2. Your API key validity
3. The date format (must be mm/dd/yyyy)

For When2Work API documentation, visit: https://www.when2work.com/
