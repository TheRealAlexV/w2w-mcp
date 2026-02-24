/**
 * Type definitions for When2Work API responses
 */

// Employee types
export interface Employee {
  W2W_EMPLOYEE_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  EMAILS?: string;
  PHONE?: string;
  MOBILE?: string;
  ADDRESS?: string;
  CITY?: string;
  STATE?: string;
  ZIP?: string;
  BIRTHDAY?: string;
  HIRE_DATE?: string;
  NOTES?: string;
  ACTIVE?: string;
  LAST_LOGIN?: string;
  [key: string]: string | undefined;
}

export interface EmployeeListResponse {
  employees?: Employee[];
  EmployeeList?: Employee | Employee[];
  EMPLOYEE?: Employee | Employee[];
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// Position types
export interface Position {
  POSITION_ID: string;
  POSITION_NAME: string;
  POSITION_CODE?: string;
  COLOR?: string;
  NOTES?: string;
  ACTIVE?: string;
  [key: string]: string | undefined;
}

export interface PositionListResponse {
  positions?: Position[];
  PositionList?: Position | Position[];
  POSITION?: Position | Position[];
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// Category types
export interface Category {
  CATEGORY_ID: string;
  CATEGORY_NAME: string;
  COLOR?: string;
  NOTES?: string;
  ACTIVE?: string;
  [key: string]: string | undefined;
}

export interface CategoryListResponse {
  categories?: Category[];
  CategoryList?: Category | Category[];
  CATEGORY?: Category | Category[];
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// Shift types
export interface Shift {
  SHIFT_ID: string;
  START_DATE: string;
  START_TIME: string;
  END_DATE: string;
  END_TIME: string;
  W2W_EMPLOYEE_ID?: string;
  EMPLOYEE_NAME?: string;
  POSITION_ID?: string;
  POSITION_NAME?: string;
  CATEGORY_ID?: string;
  CATEGORY_NAME?: string;
  LOCATION_ID?: string;
  LOCATION_NAME?: string;
  NOTES?: string;
  PUBLISHED?: string;
  [key: string]: string | undefined;
}

export interface AssignedShiftListResponse {
  shifts?: Shift[];
  AssignedShiftList?: Shift | Shift[];
  ShiftList?: Shift | Shift[];
  SHIFT?: Shift | Shift[];
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// TimeOff types
export interface TimeOff {
  TIMEOFF_ID: string;
  W2W_EMPLOYEE_ID: string;
  EMPLOYEE_NAME?: string;
  START_DATE: string;
  END_DATE: string;
  DESCRIPTION?: string;
  PARTIAL_DAY?: string;
  START_TIME?: string;
  END_TIME?: string;
  STATUS?: string;
  APPROVED_BY?: string;
  APPROVED_DATE?: string;
  [key: string]: string | undefined;
}

export interface ApprovedTimeOffResponse {
  timeoff?: TimeOff[];
  ApprovedTimeOff?: TimeOff | TimeOff[];
  TimeOffList?: TimeOff | TimeOff[];
  TIMEOFF?: TimeOff | TimeOff[];
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// Daily Totals types
export interface DailyTotal {
  SCHEDULE_DATE: string;
  ASSIGNED_SHIFTS: string;
  ASSIGNED_HOURS: string;
  OPEN_SHIFTS?: string;
  OPEN_HOURS?: string;
  TOTAL_SHIFTS?: string;
  TOTAL_HOURS?: string;
  [key: string]: string | undefined;
}

export interface DailyTotalsResponse {
  dailyTotals?: DailyTotal[];
  ApprovedTimeOff?: DailyTotal | DailyTotal[];
  DayList?: DailyTotal | DailyTotal[];
  DAY?: DailyTotal | DailyTotal[];
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// Daily Position Totals types
export interface DailyPositionTotal {
  SCHEDULE_DATE: string;
  POSITION_ID: string;
  POSITION_NAME: string;
  ASSIGNED_SHIFTS: string;
  ASSIGNED_HOURS: string;
  OPEN_SHIFTS?: string;
  OPEN_HOURS?: string;
  TOTAL_SHIFTS?: string;
  TOTAL_HOURS?: string;
  [key: string]: string | undefined;
}

export interface DailyPositionTotalsResponse {
  dailyPositionTotals?: DailyPositionTotal[];
  DailyPositionTotals?: DailyPositionTotal | DailyPositionTotal[];
  DayList?: DailyPositionTotal | DailyPositionTotal[];
  DAY?: DailyPositionTotal | DailyPositionTotal[];
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// Generic API response
export interface W2WApiResponse {
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// Error response
export interface W2WErrorResponse {
  status: 'error';
  message: string;
  code?: string;
}
