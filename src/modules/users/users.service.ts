import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PermissionService } from '../auth/permission.service';


import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService, 
    private readonly permissionService: PermissionService,

  ) {}

  /** ✅ Remove sensitive fields */
  private toResponse(user: any) {
    if (!user) return null;
    const { passwordHash, ...clean } = user;
    return clean;
  }

  /* =========================
     LOGIN
     ========================= */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: dto.username },
          { email: dto.username },
        ],
        isActive: true,
      },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role.name,
      },
    };
  }


async findAll(query: any, baseUrl: string) {
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.page_size ?? 10);
  const skip = (page - 1) * pageSize;

  const where: any = {};

  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { username: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.role) where.roleId = Number(query.role);
  if (query.status)
    where.isActive = query.status === 'active';

  const [data, count] = await Promise.all([
    this.prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(count / pageSize);

  return {
    count,
    total_pages: totalPages,
    current_page: page,
    page_size: pageSize,
    next:
      page < totalPages
        ? `${baseUrl}?page=${page + 1}&page_size=${pageSize}`
        : null,
    previous:
      page > 1
        ? `${baseUrl}?page=${page - 1}&page_size=${pageSize}`
        : null,
    data: data.map((u) => this.toResponse(u)),
  };
}

  /* =========================
     GET ONE USER
     ========================= */
  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return this.toResponse(user);
  }


async create(dto: CreateUserDto) {
  const passwordHash = await bcrypt.hash(dto.password, 12);

  return this.prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleId: dto.roleId,
      },
    });

    const role = await tx.role.findUnique({ where: { id: dto.roleId } });

    if (role.code === 'TEACHER') {
      await tx.teacher.create({ data: { userId: user.id } });
    }

    if (role.code === 'STAFF') {
      await tx.staff.create({ data: { userId: user.id, designation: 'Staff' } });
    }

    return user;
  });
}


  /* =========================
     UPDATE USER
     ========================= */
  async update(id: number, dto: UpdateUserDto, currentUserId: number) {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot update yourself');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
      include: { role: true },
    });

    return this.toResponse(updated);
  }

  /* =========================
     ACTIVATE / DEACTIVATE
     ========================= */
  async deactivate(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /* =========================
     ROLES & STATS
     ========================= */
  async getRoles() {
    return this.prisma.role.findMany({ orderBy: { id: 'asc' } });
  }

  async getUserStats() {
    const totalUsers = await this.prisma.user.count();
    return { totalUsers };
  }

  /**
 * ============================================================
 * PERMISSION MANAGEMENT
 * ============================================================
 */

async assignPermissionToUser(
  userId: number,
  permissionCode: string,
  isGranted: boolean,
) {
  // Import PermissionService at the top
  // You need to inject PermissionService in constructor
  
  return this.permissionService.assignPermissionToUser(
    userId,
    permissionCode,
    isGranted ? {} : { deny: true },
  );
}

async removePermissionFromUser(userId: number, permissionCode: string) {
  return this.permissionService.removePermissionFromUser(userId, permissionCode);
}

async getUserPermissionsWithSources(userId: number) {
  return this.permissionService.getUserPermissionsWithSources(userId);
}
}
