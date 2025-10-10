import { BaseEntity } from 'src/common/database/baseEntity';
import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity('cart')
export class CartEntity extends BaseEntity {
  @OneToOne(() => UsersEntity, (user) => user.cart)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
  customer: UsersEntity;
}
