# When2Work MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Protocol-orange.svg)](https://modelcontextprotocol.io/)

> A Model Context Protocol (MCP) server that provides seamless integration with the [When2Work](https://www.when2work.com/) scheduling API. This server exposes When2Work data as MCP tools, allowing AI assistants like Claude to query employee schedules, shifts, time off, and reports.

---

## 💚 Support Our Mission

**This tool was built for Dumont Volunteer Ambulance Corps**, a member-owned non-profit volunteer ambulance service. If you find this tool useful, please consider supporting our life-saving work:

[![Donate](https://img.shields.io/badge/❤️_Donate-Dumont_Ambulance-red?style=for-the-badge)](https://www.dumontambulance.org/fundraising/)

Your donation helps us continue providing emergency medical services to those in need!

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 👥 **Employee Management** | List all employees with contact information |
| 🎯 **Position Management** | List all positions/job roles |
| 🏷️ **Category Management** | List all shift categories |
| 📅 **Shift Queries** | Get assigned shifts with date range support and automatic pagination |
| 🏖️ **Time Off Tracking** | Get approved time off requests |
| 📊 **Daily Reports** | Get daily schedule totals and position breakdowns |
| 🔄 **Automatic Pagination** | Handles When2Work's 31-day limit by chunking requests automatically |
| 🔒 **Type Safety** | Full TypeScript support with proper type definitions |

## ✅ Testing Status

All 7 tools have been tested and verified working:

| Tool | Status | Description |
|------|:------:|-------------|
| `w2w_get_employees` | ✅ Tested | Retrieve all employees with contact info |
| `w2w_get_positions` | ✅ Tested | Retrieve all positions/job roles |
| `w2w_get_categories` | ✅ Tested | Retrieve all shift categories |
| `w2w_get_shifts` | ✅ Tested | Get assigned shifts with date range support |
| `w2w_get_timeoff` | ✅ Tested | Get approved time off requests |
| `w2w_get_daily_totals` | ✅ Tested | Get daily schedule totals |
| `w2w_get_daily_position_totals` | ✅ Tested | Get daily totals by position |

## 📋 Prerequisites

- Node.js 18 or higher
- When2Work Pro Plan with API access
- When2Work API key

## 🚀 Installation

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

## 💻 Usage

### ▶️ Running the server

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

### 🤖 Using with Claude Desktop

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

## 🛠️ Available Tools

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

## 🔌 API Details

### When2Work API Endpoint

**Base URL**: `https://www8.whentowork.com/cgi-bin/w2wJ.dll`

Note: This is the correct production endpoint for the When2Work API, not `https://api.when2work.com`.

### Authentication

The When2Work API uses **query parameter authentication**:
- API key is passed as a `key` query parameter
- No Authorization header is used

Example request URL:
```
https://www8.whentowork.com/cgi-bin/w2wJ.dll/api/employees?key=YOUR_API_KEY&detail=Y
```

### When2Work API Constraints

- **Date Format**: All dates must be in mm/dd/yyyy format (not ISO 8601)
- **Date Range Limit**: Maximum 31 days per query (this server handles pagination automatically)
- **Plan Requirement**: Pro Plan required for API access

### Response Format

The When2Work API returns data in specific keys depending on the endpoint:

| Endpoint | Response Key |
|----------|--------------|
| Employees | `EmployeeList` |
| Positions | `PositionList` |
| Categories | `CategoryList` |
| Shifts | `AssignedShiftList` |
| Time Off | `ApprovedTimeOff` |
| Daily Totals | `DailyTotals` |
| Daily Position Totals | `DailyPositionTotals` |

The MCP server normalizes these responses into consistent arrays for easier consumption.

### Automatic Pagination

The server automatically handles When2Work's 31-day limit by:
1. Splitting date ranges > 31 days into chunks
2. Making multiple API requests in parallel
3. Merging results into a single response

This allows you to query any date range without worrying about the limit.

## 👨‍💻 Development

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

## 🐛 Troubleshooting

### Error: "W2W_API_KEY environment variable is required"

Make sure you've set the `W2W_API_KEY` environment variable:

```bash
export W2W_API_KEY=your_api_key_here
```

### Error: "When2Work API error (401)"

Your API key may be invalid or expired. Verify your API key in your When2Work account settings:
1. Log in to your When2Work account
2. Go to **Settings** > **Company Settings** > **Integrations**
3. Check or regenerate your API key

### Error: "Invalid date format"

Make sure dates are in mm/dd/yyyy format (e.g., "01/15/2024"), not ISO 8601 format.

### Error: "When2Work API error (429)"

You're being rate limited. The server automatically handles most rate limiting through pagination, but very large queries may still hit limits. Try reducing your date range.

### Empty Results

If tools return empty arrays, check:
- The date range contains data in your When2Work account
- Your API key has access to the requested data
- The position/category filters (if used) match existing records

### Connection Issues

If you see connection errors:
- Verify your internet connection
- Check that `https://www8.whentowork.com` is accessible
- Ensure no firewall is blocking the connection

## 🧪 Testing

To verify the server is working correctly:

1. Start the server:
   ```bash
   npm start
   ```

2. Test with Claude Desktop or any MCP client:
   - Try `w2w_get_employees` first (no parameters needed)
   - Then test date-based tools with a small date range
   - Verify pagination by querying a 60+ day range

All tools have been verified to work with real When2Work API calls.

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2024 Dumont Volunteer Ambulance Corps

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 🆘 Support

For issues related to this MCP server, please check:
1. ✅ Your When2Work Pro Plan subscription status
2. ✅ Your API key validity
3. ✅ The date format (must be mm/dd/yyyy)
4. ✅ The API endpoint URL is correct: `https://www8.whentowork.com/cgi-bin/w2wJ.dll`
5. Finally, if you're still having an issue please submit an issue here on github.

### 🔑 Getting Your API Key

1. Log in to your When2Work account as a Tech Administrator
2. Navigate to **Pro** > **API Config**
3. Copy your API key (or generate a new one if needed)

### 📚 When2Work Resources

- [When2Work Help Center](https://www.when2work.com/help/)
- [API Documentation](https://www.when2work.com/help/api/) (requires Pro Plan)

---

## 🙏 Acknowledgments

Built with ❤️ by [Dumont Volunteer Ambulance Corps](https://www.dumontambulance.org/)

If this tool has been helpful to your organization, please consider [making a donation](https://www.dumontambulance.org/fundraising/) to support our volunteer emergency services.
