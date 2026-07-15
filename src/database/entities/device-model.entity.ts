import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Device } from './device.entity';

@Entity('DeviceModel')
export class DeviceModel {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: false })
  iccidRequired: boolean;

  @OneToMany(() => Device, (device) => device.deviceModelRef)
  devices: Device[];
}
