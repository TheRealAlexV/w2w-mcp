import type {
  EmployeeListResponse,
  PositionListResponse,
  CategoryListResponse,
  AssignedShiftListResponse,
  ApprovedTimeOffResponse,
  DailyTotalsResponse,
  DailyPositionTotalsResponse,
  W2WApiResponse,
  Shift,
  TimeOff,
  DailyTotal,
  DailyPositionTotal,
} from './types/w2w.js';

const W2W_BASE_URL = 'https://www8.whentowork.com/cgi-bin/w2wJ.dll';
const MAX_DATE_RANGE_DAYS = 31;

export interface W2WClientConfig {
  apiKey: string;
  baseUrl?: string;
}

export class When2WorkClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: W2WClientConfig) {
    if (!config.apiKey) {
      throw new Error('W2W_API_KEY is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || W2W_BASE_URL;
  }

  /**
   * Make an authenticated request to the When2Work API
   */
  private async request<T extends W2WApiResponse>(
    endpoint: string,
    params?: Record<string, string | undefined>
  ): Promise<T> {
    // Construct URL properly - avoid URL class issue with base URL paths
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = new URL(`${this.baseUrl}/${cleanEndpoint}`);
    
    // Add API key and detail parameter
    url.searchParams.append('key', this.apiKey);
    url.searchParams.append('detail', 'Y');
    
    // Add other query parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`When2Work API error (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json() as T;
    
    // Check for API-level errors
    if (data.status === 'error') {
      throw new Error(`When2Work API error: ${data.message || 'Unknown error'}`);
    }

    return data;
  }

  /**
   * Normalize API response to always return an array
   */
  private normalizeArrayResponse<T>(data: T | T[] | undefined): T[] {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  }

  /**
   * Parse date string (mm/dd/yyyy) to Date object
   */
  private parseDate(dateStr: string): Date {
    const [month, day, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Format Date object to When2Work date string (mm/dd/yyyy)
   */
  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  /**
   * Calculate the number of days between two dates
   */
  private daysBetween(startDate: string, endDate: string): number {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Split a date range into chunks of max 31 days
   */
  private splitDateRange(startDate: string, endDate: string): Array<{ start: string; end: string }> {
    const chunks: Array<{ start: string; end: string }> = [];
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    let currentStart = new Date(start);

    while (currentStart <= end) {
      let chunkEnd = new Date(currentStart);
      chunkEnd.setDate(chunkEnd.getDate() + MAX_DATE_RANGE_DAYS - 1);

      if (chunkEnd > end) {
        chunkEnd = new Date(end);
      }

      chunks.push({
        start: this.formatDate(currentStart),
        end: this.formatDate(chunkEnd),
      });

      currentStart = new Date(chunkEnd);
      currentStart.setDate(currentStart.getDate() + 1);
    }

    return chunks;
  }

  /**
   * Get all employees
   */
  async getEmployees(): Promise<EmployeeListResponse> {
    const response = await this.request<EmployeeListResponse>('/api/EmployeeList');
    return {
      ...response,
      employees: this.normalizeArrayResponse(response.EmployeeList),
    };
  }

  /**
   * Get all positions
   */
  async getPositions(): Promise<PositionListResponse> {
    const response = await this.request<PositionListResponse>('/api/PositionList');
    return {
      ...response,
      positions: this.normalizeArrayResponse(response.PositionList),
    };
  }

  /**
   * Get all shift categories
   */
  async getCategories(): Promise<CategoryListResponse> {
    const response = await this.request<CategoryListResponse>('/api/CategoryList');
    return {
      ...response,
      categories: this.normalizeArrayResponse(response.CategoryList),
    };
  }

  /**
   * Get assigned shifts for a date range
   * Automatically handles pagination for ranges > 31 days
   */
  async getShifts(
    startDate: string,
    endDate: string,
    positionId?: string
  ): Promise<AssignedShiftListResponse> {
    const days = this.daysBetween(startDate, endDate);
    
    if (days <= MAX_DATE_RANGE_DAYS) {
      const response = await this.request<AssignedShiftListResponse>('/api/AssignedShiftList', {
        start_date: startDate,
        end_date: endDate,
        position_id: positionId,
      });
      return {
        ...response,
        shifts: this.normalizeArrayResponse(response.AssignedShiftList),
      };
    }

    // Handle pagination for large date ranges
    const chunks = this.splitDateRange(startDate, endDate);
    const allShifts: Shift[] = [];

    for (const chunk of chunks) {
      const response = await this.request<AssignedShiftListResponse>('/api/AssignedShiftList', {
        start_date: chunk.start,
        end_date: chunk.end,
        position_id: positionId,
      });
      
      const shifts = this.normalizeArrayResponse(response.AssignedShiftList);
      allShifts.push(...shifts);
    }

    return {
      status: 'success',
      shifts: allShifts,
    };
  }

  /**
   * Get approved time off for a date range
   * Automatically handles pagination for ranges > 31 days
   */
  async getTimeOff(startDate: string, endDate: string): Promise<ApprovedTimeOffResponse> {
    const days = this.daysBetween(startDate, endDate);
    
    if (days <= MAX_DATE_RANGE_DAYS) {
      const response = await this.request<ApprovedTimeOffResponse>('/api/ApprovedTimeOff', {
        start_date: startDate,
        end_date: endDate,
      });
      return {
        ...response,
        timeoff: this.normalizeArrayResponse(response.ApprovedTimeOff),
      };
    }

    // Handle pagination for large date ranges
    const chunks = this.splitDateRange(startDate, endDate);
    const allTimeOff: TimeOff[] = [];

    for (const chunk of chunks) {
      const response = await this.request<ApprovedTimeOffResponse>('/api/ApprovedTimeOff', {
        start_date: chunk.start,
        end_date: chunk.end,
      });
      
      const timeoff = this.normalizeArrayResponse(response.ApprovedTimeOff);
      allTimeOff.push(...timeoff);
    }

    return {
      status: 'success',
      timeoff: allTimeOff,
    };
  }

  /**
   * Get daily totals for a date range
   * Automatically handles pagination for ranges > 31 days
   */
  async getDailyTotals(startDate: string, endDate: string): Promise<DailyTotalsResponse> {
    const days = this.daysBetween(startDate, endDate);
    
    if (days <= MAX_DATE_RANGE_DAYS) {
      const response = await this.request<DailyTotalsResponse>('/api/DailyTotals', {
        start_date: startDate,
        end_date: endDate,
      });
      return {
        ...response,
        dailyTotals: this.normalizeArrayResponse(response.ApprovedTimeOff),
      };
    }

    // Handle pagination for large date ranges
    const chunks = this.splitDateRange(startDate, endDate);
    const allDays: DailyTotal[] = [];

    for (const chunk of chunks) {
      const response = await this.request<DailyTotalsResponse>('/api/DailyTotals', {
        start_date: chunk.start,
        end_date: chunk.end,
      });
      
      const days = this.normalizeArrayResponse(response.ApprovedTimeOff);
      allDays.push(...days);
    }

    return {
      status: 'success',
      dailyTotals: allDays,
    };
  }

  /**
   * Get daily position totals for a date range
   * Automatically handles pagination for ranges > 31 days
   */
  async getDailyPositionTotals(
    startDate: string,
    endDate: string
  ): Promise<DailyPositionTotalsResponse> {
    const days = this.daysBetween(startDate, endDate);
    
    if (days <= MAX_DATE_RANGE_DAYS) {
      const response = await this.request<DailyPositionTotalsResponse>('/api/DailyPositionTotals', {
        start_date: startDate,
        end_date: endDate,
      });
      return {
        ...response,
        dailyPositionTotals: this.normalizeArrayResponse(response.DailyPositionTotals),
      };
    }

    // Handle pagination for large date ranges
    const chunks = this.splitDateRange(startDate, endDate);
    const allDays: DailyPositionTotal[] = [];

    for (const chunk of chunks) {
      const response = await this.request<DailyPositionTotalsResponse>('/api/DailyPositionTotals', {
        start_date: chunk.start,
        end_date: chunk.end,
      });
      
      const days = this.normalizeArrayResponse(response.DailyPositionTotals);
      allDays.push(...days);
    }

    return {
      status: 'success',
      dailyPositionTotals: allDays,
    };
  }
}
