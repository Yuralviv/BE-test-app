import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomerWithDevices } from './data/mock-customers';
import { MatchedBy } from './dto/customer-search-response.dto';
import { DatabaseService } from '../database/database.service';
import { mapDevice } from './utils/map-device';

type CustomerWithDevicesAndCount = Prisma.CustomerGetPayload<{
  include: {
    devices: true;
    _count: { select: { devices: true } };
  };
}>;

@Injectable()
export class CustomersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.db.customer.findMany({
        skip,
        take: limit,
        include: {
          devices: {
            orderBy: { updatedAt: 'desc' },
          },
        },
        orderBy: { lastName: 'asc' },
      }),
      this.db.customer.count(),
    ]);

    return {
      data: customers.map((customer) => this.toCustomerWithDevices(customer)),
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

    const customers = await this.db.customer.findMany({
      where: {
        OR: [
          { email: { contains: term, mode: 'insensitive' } },
          {
            devices: {
              some: {
                OR: [
                  { imei: { contains: term, mode: 'insensitive' } },
                  { iccid: { contains: term, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      },
      include: {
        devices: {
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: { devices: true },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    return customers.map((customer) => this.toSearchResult(customer, term));
  }

  private toCustomerWithDevices(
    customer: Prisma.CustomerGetPayload<{ include: { devices: true } }>,
  ): CustomerWithDevices {
    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      devices: customer.devices.map(mapDevice),
    };
  }

  private toSearchResult(
    customer: CustomerWithDevicesAndCount,
    term: string,
  ) {
    const normalizedTerm = term.toLowerCase();
    const emailMatch = customer.email
      .toLowerCase()
      .includes(normalizedTerm);
    const imeiMatches = customer.devices.filter((device) =>
      device.imei.toLowerCase().includes(normalizedTerm),
    );
    const iccidMatches = customer.devices.filter((device) =>
      device.iccid.toLowerCase().includes(normalizedTerm),
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
        deviceCount: customer._count.devices,
      },
      devices: devices.map(mapDevice),
      matchedBy,
    };
  }
}
