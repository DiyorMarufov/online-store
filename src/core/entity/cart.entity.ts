import { BaseEntity } from 'src/common/database/baseEntity';
import { Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { UsersEntity } from './users.entity';
import { CartItemsEntity } from './cart_items.entity';

@Entity('cart')
export class CartEntity extends BaseEntity {
  @OneToOne(() => UsersEntity, (user) => user.cart)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
  customer: UsersEntity;

  @OneToMany(() => CartItemsEntity, (cartItem) => cartItem.cart)
  cart_items: CartItemsEntity[];
}
