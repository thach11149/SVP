// Shared constants and configurations
export const CUSTOMER_TYPES = {
  COMPANY: 'company',
  PERSONAL: 'personal'
};

export const SERVICE_TYPES = [
  'Dịch Hại Tổng Hợp',
  'Diệt Muỗi',
  'Diệt Chuột',
  'Diệt Mối',
  'Khác'
];

export const PLAN_TYPES = {
  RECURRING: 'Lịch Định kỳ',
  ONE_TIME: '1 lần'
};

export const FREQUENCIES = [
  'Hàng tuần',
  '2 tuần/lần',
  'Hàng tháng'
];

export const REPORT_FREQUENCIES = [
  '1 tuần/lần',
  '2 tuần/lần',
  '1 tháng/lần'
];

export const DAYS_OF_WEEK = [
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
  'Chủ Nhật'
];

export const CUSTOMER_CODE_PREFIXES = {
  [CUSTOMER_TYPES.COMPANY]: 'DN',
  [CUSTOMER_TYPES.PERSONAL]: 'CN'
};

// Form validation rules
export const VALIDATION_RULES = {
  REQUIRED: 'Trường này là bắt buộc',
  EMAIL: 'Email không hợp lệ',
  PHONE: 'Số điện thoại không hợp lệ',
  TAX_CODE: 'Mã số thuế không hợp lệ'
};

// API endpoints (if using REST API instead of Supabase)
export const API_ENDPOINTS = {
  CUSTOMERS: '/api/customers',
  SERVICE_PLANS: '/api/service-plans'
};

// Default form values
export const DEFAULT_CUSTOMER_DATA = {
  customer_type: CUSTOMER_TYPES.COMPANY,
  customer_code: '',
  name: '',
  tax_code: '',
  primary_contact_name: '',
  primary_contact_position: '',
  primary_contact_phone: '',
  primary_contact_email: '',
  address: '',
  ward: '',
  district: '',
  province: '',
  site_contact_name: '',
  site_contact_position: '',
  site_contact_phone: '',
  notes: '',
  google_map_code: '',
  service_types: [],
  plan: PLAN_TYPES.RECURRING,
  days_of_week: [],
  frequency: FREQUENCIES[0]
};

export const DEFAULT_SERVICE_PLAN_DATA = {
  service_types: [],
  plan: PLAN_TYPES.RECURRING,
  days_of_week: [],
  frequency: FREQUENCIES[0],
  start_date: '',
  end_date: '',
  report_date: '',
  report_frequency: REPORT_FREQUENCIES[0]
};