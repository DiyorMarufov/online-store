import { BaseEntity } from 'src/common/database/baseEntity';
import { Status, UsersRoles } from 'src/common/enum';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { MerchantsEntity } from './merchants.entity';
import { AddressesEntity } from './addresses.entity';
import { CartEntity } from './cart.entity';

@Entity('users')
export class UsersEntity extends BaseEntity {
  @Column({ type: 'varchar', name: 'full_name' })
  full_name: string;

  @Column({ type: 'varchar', name: 'phone_number', unique: true })
  phone_number: string;

  @Column({ type: 'varchar', name: 'password' })
  password: string;

  @Column({
    type: 'enum',
    name: 'role',
    enum: UsersRoles,
    default: UsersRoles.CUSTOMER,
  })
  role: UsersRoles;

  @Column({ type: 'boolean', name: 'is_verified', default: false })
  is_verified: boolean;

  @Column({
    type: 'enum',
    name: 'status',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @OneToOne(() => MerchantsEntity, (merchant) => merchant.user)
  merchant: MerchantsEntity;

  @OneToMany(() => AddressesEntity, (address) => address.user)
  addresses: AddressesEntity[];

  @OneToOne(() => CartEntity, (cart) => cart.customer)
  cart: CartEntity;
}
