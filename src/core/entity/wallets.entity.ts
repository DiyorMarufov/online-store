import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UsersEntity } from './users.entity';
import { WalletCurrencies } from 'src/common/enum';

@Entity('wallets')
export class WalletsEntity extends BaseEntity {
  @ManyToOne(() => UsersEntity, (user) => user.wallets)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UsersEntity;

  @Column({
    type: 'decimal',
    name: 'balance',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  balance: number;

  @Column({
    type: 'enum',
    name: 'currency',
    enum: WalletCurrencies,
    default: WalletCurrencies.UZS,
  })
  currency: WalletCurrencies;
}
