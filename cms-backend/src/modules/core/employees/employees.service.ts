import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../../entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  // Crear empleado con hashing de contraseña
  async create(dto: CreateEmployeeDto) {
    const hashedPassword = await bcrypt.hash(dto.passwordHash, 12);

    const employee = this.employeeRepo.create({
      ...dto,
      passwordHash: hashedPassword,
      enterprise: { id: dto.idEnterprise } as any,
      role: { id: dto.idRole } as any,
      manager: dto.idManager ? { id: dto.idManager } as any : undefined,
    });

    return this.employeeRepo.save(employee);
  }

  findAll() {
    return this.employeeRepo.find({ relations: ['enterprise', 'role', 'manager'] });
  }

  async findOne(id: number) {
    const employee = await this.employeeRepo.findOne({
      where: { id },
      relations: ['enterprise', 'role', 'manager'],
    });
    if (!employee) throw new NotFoundException('Employee no encontrado');
    return employee;
  }

  // Actualizar empleado con hashing si se cambia contraseña
  async update(id: number, dto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);

    if (dto.idEnterprise) employee.enterprise = { id: dto.idEnterprise } as any;
    if (dto.idRole) employee.role = { id: dto.idRole } as any;
    if (dto.idManager !== undefined) employee.manager = dto.idManager ? { id: dto.idManager } as any : null;
    if (dto.firstName) employee.firstName = dto.firstName;
    if (dto.lastName) employee.lastName = dto.lastName;
    if (dto.email) employee.email = dto.email;
    if (dto.username) employee.username = dto.username;
    if (dto.passwordHash) {
      employee.passwordHash = await bcrypt.hash(dto.passwordHash, 12);
    }
    if (dto.telephone !== undefined) employee.telephone = dto.telephone;
    if (dto.status) employee.status = dto.status;

    return this.employeeRepo.save(employee);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.employeeRepo.delete(id);
    return { message: 'Employee eliminado' };
  }
}
