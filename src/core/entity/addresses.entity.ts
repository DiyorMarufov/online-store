import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity('addresses')
export class AddressesEntity extends BaseEntity {
  @ManyToOne(() => UsersEntity, (user) => user.addresses, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UsersEntity;

  @Column({ type: 'varchar', name: 'region' })
  region: string;

  @Column({ type: 'varchar', name: 'city' })
  city: string;

  @Column({ type: 'varchar', name: 'street' })
  street: string;

  @Column({ type: 'boolean', name: 'is_default', default: true })
  is_default: boolean;
}
