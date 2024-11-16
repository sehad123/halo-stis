import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new user (Register)
  async registerUser({ name, email, password, role, no_hp }: any) {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = await this.prisma.user.create({
        data: { name, email, password: hashedPassword, role, no_hp },
      });
      return newUser;
    } catch (error) {
      throw new BadRequestException('User registration failed');
    }
  }

  // Get all users with role "Pegawai"
  async getAllPegawaiUsers() {
    return this.prisma.user.findMany({
      where: {
        role: 'Pelaksana',
      },
    });
  }

  // Get a single user by ID
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Update a user
  async updateUser(id: number, { name, email, password, role, no_hp }: any) {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          no_hp,
        },
      });
      return updatedUser;
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  // Delete a user
  async deleteUser(id: number) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new NotFoundException(`Failed to delete user with ID ${id}`);
    }
  }

  // Login a user
  async loginUser({ email, password }: any) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    return user;
  }
}
