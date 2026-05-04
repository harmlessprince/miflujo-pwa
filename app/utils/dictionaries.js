export const PAYMENT_GATEWAYS = [
  { value: 'PAYSTACK', label: 'Paystack' },
  { value: 'FLUTTERWAVE', label: 'Flutterwave' },
  { value: 'STRIPE', label: 'Stripe' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'MONNIFY', label: 'Monnify' },
]

export const PAYMENT_STATUSES = [
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'ABANDONED', label: 'Abandoned' },
]

export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Card' },
  { value: 'ussd', label: 'USSD' },
  { value: 'qr', label: 'QR Code' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'cash', label: 'Cash' },
]

export const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'ABANDONED', label: 'Abandoned' },
]

export const NOTIFICATION_TYPES = [
  { value: 'ABANDONED_CART_MERCHANT', label: 'Abandoned Cart (Merchant)' },
  { value: 'ORDER_CONFIRMATION', label: 'Order Confirmation' },
  { value: 'LOW_STOCK_ALERT', label: 'Low Stock Alert' },
  { value: 'NEW_ORDER', label: 'New Order' },
  { value: 'NEW_REVIEW', label: 'New Review' },
  { value: 'ORDER_STATUS_PENDING', label: 'Order Status: Pending' },
  { value: 'ORDER_STATUS_PROCESSING', label: 'Order Status: Processing' },
  { value: 'ORDER_STATUS_SHIPPED', label: 'Order Status: Shipped' },
  { value: 'ORDER_STATUS_DELIVERED', label: 'Order Status: Delivered' },
  { value: 'ORDER_STATUS_CANCELLED', label: 'Order Status: Cancelled' },
  { value: 'ORDER_STATUS_IN_TRANSIT', label: 'Order Status: In Transit' },
  { value: 'ORDER_STATUS_FAILED', label: 'Order Status: Failed' },
  { value: 'ORDER_STATUS_ABANDONED', label: 'Order Status: Abandoned' },
  { value: 'PAYMENT_ABANDONED_MERCHANT', label: 'Payment Abandoned (Merchant)' },
  { value: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed' },
  { value: 'SNAPSHOT_FAILED', label: 'Snapshot Failed' },
  { value: 'SNAPSHOT_READY', label: 'Snapshot Ready' },
  { value: 'WELCOME', label: 'Welcome' },
  { value: 'TEAM_INVITATION', label: 'Team Invitation' },
  { value: 'TEAM_MEMBER_JOINED', label: 'Team Member Joined' },
  { value: 'TEAM_MEMBER_REMOVED', label: 'Team Member Removed' },
]
