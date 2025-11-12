import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { UsersEntity } from './users.entity';
import { MerchantProductsEntity } from './merchant_products.entity';

@Entity('merchants')
export class MerchantsEntity extends BaseEntity {
  @OneToOne(() => UsersEntity, (user) => user.merchant, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UsersEntity;

  @Column({ type: 'varchar', name: 'store_name' })
  store_name: string;

  @Column({ type: 'varchar', name: 'store_logo',nullable: true })
  store_logo?: string;

  @Column({ type: 'text', name: 'store_description' })
  store_description: string;

  @Column({ type: 'boolean', name: 'verified', default: false })
  verified: boolean;

  @OneToMany(
    () => MerchantProductsEntity,
    (merchantProduct) => merchantProduct.merchant,
  )
  merchant_products: MerchantProductsEntity[];
}
