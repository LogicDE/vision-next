import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigAppModule } from './modules/infrastructure/config/config.module';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { EmployeesModule } from './modules/core/employees/employees.module';
import { RolesModule } from './modules/core/roles/roles.module';
import { CountriesModule } from './modules/geodata/countries/countries.module';
import { EnterprisesModule } from './modules/core/enterprises/enterprises.module';
import { ActionsModule } from './modules/actions/actions.module';
import { ServicesModule } from './modules/services/services.module';
import { InterventionsModule } from './modules/core/interventions/interventions.module';
import { GroupsModule } from './modules/core/groups/groups.module';
import { EventsModule } from './modules/core/events/events.module';
import { MetricsModule } from './modules/core/metrics/metrics.module';
import { AuditLogsModule } from './modules/infrastructure/audit-logs/audit-logs.module';
import { HealthModule } from './modules/infrastructure/health/health.module';
import { AddressesModule } from './modules/geodata/addresses/addresses.module';
import { AdminSubdivisionsModule } from './modules/admin-subdivisions/admin-subdivisions.module';
import { CitiesModule } from './modules/geodata/cities/cities.module';
import { DailyEmployeeMetricsModule } from './modules/core/daily-employee-metrics/daily-employee-metrics.module';
import { DailyGroupMetricsModule } from './modules/core/daily-group-metrics/daily-group-metrics.module';
import { DevicesModule } from './modules/devices/devices.module';
import { GroupEmployeesModule } from './modules/core/group-employees/group-employees.module';
import { GroupSnapshotMembersModule } from './modules/core/group-snapshot-members/group-snapshot-members.module';
import { GroupSnapshotsModule } from './modules/core/group-snapshots/group-snapshots.module';
import { GroupSurveyScoresModule } from './modules/core/group-survey-scores/group-survey-scores.module';
import { IndivSurveyScoresModule } from './modules/core/indiv-survey-scores/indiv-survey-scores.module';
import { NeighborhoodsModule } from './modules/geodata/neighborhoods/neighborhoods.module';
import { PostalCodesModule } from './modules/geodata/postal-codes/postal-codes.module';
import { QuestionI18nModule } from './modules/surveys/question-i18n/question-i18n.module';
import { QuestionsModule } from './modules/surveys/questions/questions.module';
import { RolePermissionsModule } from './modules/surveys/role-permissions/role-permissions.module';
import { CacheModule } from './modules/infrastructure/cache/cache.module';
import { FiltersModule } from './modules/infrastructure/filters/filters.module';
import { PredictionModule } from './modules/core/prediction/prediction.module';
import { NotificationModule } from './modules/infrastructure/notification/notification.module';
import { AlertsModule } from './modules/core/alerts/alerts.module';
import { DashboardModule } from './modules/core/dashboard/dashboard.module';
import { ReportsModule } from './modules/core/reports/reports.module';

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
    DashboardModule,
    AlertsModule,
    NotificationModule,
    PredictionModule, 
    CacheModule,
    FiltersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
