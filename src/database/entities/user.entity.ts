import { createId } from '@paralleldrive/cuid2';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import type { Device } from './device.entity';

@Entity('User')
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'firstName' })
  firstName: string;

  @Column({ name: 'lastName' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'UserRole',
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ name: 'phoneNumber', type: 'varchar', nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  username: string | null;

  @Column({ name: 'secretKey', type: 'varchar', nullable: true })
  secretKey: string | null;

  @Column({ name: 'emailVerified', default: false })
  emailVerified: boolean;

  @Column({ name: 'verificationCodeSentAt', type: 'timestamp', nullable: true })
  verificationCodeSentAt: Date | null;

  @Column({ name: 'termsAgreed', default: false })
  termsAgreed: boolean;

  @Column({ name: 'marketingTermsAgreed', default: false })
  marketingTermsAgreed: boolean;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ name: 'address2', type: 'varchar', nullable: true })
  address2: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ name: 'postalCode', type: 'varchar', nullable: true })
  postalCode: string | null;

  @OneToMany('Device', 'user')
  devices: Device[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = createId();
    }
  }
}
