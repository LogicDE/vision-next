import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { Rol } from '../../entities/rol.entity';
import { Enterprise } from '../../entities/enterprise.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AuditLogService } from '../auditlogs/auditlogs.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly empRepo: Repository<Employee>,

    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,

    @InjectRepository(Enterprise)
    private readonly enterpriseRepo: Repository<Enterprise>,

    private readonly auditLogService: AuditLogService,
  ) {}

  private serializeEmployee(employee: Employee) {
    return {
      id_employee: employee.id_employee,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      username: employee.username,
      telephone: employee.telephone,
      rol: employee.rol ? { id: employee.rol.id_role, name: employee.rol.name } : null,
      enterprise: employee.enterprise ? { id: employee.enterprise.id_enterprise, name: employee.enterprise.name } : null,
      manager: employee.manager ? { id_employee: employee.manager.id_employee, first_name: employee.manager.first_name, last_name: employee.manager.last_name } : null
    };
  }

  // ---------------- CREATE ----------------
  async create(dto: CreateEmployeeDto, actor: Employee, ip?: string) {
    const role = await this.rolRepo.findOne({ where: { id_role: dto.id_role } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const enterprise = await this.enterpriseRepo.findOne({ where: { id_enterprise: dto.id_enterprise } });
    if (!enterprise) throw new NotFoundException('Empresa no encontrada');

    // Verificar duplicados
    const existingEmail = await this.empRepo.findOne({ where: { email: dto.email } });
    if (existingEmail) throw new BadRequestException('El email ya está registrado');

    const existingUsername = await this.empRepo.findOne({ where: { username: dto.username } });
    if (existingUsername) throw new BadRequestException('El username ya está registrado');

    const employeeData: Partial<Employee> = {
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: dto.email,
      username: dto.username,
      password_hash: await bcrypt.hash(dto.password, 10),
      telephone: dto.telephone ?? '',
      rol: role,
      enterprise: enterprise,
    };

    if (dto.manager_id) {
      const manager = await this.empRepo.findOne({ where: { id_employee: dto.manager_id } });
      if (!manager) throw new NotFoundException('Manager no encontrado');
      employeeData.manager = manager;
    }

    const employee = this.empRepo.create(employeeData);
    const saved = await this.empRepo.save(employee);

    // Recargar relaciones
    const savedWithRelations = await this.empRepo.findOne({
      where: { id_employee: saved.id_employee },
      relations: ['rol', 'enterprise', 'manager'],
    });

    if (!savedWithRelations) throw new Error('Error al recargar el empleado creado');

    // Audit log
    await this.auditLogService.log(actor, 'CREATE', 'Employee', { new: this.serializeEmployee(savedWithRelations) }, 'EmployeesService', ip);

    return {
      success: true,
      message: 'Empleado creado exitosamente',
      data: savedWithRelations,
      timestamp: new Date().toISOString()
    };
  }

  // ---------------- FIND ALL ----------------
  async findAll(query?: any) {
    const qb = this.empRepo
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.rol', 'rol')
      .leftJoinAndSelect('employee.enterprise', 'enterprise')
      .leftJoinAndSelect('employee.manager', 'manager');

    if (query?.first_name) qb.andWhere('employee.first_name ILIKE :first_name', { first_name: `%${query.first_name}%` });
    if (query?.last_name) qb.andWhere('employee.last_name ILIKE :last_name', { last_name: `%${query.last_name}%` });
    if (query?.rol) qb.andWhere('rol.name = :rol', { rol: query.rol });

    const orderColumn = ['first_name', 'last_name', 'email'].includes(query?.orderBy) ? `employee.${query.orderBy}` : 'employee.id_employee';
    const orderDirection = query?.orderDir === 'DESC' ? 'DESC' : 'ASC';
    qb.orderBy(orderColumn, orderDirection);

    const employees = await qb.getMany();
    return {
      success: true,
      data: employees,
      total: employees.length,
      timestamp: new Date().toISOString()
    };
  }

  // ---------------- FIND ONE ----------------
  async findOne(id: number) {
    const employee = await this.empRepo.findOne({
      where: { id_employee: id },
      relations: ['rol', 'enterprise', 'manager'],
    });
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    return {
      success: true,
      data: employee,
      timestamp: new Date().toISOString()
    };
  }

  // ---------------- UPDATE ----------------
  async update(id: number, dto: UpdateEmployeeDto, actor: Employee, ip?: string) {
    const employee = await this.empRepo.findOne({
      where: { id_employee: id },
      relations: ['rol', 'enterprise', 'manager']
    });
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    const beforeSnapshot = this.serializeEmployee(employee);

    if (dto.first_name !== undefined) employee.first_name = dto.first_name;
    if (dto.last_name !== undefined) employee.last_name = dto.last_name;
    if (dto.telephone !== undefined) employee.telephone = dto.telephone;
    if (dto.password !== undefined) employee.password_hash = await bcrypt.hash(dto.password, 10);

    if (dto.email !== undefined && dto.email !== employee.email) {
      const existingEmail = await this.empRepo.findOne({ where: { email: dto.email } });
      if (existingEmail && existingEmail.id_employee !== id) throw new BadRequestException('El email ya está en uso por otro empleado');
      employee.email = dto.email;
    }

    if (dto.username !== undefined && dto.username !== employee.username) {
      const existingUsername = await this.empRepo.findOne({ where: { username: dto.username } });
      if (existingUsername && existingUsername.id_employee !== id) throw new BadRequestException('El username ya está en uso por otro empleado');
      employee.username = dto.username;
    }

    if (dto.id_role !== undefined) {
      const role = await this.rolRepo.findOne({ where: { id_role: dto.id_role } });
      if (!role) throw new NotFoundException('Rol no encontrado');
      employee.rol = role;
    }

    if (dto.id_enterprise !== undefined) {
      const enterprise = await this.enterpriseRepo.findOne({ where: { id_enterprise: dto.id_enterprise } });
      if (!enterprise) throw new NotFoundException('Empresa no encontrada');
      employee.enterprise = enterprise;
    }

    if (dto.manager_id !== undefined) {
      if (dto.manager_id === null) employee.manager = undefined;
      else {
        const manager = await this.empRepo.findOne({ where: { id_employee: dto.manager_id } });
        if (!manager) throw new NotFoundException('Manager no encontrado');
        employee.manager = manager;
      }
    }

    const updatedEmployee = await this.empRepo.save(employee);
    const afterEmployee = await this.empRepo.findOne({
      where: { id_employee: updatedEmployee.id_employee },
      relations: ['rol', 'enterprise', 'manager']
    });

    await this.auditLogService.log(actor, 'UPDATE', 'Employee', { before: beforeSnapshot, after: this.serializeEmployee(afterEmployee!) }, 'EmployeesService', ip);

    return {
      success: true,
      message: 'Empleado actualizado exitosamente',
      data: afterEmployee,
      timestamp: new Date().toISOString()
    };
  }

  // ---------------- DELETE ----------------
  async remove(id: number, actor: Employee, ip?: string) {
    const employee = await this.empRepo.findOne({
      where: { id_employee: id },
      relations: ['rol', 'enterprise', 'manager']
    });
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    const snapshot = this.serializeEmployee(employee);
    await this.empRepo.remove(employee);
    await this.auditLogService.log(actor, 'DELETE', 'Employee', { before: snapshot }, 'EmployeesService', ip);

    return {
      success: true,
      message: 'Empleado eliminado exitosamente',
      deletedId: id,
      timestamp: new Date().toISOString()
    };
  }

  // ---------------- SEED EMPLOYEE ----------------
  async seedEmployee(dto: CreateEmployeeDto, actor: Employee) {
    let attempts = 0;
    do {
      dto.username = `user${Math.floor(Math.random() * 1000000)}`;
      const exists = await this.empRepo.findOne({ where: { username: dto.username } });
      if (!exists) break;
      attempts++;
    } while (attempts < 5);

    attempts = 0;
    do {
      if (!dto.email) dto.email = `user${Math.floor(Math.random() * 1000000)}@test.com`;
      const exists = await this.empRepo.findOne({ where: { email: dto.email } });
      if (!exists) break;
      attempts++;
    } while (attempts < 5);

    return await this.create(dto, actor, '127.0.0.1');
  }
}
