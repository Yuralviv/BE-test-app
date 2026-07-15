import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/enums/user-role.enum';
import { MatchedBy } from './dto/customer-search-response.dto';
import { mapDevice } from './utils/map-device';
import { mapUserToCustomerWithDevices } from './utils/map-user';

type CustomerWithDevicesAndCount = User & { deviceCount: number };

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [customers, total] = await this.userRepo.findAndCount({
      where: { role: UserRole.CUSTOMER },
      relations: {
        devices: { deviceModelRef: true },
      },
      order: { lastName: 'ASC' },
      skip,
      take: limit,
    });

    for (const customer of customers) {
      customer.devices.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    }

    return {
      data: customers.map((customer) => mapUserToCustomerWithDevices(customer)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async search(q: string) {
    const term = q.trim();
    if (!term) {
      throw new BadRequestException('Search query q is required');
    }

    const customers = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.devices', 'device')
      .leftJoinAndSelect('device.deviceModelRef', 'deviceModelRef')
      .loadRelationCountAndMap('user.deviceCount', 'user.devices')
      .where('user.role = :role', { role: UserRole.CUSTOMER })
      .andWhere(
        new Brackets((qb) => {
          qb.where('user.email ILIKE :term', { term: `%${term}%` })
            .orWhere('device.imei ILIKE :term', { term: `%${term}%` })
            .orWhere('device.iccid ILIKE :term', { term: `%${term}%` });
        }),
      )
      .orderBy('user.lastName', 'ASC')
      .addOrderBy('device.updatedAt', 'DESC')
      .getMany();

    return (customers as CustomerWithDevicesAndCount[]).map((customer) =>
      this.toSearchResult(customer, term),
    );
  }

  private toSearchResult(customer: CustomerWithDevicesAndCount, term: string) {
    const normalizedTerm = term.toLowerCase();
    const emailMatch = customer.email.toLowerCase().includes(normalizedTerm);
    const imeiMatches = customer.devices.filter((device) =>
      device.imei?.toLowerCase().includes(normalizedTerm),
    );
    const iccidMatches = customer.devices.filter((device) =>
      device.iccid?.toLowerCase().includes(normalizedTerm),
    );

    let matchedBy: MatchedBy;
    if (emailMatch) {
      matchedBy = 'email';
    } else if (imeiMatches.length > 0) {
      matchedBy = 'imei';
    } else {
      matchedBy = 'iccid';
    }

    const devices =
      matchedBy === 'email'
        ? customer.devices
        : matchedBy === 'imei'
          ? imeiMatches
          : iccidMatches;

    return {
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        deviceCount: customer.deviceCount,
      },
      devices: devices.map(mapDevice),
      matchedBy,
    };
  }
}
