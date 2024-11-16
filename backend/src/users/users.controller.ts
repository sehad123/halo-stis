import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Register a new user
  @Post('register')
  async register(@Body() body: { name: string; email: string; password: string; role: string; no_hp?: string }) {
    try {
      const newUser = await this.usersService.registerUser(body);
      return newUser;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get all Pegawai users
  @Get('pegawai')
  async getAllPegawaiUsers() {
    try {
      const pegawaiUsers = await this.usersService.getAllPegawaiUsers();
      return pegawaiUsers;
    } catch (error) {
      throw new HttpException('Failed to fetch Pegawai users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get a user by ID
  @Get(':id')
  async getUserById(@Param('id') id: number) {
    try {
      const user = await this.usersService.getUserById(Number(id));
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException('Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update a user by ID
  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() body: { name?: string; email?: string; password?: string; role?: string; no_hp?: string },
  ) {
    try {
      const updatedUser = await this.usersService.updateUser(Number(id), body);
      return updatedUser;
    } catch (error) {
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete a user by ID
  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    try {
      await this.usersService.deleteUser(Number(id));
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Login a user
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const user = await this.usersService.loginUser(body);
      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
      }
      return {
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
