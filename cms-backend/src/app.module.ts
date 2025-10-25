import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigAppModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { EmployeesModule } from './modules/employees/employees.module';
import { RolesModule } from './modules/roles/roles.module';
import { CountriesModule } from './modules/countries/countries.module';
import { StatesModule } from './modules/states/states.module';
import { EnterprisesModule } from './modules/enterprises/enterprises.module';
import { ActionsModule } from './modules/actions/actions.module';
import { ServicesModule } from './modules/services/services.module';
import { InterventionsModule } from './modules/interventions/interventions.module';
import { GroupsModule } from './modules/groups/groups.module';
import { EventsModule } from './modules/events/events.module';
import { MetricsModule } from './modules/metrics/metrics.module';

import * as Entities from './entities';
import { AuditLogModule } from './modules/auditlogs/auditlogs.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigAppModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigAppModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: Object.values(Entities),
        synchronize: false, // usar migrations en producción
        autoLoadEntities: true, 
      }),
    }),
    AuthModule,
    EmployeesModule,
    RolesModule,
    CountriesModule,
    StatesModule,
    EnterprisesModule,
    ActionsModule,
    ServicesModule,
    InterventionsModule,
    GroupsModule,
    EventsModule,
    MetricsModule,
    AuditLogModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
