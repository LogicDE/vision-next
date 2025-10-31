import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigAppModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { EmployeesModule } from './modules/employees/employees.module';
import { RolesModule } from './modules/roles/roles.module';
import { CountriesModule } from './modules/countries/countries.module';
import { EnterprisesModule } from './modules/enterprises/enterprises.module';
import { ActionsModule } from './modules/actions/actions.module';
import { ServicesModule } from './modules/services/services.module';
import { InterventionsModule } from './modules/interventions/interventions.module';
import { GroupsModule } from './modules/groups/groups.module';
import { EventsModule } from './modules/events/events.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { HealthModule } from './modules/health/health.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AdminSubdivisionsModule } from './modules/admin-subdivisions/admin-subdivisions.module';
import { CitiesModule } from './modules/cities/cities.module';
import { DailyEmployeeMetricsModule } from './modules/daily-employee-metrics/daily-employee-metrics.module';
import { DailyGroupMetricsModule } from './modules/daily-group-metrics/daily-group-metrics.module';
import { DevicesModule } from './modules/devices/devices.module';
import { GroupEmployeesModule } from './modules/group-employees/group-employees.module';
import { GroupSnapshotMembersModule } from './modules/group-snapshot-members/group-snapshot-members.module';
import { GroupSnapshotsModule } from './modules/group-snapshots/group-snapshots.module';
import { GroupSurveyScoresModule } from './modules/group-survey-scores/group-survey-scores.module';
import { IndivSurveyScoresModule } from './modules/indiv-survey-scores/indiv-survey-scores.module';
import { NeighborhoodsModule } from './modules/neighborhoods/neighborhoods.module';
import { PostalCodesModule } from './modules/postal-codes/postal-codes.module';
import { QuestionI18nModule } from './modules/question-i18n/question-i18n.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { RolePermissionsModule } from './modules/role-permissions/role-permissions.module';

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
        synchronize: false, // usar migrations en producción
        autoLoadEntities: true, 
      }),
    }),
    AuthModule,
    ActionsModule,
    AddressesModule,
    AdminSubdivisionsModule,
    CitiesModule,
    DailyEmployeeMetricsModule,
    DailyGroupMetricsModule,
    DevicesModule,
    GroupEmployeesModule,
    GroupSnapshotMembersModule,
    GroupSnapshotsModule,
    GroupSurveyScoresModule,
    IndivSurveyScoresModule,
    NeighborhoodsModule,
    PostalCodesModule,
    QuestionI18nModule,
    QuestionsModule,
    RolePermissionsModule,
    EmployeesModule,
    RolesModule,
    CountriesModule,
    EnterprisesModule,
    ActionsModule,
    ServicesModule,
    InterventionsModule,
    GroupsModule,
    EventsModule,
    MetricsModule,
    AuditLogsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
