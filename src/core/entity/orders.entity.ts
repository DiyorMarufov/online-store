import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UsersEntity } from './users.entity';
import { AddressesEntity } from './addresses.entity';
import { OrderStatus } from 'src/common/enum';
import { OrderItemsEntity } from './order_items.entity';

@Entity('orders')
export class OrdersEntity extends BaseEntity {
  @ManyToOne(() => UsersEntity, (user) => user.orders, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
  customer: UsersEntity;

  @ManyToOne(() => AddressesEntity, (address) => address.orders, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'address_id', referencedColumnName: 'id' })
  address: AddressesEntity;

  @Column({
    type: 'decimal',
    name: 'total_price',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total_price: number;

  @Column({
    type: 'enum',
    name: 'status',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @OneToMany(() => OrderItemsEntity, (orderItem) => orderItem.order)
  order_items: OrderItemsEntity[];
}
