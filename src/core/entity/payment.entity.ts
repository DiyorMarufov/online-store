import { BaseEntity } from 'src/common/database/baseEntity';
import { OrdersEntity } from './orders.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { PaymentMethods, PaymentStatus } from 'src/common/enum';

@Entity('payments')
export class PaymentEntity extends BaseEntity {
  @OneToOne(() => OrdersEntity, (order) => order.payment, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: OrdersEntity;

  @Column({ type: 'decimal', name: 'amount', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', name: 'method', enum: PaymentMethods })
  method: PaymentMethods;

  @Column({
    type: 'enum',
    name: 'status',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'varchar', name: 'transaction_id', nullable: true })
  transaction_id: string;
}
