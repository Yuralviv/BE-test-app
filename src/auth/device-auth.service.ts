import {
  BadRequestException,
  ConflictException,
  GoneException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Device } from '../database/entities/device.entity';
import { DeviceModel } from '../database/entities/device-model.entity';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/enums/user-role.enum';
import { hashPassword, verifyPassword } from 'src/customers/utils/hash-password';
import { DeviceLoginDto, DeviceRegisterDto, DeviceUnassignDto } from './dto/device-auth.dto';
import {
  formatNextCodeSendAllowedAfter,
  generateSecretKey,
  generateUsername,
} from './utils/device-auth';

type WhitelistLookup = {
  id_device: string;
  id_deviceModel: number;
  iccid?: string;
};

@Injectable()
export class DeviceAuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    @InjectRepository(DeviceModel)
    private readonly deviceModelRepo: Repository<DeviceModel>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async register(data: DeviceRegisterDto) {
    if (!data.termsAgreed) {
      throw new BadRequestException('termsAgreed must be true');
    }

    if (!this.isValidEmail(data.email)) {
      throw new HttpException('Invalid email address', 417);
    }

    const deviceModel = await this.getDeviceModel(data.id_deviceModel);
    this.assertIccidProvided(deviceModel, data.iccid);

    const device = await this.findWhitelistedDevice({
      id_device: data.id_device,
      id_deviceModel: data.id_deviceModel,
      iccid: data.iccid,
    });

    if (device.userId) {
      throw new ConflictException('Device is already assigned to a user');
    }

    const existingUser = await this.userRepo.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new GoneException('Email already registered');
    }

    const secretKey = generateSecretKey();
    const username = generateUsername(data.email);

    const user = await this.dataSource.transaction(async (manager) => {
      const createdUser = await manager.save(User, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashPassword(data.password),
        phoneNumber: data.phoneNumber,
        role: UserRole.CUSTOMER,
        username,
        secretKey,
        termsAgreed: data.termsAgreed,
        marketingTermsAgreed: data.marketingTermsAgreed ?? false,
        address: data.address,
        address2: data.address2,
        city: data.city,
        postalCode: data.postalCode,
      });

      await manager.update(Device, device.id, {
        userId: createdUser.id,
        iccid: data.iccid ?? device.iccid,
      });

      return createdUser;
    });

    return this.buildAuthResponse(user);
  }

  async login(data: DeviceLoginDto) {
    const deviceModel = await this.getDeviceModel(data.id_deviceModel);
    this.assertIccidProvided(deviceModel, data.iccid);

    const device = await this.findWhitelistedDevice({
      id_device: data.id_device,
      id_deviceModel: data.id_deviceModel,
      iccid: data.iccid,
    });

    if (!device.userId) {
      throw new UnauthorizedException('Device is not assigned to a user');
    }

    const user = await this.userRepo.findOne({
      where: { email: data.email },
    });

    if (!user || !verifyPassword(data.password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.id !== device.userId) {
      throw new UnauthorizedException('Device is not assigned to this user');
    }

    const secretKey = generateSecretKey();
    await this.userRepo.update(user.id, { secretKey });

    const updatedUser = await this.userRepo.findOneOrFail({
      where: { id: user.id },
    });

    return this.buildAuthResponse(updatedUser);
  }

  async unassign(authenticatedUserId: string, data: DeviceUnassignDto) {
    if (authenticatedUserId !== data.id_user) {
      throw new UnauthorizedException('Device not assigned to user');
    }

    const user = await this.userRepo.findOne({
      where: { id: data.id_user },
    });

    if (!user) {
      throw new UnauthorizedException('Device not assigned to user');
    }

    const device = await this.deviceRepo.findOne({
      where: { idDevice: data.id_device },
    });

    if (!device || device.userId !== data.id_user) {
      throw new UnauthorizedException('Device not assigned to user');
    }

    await this.deviceRepo.update(device.id, { userId: null });

    return { message: 'Device unassigned successfully' };
  }

  private async findWhitelistedDevice(input: WhitelistLookup) {
    const device = await this.deviceRepo.findOne({
      where: {
        idDevice: input.id_device,
        deviceModelId: input.id_deviceModel,
      },
      relations: { deviceModelRef: true },
    });

    if (!device) {
      throw new NotFoundException('Device not whitelisted');
    }

    if (device.deviceModelRef.iccidRequired) {
      const iccid = input.iccid?.trim();
      if (!iccid) {
        throw new BadRequestException('ICCID is required for this device model');
      }

      if (device.iccid && device.iccid !== iccid) {
        throw new BadRequestException('ICCID does not match whitelisted device');
      }
    }

    return device;
  }

  private async getDeviceModel(id: number): Promise<DeviceModel> {
    const deviceModel = await this.deviceModelRepo.findOne({
      where: { id },
    });

    if (!deviceModel) {
      throw new NotFoundException('Device model not found');
    }

    return deviceModel;
  }

  private assertIccidProvided(deviceModel: DeviceModel, iccid?: string) {
    if (deviceModel.iccidRequired && !iccid?.trim()) {
      throw new BadRequestException('ICCID is required for this device model');
    }
  }

  private buildAuthResponse(user: {
    id: string;
    username: string | null;
    secretKey: string | null;
    emailVerified: boolean;
    verificationCodeSentAt: Date | null;
  }) {
    return {
      id_user: user.id,
      username: user.username ?? '',
      secretKey: user.secretKey ?? '',
      emailVerified: user.emailVerified,
      nextCodeSendAllowedAfter: formatNextCodeSendAllowedAfter(
        user.verificationCodeSentAt,
      ),
    };
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
