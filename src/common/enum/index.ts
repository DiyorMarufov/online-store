export enum UsersRoles {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  MERCHANT = 'merchant',
  CUSTOMER = 'customer',
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AttributeTypes {
  TEXT = 'text',
  NUMBER = 'number',
  COLOR = 'color',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethods {
  CARD = 'card',
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMEX = 'amex',
  UZCARD = 'uzcard',
  HUMO = 'humo',
  PAYPAL = 'paypal',
  PAYME = 'payme',
  CLICK = 'click',
  STRIPE = 'stripe',
  CASH = 'cash',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  BANK_TRANSFER = 'bank_transfer',
  QR_PAYMENT = 'qr_payment',
}

export enum PaymentStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  SUCCESS = 'success',
  CANCELLED = 'cancelled',
}
