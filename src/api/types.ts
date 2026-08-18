export interface User {
  id: number
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export interface Batch {
  id: number
  batch_code: string
  status: string
  start_date: string | null
  received_date: string | null
  expected_harvest_date: string | null
  actual_harvest_date: string | null
  breed_strain: string | null
  supplier: string | null
  housing_section: string | null
  initial_quantity: number
  current_quantity: number
  mortality_quantity: number
  age_in_days: number | null
  mortality_rate: number
  latest_average_weight: number | null
  total_feed_kg: number
  total_feed_cost: number
  fcr: number
  total_revenue: number
  total_cost: number
  gross_margin: number
  margin_percentage: number
  profit_per_bird: number
  cost_per_bird: number
  roi: number
  total_health_cost: number
  data_source: string
  notes: string | null
  mortality_logs?: { id: number; date: string; quantity: number; suspected_reason: string }[]
  weight_logs?: { id: number; date: string; sample_size: number; average_weight_kg: number }[]
  feed_consumptions?: { id: number; date: string; feed_type: string; quantity_sacks: number; quantity_kg: number; cost: number }[]
  health_records?: { id: number; date: string; event_type: string; medication_vaccine: string | null; cost: number }[]
}

export const BATCH_STATUSES = [
  'Planned', 'Ordered', 'Received', 'Brooding', 'Growing',
  'Ready for Harvest', 'Harvesting', 'Completed', 'Cancelled',
] as const

export const MORTALITY_REASONS = ['Disease', 'Weak chick', 'Injury', 'Unknown', 'Other'] as const

export interface Customer {
  id: number
  customer_code: string
  customer_type: string
  display_name: string
  business_name: string | null
  contact_person: string | null
  contact_number: string | null
  address: string | null
  barangay: string | null
  municipality: string | null
  preferred_product: string | null
  preferred_order_frequency: string | null
  payment_terms: string | null
  active: boolean
  notes: string | null
}

export const CUSTOMER_TYPES = [
  'School Canteen', 'Meat Shop', 'Restaurant', 'Household', 'Reseller', 'Event', 'Other',
] as const

export interface Order {
  id: number
  order_number: string
  customer: Customer
  batch_id: number | null
  batch_code: string | null
  order_date: string
  requested_delivery_date: string | null
  product_type: string
  quantity: number
  estimated_weight_kg: number | null
  actual_weight_kg: number | null
  dressed_weight_kg: number | null
  billable_weight: number
  price_per_kg: number
  total_amount: number
  amount_paid: number
  balance: number
  status: string
  payment_status: string
  dressed_yield: number | null
  data_source: string
  notes: string | null
}

export const PRODUCT_TYPES = ['Live Chicken', 'Dressed Chicken', 'Chicken Cuts', 'Processed Product', 'Other'] as const
export const ORDER_STATUSES = ['Draft', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'] as const
export const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid', 'Overdue'] as const

export interface Expense {
  id: number
  date: string
  category: string
  description: string
  amount: number
  supplier: string | null
  batch_id: number | null
  batch?: { id: number; batch_code: string } | null
  receipt_reference: string | null
  notes: string | null
}

export const EXPENSE_CATEGORIES = [
  'Chicks', 'Feed', 'Medicine', 'Vaccination', 'Farm repair', 'Equipment',
  'Transportation', 'Packaging', 'Utilities', 'Construction', 'Labor', 'Other',
] as const

export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number }
}

export interface ReorderForecast {
  customer_id: number
  display_name: string
  contact_number: string | null
  order_count: number
  last_order_date: string
  avg_interval_days: number
  predicted_next_order_date: string
  days_until_predicted: number
  status: 'Overdue' | 'Due Soon' | 'On Track'
}

export const HEALTH_EVENT_TYPES = ['Vaccination', 'Medication', 'Vitamins', 'Treatment', 'Veterinary Visit', 'Other'] as const

export interface FeedPurchase {
  id: number
  feed_type: string
  supplier: string | null
  sack_size_kg: number
  quantity_sacks: number
  remaining_quantity_sacks: number
  cost_per_sack: number
  total_cost: number
  purchase_date: string
  batch_id: number | null
}

export const FEED_TYPES = ['Starter', 'Grower', 'Finisher', 'Custom/Alternative Feed', 'Other'] as const

export interface FeedLot {
  id: number
  feed_type: string
  remaining_quantity_sacks: number
  purchase_date: string
}

export interface InventoryItem {
  id: number
  item: string
  category: string
  unit: string
  quantity: number
  minimum_stock: number
  unit_cost: number
  supplier: string | null
  location: string | null
  is_low_stock?: boolean
}

export const INVENTORY_CATEGORIES = ['Medicine', 'Vaccines', 'Cleaning Supplies', 'Farm Equipment', 'Packaging', 'Other'] as const

export interface InventoryTransaction {
  id: number
  type: string
  quantity: number
  date: string
  notes: string | null
}

export interface Setting {
  id: number
  key: string
  value: string
  type: string
  group: string
  label: string
  description: string | null
}

export interface AuditLog {
  id: number
  action: string
  entity_type: string
  entity_id: number
  reason: string | null
  created_at: string
  user: { id: number; name: string } | null
}

export interface DashboardData {
  active_batch_count: number
  total_live_birds: number
  overall_mortality_rate: number
  target_mortality_pct: number
  near_market_age_batches: Batch[]
  active_batches: Batch[]
  reorder_forecast: ReorderForecast[]
}
