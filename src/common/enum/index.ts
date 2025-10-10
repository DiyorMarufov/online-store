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
