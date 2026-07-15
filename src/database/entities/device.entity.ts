import {
  BatteryState,
  Geo,
} from '../../customers/data/mock-customers';
import { DeviceOs } from '../enums/device-os.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeviceModel } from './device-model.entity';
import { User } from './user.entity';

@Entity('Device')
@Index(['idDevice', 'deviceModelId'], { unique: true })
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'idDevice' })
  idDevice: string;

  @Column({ name: 'deviceModelId' })
  deviceModelId: number;

  @ManyToOne(() => DeviceModel, (model) => model.devices)
  @JoinColumn({ name: 'deviceModelId' })
  deviceModelRef: DeviceModel;

  @Column({ name: 'userId', type: 'varchar', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, (user) => user.devices, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column({ type: 'varchar', nullable: true })
  iccid: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  imei: string | null;

  @Column({ name: 'motorType', default: '28V' })
  motorType: string;

  @Column({ name: 'batteryType', default: 'Lithium' })
  batteryType: string;

  @Column({
    type: 'enum',
    enum: DeviceOs,
    enumName: 'DeviceOs',
    default: DeviceOs.ANDROID,
  })
  os: DeviceOs;

  @Column({ name: 'firmwareVersion', default: '0.0.0' })
  firmwareVersion: string;

  @Column({ type: 'jsonb', default: () => `'{"lat":0,"lng":0}'` })
  geo: Geo;

  @Column({ name: 'batteryState', type: 'jsonb', default: () => `'{"level":0,"charging":false}'` })
  batteryState: BatteryState;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
