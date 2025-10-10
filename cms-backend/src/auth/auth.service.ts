import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employees/employee.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async validateUser(email: string, password: string): Promise<Employee | null> {
    this.logger.log(`Attempting login for email: ${email}`);
    
    const employee = await this.employeeRepository.findOne({ 
      where: { email } 
    });

    if (!employee) {
      this.logger.warn(`User not found: ${email}`);
      return null;
    }

    this.logger.log(`User found, verifying password...`);
    const isPasswordValid = await bcrypt.compare(password, employee.password_hash);
    this.logger.log(`Password valid: ${isPasswordValid}`);

    if (isPasswordValid) {
      return employee;
    }

    return null;
  }

  async getUserById(id: number): Promise<Employee | null> {
    return this.employeeRepository.findOne({ 
      where: { id_employee: id } 
    });
  }
}

