import { BaseEntity } from 'src/common/database/baseEntity';
import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity('merchants')
export class MerchantsEntity extends BaseEntity {
  @OneToOne(() => UsersEntity, (user) => user.merchant, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UsersEntity;
}
