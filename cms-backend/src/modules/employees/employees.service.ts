import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from '../../entities/employee.entity';
import { Rol } from '../../entities/rol.entity';
import { Empresa } from '../../entities/empresa.entity';
import { Repository } from 'typeorm';
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

    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,

    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Serializa una entidad a objeto plano para evitar problemas con TypeORM
   */
  private serializeEmployee(employee: Employee): any {
    if (!employee) return null;
    
    return {
      id: employee.id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      username: employee.username,
      telephone: employee.telephone,
      rol: employee.rol ? { 
        id: employee.rol.id, 
        name: employee.rol.name 
      } : null,
      empresa: employee.empresa ? { 
        id: employee.empresa.id, 
        name: employee.empresa.name 
      } : null,
      manager: employee.manager ? { 
        id: employee.manager.id, 
        first_name: employee.manager.first_name, 
        last_name: employee.manager.last_name 
      } : null,
    };
  }

  // ---------------- CREATE ----------------
  async create(dto: CreateEmployeeDto, actor: Employee, ip?: string) {
    const role = await this.rolRepo.findOne({ where: { id: dto.id_role } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const empresa = await this.empresaRepo.findOne({ where: { id: dto.id_enterprise } });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    // Verificar duplicados
    const existingEmail = await this.empRepo.findOne({ where: { email: dto.email } });
    if (existingEmail) throw new BadRequestException('El email ya está registrado');

    const existingUsername = await this.empRepo.findOne({ where: { username: dto.username } });
    if (existingUsername) throw new BadRequestException('El username ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const employeeData: Partial<Employee> = {
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: dto.email,
      username: dto.username,
      passwordHash,
      telephone: dto.telephone ?? '',
      rol: role,
      empresa: empresa,
    };

    if (dto.manager_id !== undefined && dto.manager_id !== null) {
      const manager = await this.empRepo.findOne({ where: { id: dto.manager_id } });
      if (!manager) throw new NotFoundException('Manager no encontrado');
      employeeData.manager = manager;
    }

    const employee = this.empRepo.create(employeeData);
    const saved = await this.empRepo.save(employee);

    // Recargar con relaciones para serializar correctamente
    const savedWithRelations = await this.empRepo.findOne({
      where: { id: saved.id },
      relations: ['rol', 'empresa', 'manager']
    });

    if (!savedWithRelations) {
      throw new Error('Error al recargar el empleado creado');
    }

    // --- Audit log con objeto serializado ---
    await this.auditLogService.log(
      actor, 
      'CREATE', 
      'Employee', 
      { new: this.serializeEmployee(savedWithRelations) }, 
      'EmployeesService', 
      ip
    );

    return {
      success: true,
      message: 'Empleado creado exitosamente',
      data: savedWithRelations,
      timestamp: new Date().toISOString()
    };
  }

  // ---------------- FIND ----------------
  async findAll(query?: any) {
    const qb = this.empRepo
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.rol', 'rol')
      .leftJoinAndSelect('employee.empresa', 'empresa')
      .leftJoinAndSelect('employee.manager', 'manager');

    if (query?.first_name) {
      qb.andWhere('employee.first_name ILIKE :first_name', { 
        first_name: `%${query.first_name}%` 
      });
    }
    
    if (query?.last_name) {
      qb.andWhere('employee.last_name ILIKE :last_name', { 
        last_name: `%${query.last_name}%` 
      });
    }
    
    if (query?.rol) {
      qb.andWhere('rol.name = :rol', { rol: query.rol });
    }

    if (query?.orderBy && ['first_name', 'last_name', 'email'].includes(query.orderBy)) {
      const orderDirection = query.orderDir === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`employee.${query.orderBy}`, orderDirection);
    } else {
      qb.orderBy('employee.id', 'ASC');
    }

    const employees = await qb.getMany();
    
    return {
      success: true,
      data: employees,
      total: employees.length,
      timestamp: new Date().toISOString()
    };
  }

  async findOne(id: number) {
    const user = await this.empRepo.findOne({
      where: { id },
      relations: ['rol', 'empresa', 'manager', 'subordinates'],
    });
    
    if (!user) throw new NotFoundException('Empleado no encontrado');
    
    return {
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    };
  }

  // ---------------- UPDATE - SOLUCIÓN DEFINITIVA ----------------
  async update(id: number, dto: UpdateEmployeeDto, actor: Employee, ip?: string) {
    // Obtener el empleado actual con todas sus relaciones
    const employee = await this.empRepo.findOne({
      where: { id },
      relations: ['rol', 'empresa', 'manager']
    });
    
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    // Serializar el estado anterior ANTES de cualquier modificación
    const beforeSnapshot = this.serializeEmployee(employee);

    // Verificar si hay campos para actualizar
    const hasUpdates = 
      dto.password !== undefined ||
      dto.id_role !== undefined ||
      dto.id_enterprise !== undefined ||
      dto.manager_id !== undefined ||
      dto.first_name !== undefined ||
      dto.last_name !== undefined ||
      dto.email !== undefined ||
      dto.username !== undefined ||
      dto.telephone !== undefined;

    if (!hasUpdates) {
      return {
        success: true,
        message: 'No se detectaron cambios para actualizar',
        data: employee,
        timestamp: new Date().toISOString()
      };
    }

    // Actualizar campos simples directamente en la entidad existente
    if (dto.first_name !== undefined) {
      employee.first_name = dto.first_name;
    }
    
    if (dto.last_name !== undefined) {
      employee.last_name = dto.last_name;
    }
    
    if (dto.telephone !== undefined) {
      employee.telephone = dto.telephone;
    }

    // Manejar password
    if (dto.password !== undefined) {
      employee.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    // Validar y actualizar email
    if (dto.email !== undefined && dto.email !== employee.email) {
      const existingEmail = await this.empRepo.findOne({ 
        where: { email: dto.email } 
      });
      if (existingEmail && existingEmail.id !== id) {
        throw new BadRequestException('El email ya está en uso por otro empleado');
      }
      employee.email = dto.email;
    }
    
    // Validar y actualizar username
    if (dto.username !== undefined && dto.username !== employee.username) {
      const existingUsername = await this.empRepo.findOne({ 
        where: { username: dto.username } 
      });
      if (existingUsername && existingUsername.id !== id) {
        throw new BadRequestException('El username ya está en uso por otro empleado');
      }
      employee.username = dto.username;
    }

    // Actualizar relaciones
    if (dto.id_role !== undefined) {
      const role = await this.rolRepo.findOne({ where: { id: dto.id_role } });
      if (!role) throw new NotFoundException('Rol no encontrado');
      employee.rol = role;
    }

    if (dto.id_enterprise !== undefined) {
      const empresa = await this.empresaRepo.findOne({ where: { id: dto.id_enterprise } });
      if (!empresa) throw new NotFoundException('Empresa no encontrada');
      employee.empresa = empresa;
    }

    // CORRECCIÓN: Manejar manager correctamente según el tipo Employee
    if (dto.manager_id !== undefined) {
      if (dto.manager_id === null) {
        // TypeScript acepta undefined para propiedades opcionales
        employee.manager = undefined;
      } else {
        const manager = await this.empRepo.findOne({ where: { id: dto.manager_id } });
        if (!manager) throw new NotFoundException('Manager no encontrado');
        employee.manager = manager;
      }
    }

    // Guardar los cambios
    const updatedEmployee = await this.empRepo.save(employee);

    // Recargar con relaciones actualizadas
    const afterEmployee = await this.empRepo.findOne({
      where: { id: updatedEmployee.id },
      relations: ['rol', 'empresa', 'manager']
    });

    if (!afterEmployee) {
      throw new Error('Error al recargar el empleado actualizado');
    }

    // Serializar el estado posterior
    const afterSnapshot = this.serializeEmployee(afterEmployee);

    // --- Audit log con objetos serializados ---
    await this.auditLogService.log(
      actor, 
      'UPDATE', 
      'Employee', 
      { before: beforeSnapshot, after: afterSnapshot }, 
      'EmployeesService', 
      ip
    );

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
      where: { id },
      relations: ['rol', 'empresa', 'manager']
    });
    
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    // Serializar antes de eliminar
    const employeeSnapshot = this.serializeEmployee(employee);

    // Eliminar
    await this.empRepo.remove(employee);
    
    // --- Audit log con objeto serializado ---
    await this.auditLogService.log(
      actor, 
      'DELETE', 
      'Employee', 
      { before: employeeSnapshot }, 
      'EmployeesService', 
      ip
    );
    
    return {
      success: true,
      message: 'Empleado eliminado exitosamente',
      deletedId: id,
      timestamp: new Date().toISOString()
    };
  }
}