# Guía de Implementación: Notificaciones Push para Eventos

## Descripción General

Este documento describe el sistema de notificaciones push implementado para enviar alertas a los miembros de un grupo cuando se crea un nuevo evento en la plataforma. El sistema está completamente aislado y no modifica ninguna funcionalidad existente del proyecto.

## Arquitectura del Sistema

El sistema está compuesto por dos componentes principales:

### 1. Backend (NestJS/TypeScript)
- **Archivo**: `cms-backend/src/modules/core/events/event-push-notification.service.ts`
- **Función**: Detecta cuando se crea un evento y envía notificaciones push a todos los miembros del grupo

### 2. Frontend Móvil (Android/Kotlin)
- **Archivos**:
  - `mobile-app/app/src/main/java/com/example/vision_next2/notifications/EventNotificationManager.kt`
  - `mobile-app/app/src/main/java/com/example/vision_next2/notifications/EventFirebaseMessagingService.kt`
- **Función**: Recibe notificaciones push y las muestra al usuario

## Flujo de Funcionamiento

```
1. Usuario crea evento desde interfaz web
   ↓
2. EventsService.create() guarda el evento en la BD
   ↓
3. EventPushNotificationService.sendNotificationForNewEvent() es llamado
   ↓
4. Servicio obtiene todos los miembros del grupo asignado
   ↓
5. Para cada miembro:
   - Obtiene su token FCM
   - Construye payload de notificación
   - Envía notificación vía Firebase Cloud Messaging
   ↓
6. Firebase Cloud Messaging entrega la notificación al dispositivo Android
   ↓
7. EventFirebaseMessagingService.onMessageReceived() recibe el mensaje
   ↓
8. EventNotificationManager.showEventNotification() construye y muestra la notificación
   ↓
9. Usuario ve la notificación en su dispositivo
```

## Especificaciones de la Notificación

Según los requerimientos:

- **Título**: "Nuevo evento"
- **Mensaje**: "¡Descubre de qué trata!"
- **Destinatarios**: Todos los miembros del grupo asignado al evento
- **Datos adicionales**: Se incluyen ID del evento y grupo para navegación

## Estructura de Datos

### Tabla `events`
- `id_event`: ID único del evento
- `id_group`: ID del grupo asignado
- `title_message`: Título del evento
- `body_message`: Mensaje del evento
- `coordinator_name`: Nombre del coordinador (opcional)
- `start_at`: Fecha/hora de inicio (opcional)
- `end_at`: Fecha/hora de fin

### Relación `groups_employees`
- `id_group`: ID del grupo
- `id_employee`: ID del empleado (miembro del grupo)

## Implementación Backend

### EventPushNotificationService

Servicio completamente aislado que maneja el envío de notificaciones.

#### Métodos Principales

1. **`sendNotificationForNewEvent(createdEvent: Event)`**
   - Método principal que orquesta todo el proceso
   - Debe ser llamado después de crear un evento
   - Incluye validación, obtención de miembros, construcción de payload y envío

2. **`validateEventData(event: Event)`**
   - Valida que el evento tenga todos los datos necesarios
   - Verifica existencia de evento, ID y grupo asignado

3. **`retrieveGroupMembers(groupId: number)`**
   - Obtiene todos los empleados que pertenecen a un grupo
   - Incluye relaciones con la entidad Employee

4. **`buildNotificationPayload(event: Event)`**
   - Construye el payload de la notificación según especificaciones
   - Incluye título, mensaje y datos adicionales del evento

5. **`dispatchNotificationsToGroupMembers()`**
   - Itera sobre cada miembro del grupo
   - Obtiene token FCM del empleado
   - Envía notificación individual

6. **`sendPushNotification(fcmToken, payload)`**
   - Envía notificación push real vía Firebase Cloud Messaging
   - Actualmente en modo simulación (requiere configuración de FCM)

#### Integración con EventsService

Para integrar este servicio en el flujo existente:

```typescript
// En events.service.ts, después de guardar el evento:
async create(dto: CreateEventDto) {
  // ... código existente ...
  const savedEvent = await this.eventRepo.save(event);
  
  // Llamar al servicio de notificaciones (no bloquea si falla)
  this.pushNotificationService.sendNotificationForNewEvent(savedEvent)
    .catch(error => {
      // Log del error pero no fallar la creación del evento
      console.error('Error al enviar notificaciones:', error);
    });
  
  return savedEvent;
}
```

## Guía Paso a Paso de Integración

Esta sección detalla los pasos exactos para integrar el sistema de notificaciones push sin modificar el comportamiento existente del proyecto.

### Paso 1: Registrar el Servicio en el Módulo de Eventos

**Archivo**: `cms-backend/src/modules/core/events/events.module.ts`

**Acción**: Agregar `EventPushNotificationService` como provider y registrar las entidades necesarias.

**Código a agregar**:

```typescript
// 1. Importar el servicio de notificaciones
import { EventPushNotificationService } from './event-push-notification.service';

// 2. Importar las entidades necesarias (si no están ya)
import { GroupEmployee } from '../../../entities/group-employee.entity';
import { Employee } from '../../../entities/employee.entity';

// 3. En el decorador @Module, agregar:
@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Group, GroupEmployee, Employee]), // Agregar GroupEmployee y Employee
    AuthModule,
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventPushNotificationService, // Agregar este servicio
  ],
  exports: [EventsService],
})
```

**Verificación**:
- ✅ El módulo compila sin errores
- ✅ Las entidades `GroupEmployee` y `Employee` están disponibles

---

### Paso 2: Inyectar el Servicio en EventsService

**Archivo**: `cms-backend/src/modules/core/events/events.service.ts`

**Acción**: Inyectar `EventPushNotificationService` en el constructor de `EventsService`.

**Código a agregar**:

```typescript
// 1. Importar el servicio
import { EventPushNotificationService } from './event-push-notification.service';

// 2. En el constructor, agregar la inyección:
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    // Agregar esta línea:
    private readonly pushNotificationService: EventPushNotificationService,
  ) {}
```

**Verificación**:
- ✅ El servicio compila sin errores
- ✅ La inyección de dependencias funciona correctamente

---

### Paso 3: Llamar al Servicio Después de Crear un Evento

**Archivo**: `cms-backend/src/modules/core/events/events.service.ts`

**Acción**: Modificar el método `create()` para llamar al servicio de notificaciones después de guardar el evento.

**Código a modificar**:

```typescript
async create(dto: CreateEventDto) {
  // Código existente (NO MODIFICAR):
  const group = await this.groupRepo.findOne({ where: { id: dto.groupId } });
  if (!group) throw new NotFoundException('Grupo no encontrado');

  const event = this.eventRepo.create({
    ...dto,
    group,
    startAt: dto.startAt ? new Date(dto.startAt) : undefined,
    endAt: new Date(dto.endAt),
  });

  // Guardar el evento (código existente)
  const savedEvent = await this.eventRepo.save(event);

  // ============================================
  // NUEVO CÓDIGO: Enviar notificaciones push
  // ============================================
  // Llamar al servicio de notificaciones de forma asíncrona
  // No bloquea la respuesta si falla
  this.pushNotificationService
    .sendNotificationForNewEvent(savedEvent)
    .catch((error) => {
      // Log del error pero no fallar la creación del evento
      // El Logger del servicio ya registra errores detallados
      console.error(
        '[EventsService] Error al enviar notificaciones push:',
        error?.message || error,
      );
    });

  // Retornar el evento guardado (código existente)
  return savedEvent;
}
```

**Puntos importantes**:
- ✅ El evento se guarda **ANTES** de enviar notificaciones
- ✅ Si falla el envío de notificaciones, **NO** afecta la creación del evento
- ✅ El proceso es asíncrono y no bloquea la respuesta HTTP
- ✅ Los errores se registran pero no se propagan

**Verificación**:
- ✅ El método `create()` sigue funcionando igual que antes
- ✅ Los logs muestran el proceso de notificaciones cuando se crea un evento

---

### Paso 4: Verificar que el Evento Tiene la Relación con Group Cargada

**Archivo**: `cms-backend/src/modules/core/events/events.service.ts`

**Acción**: Asegurar que cuando se guarda el evento, la relación con `group` está cargada para que el servicio de notificaciones pueda acceder a `event.group.id`.

**Código actual** (ya debería estar así):

```typescript
const event = this.eventRepo.create({
  ...dto,
  group, // ✅ El grupo ya está cargado aquí
  // ...
});

const savedEvent = await this.eventRepo.save(event);
// ✅ savedEvent.group debería estar disponible
```

**Si el grupo no está disponible después de guardar**, puedes recargar el evento con relaciones:

```typescript
const savedEvent = await this.eventRepo.save(event);

// Recargar con relaciones si es necesario
const eventWithRelations = await this.eventRepo.findOne({
  where: { id: savedEvent.id },
  relations: ['group'], // Cargar la relación group
});

// Usar eventWithRelations para notificaciones
if (eventWithRelations) {
  this.pushNotificationService
    .sendNotificationForNewEvent(eventWithRelations)
    .catch((error) => {
      console.error('Error al enviar notificaciones push:', error);
    });
}
```

**Verificación**:
- ✅ `savedEvent.group` existe y tiene un `id` válido
- ✅ Los logs del servicio muestran el ID del grupo correctamente

---

### Paso 5: Verificar la Estructura del Módulo

**Archivo**: `cms-backend/src/modules/core/events/events.module.ts`

**Verificación final del módulo completo**:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { Event } from '../../../entities/event.entity';
import { Group } from '../../../entities/group.entity';
import { GroupEmployee } from '../../../entities/group-employee.entity'; // ✅ Agregado
import { Employee } from '../../../entities/employee.entity'; // ✅ Agregado
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventPushNotificationService } from './event-push-notification.service'; // ✅ Agregado

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Group, GroupEmployee, Employee]), // ✅ Entidades agregadas
    AuthModule,
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventPushNotificationService, // ✅ Servicio agregado
  ],
  exports: [EventsService],
})
export class EventsModule {}
```

---

### Paso 6: Probar la Integración

**Pasos de prueba**:

1. **Verificar que el backend compila**:
   ```bash
   docker-compose logs cms-backend | grep -i "error\|compilation"
   ```

2. **Crear un evento de prueba desde la interfaz web**

3. **Verificar logs del servicio de notificaciones**:
   ```bash
   docker-compose logs cms-backend --tail=200 | grep EventPushNotification
   ```

4. **Verificar que el evento se creó correctamente**:
   - El evento debe aparecer en la base de datos
   - La respuesta HTTP debe ser exitosa (200/201)

5. **Verificar logs de notificaciones**:
   - Debe aparecer: "=== INICIO: Proceso de envío de notificación push para nuevo evento ==="
   - Debe aparecer: "Paso 1: Validando datos del evento..."
   - Debe aparecer: "Paso 2: Obteniendo miembros del grupo..."

---

### Paso 7: Manejo de Errores (Opcional pero Recomendado)

Si quieres agregar más robustez, puedes agregar un Logger específico en `EventsService`:

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  // ... en el método create():
  this.pushNotificationService
    .sendNotificationForNewEvent(savedEvent)
    .catch((error) => {
      this.logger.warn(
        `No se pudieron enviar notificaciones push para el evento ${savedEvent.id}: ${error?.message || error}`,
      );
      // El evento ya fue creado exitosamente, así que no relanzamos el error
    });
```

---

### Resumen de Archivos Modificados

Para integrar completamente el sistema, necesitas modificar **solo 2 archivos**:

1. **`cms-backend/src/modules/core/events/events.module.ts`**
   - Agregar imports de `GroupEmployee`, `Employee`, y `EventPushNotificationService`
   - Agregar entidades a `TypeOrmModule.forFeature()`
   - Agregar `EventPushNotificationService` a `providers`

2. **`cms-backend/src/modules/core/events/events.service.ts`**
   - Agregar import de `EventPushNotificationService`
   - Inyectar el servicio en el constructor
   - Llamar al servicio después de guardar el evento en `create()`

**Total de líneas agregadas**: Aproximadamente 10-15 líneas de código.

---

### Checklist de Integración

Antes de considerar la integración completa, verifica:

- [ ] `EventPushNotificationService` está en `providers` de `EventsModule`
- [ ] `GroupEmployee` y `Employee` están en `TypeOrmModule.forFeature()`
- [ ] `EventPushNotificationService` está inyectado en `EventsService`
- [ ] El método `create()` llama a `sendNotificationForNewEvent()` después de guardar
- [ ] El evento se guarda correctamente (comportamiento existente no afectado)
- [ ] Los logs muestran el proceso de notificaciones cuando se crea un evento
- [ ] Los errores de notificaciones no afectan la creación del evento

---

### Troubleshooting de Integración

**Problema**: "EventPushNotificationService is not defined"

**Solución**: 
- Verificar que el import está correcto en `events.module.ts`
- Verificar que el servicio está en `providers`

**Problema**: "Cannot find module 'GroupEmployee'"

**Solución**:
- Verificar que la entidad existe en `cms-backend/src/entities/group-employee.entity.ts`
- Verificar que el import está correcto

**Problema**: "savedEvent.group is undefined"

**Solución**:
- Recargar el evento con relaciones antes de llamar al servicio (ver Paso 4)

**Problema**: "No se ven logs de notificaciones"

**Solución**:
- Verificar que el servicio está siendo llamado (agregar un `console.log` antes de la llamada)
- Verificar que el Logger está configurado correctamente
- Verificar que los logs no están siendo filtrados

#### Dependencias Requeridas

Para funcionamiento completo, se necesita:

1. **Firebase Admin SDK**
   ```bash
   npm install firebase-admin
   ```

2. **Credenciales de Firebase**
   - Archivo JSON con credenciales de Firebase
   - Configurar variable de entorno con la ruta al archivo

3. **Campo `fcmToken` en tabla `employees`**
   - Agregar columna para almacenar tokens FCM de cada empleado
   - Actualizar entidad Employee para incluir este campo

## Implementación Android

### EventNotificationManager

Manager estático que maneja la creación y visualización de notificaciones.

#### Métodos Principales

1. **`initializeNotificationChannel(context: Context)`**
   - Crea el canal de notificaciones requerido en Android 8.0+
   - **DEBE** ser llamado antes de mostrar cualquier notificación
   - Recomendado llamarlo en `Application.onCreate()`

2. **`showEventNotification(context, title, message, eventId?, groupId?)`**
   - Construye y muestra la notificación usando NotificationCompat
   - Valida parámetros, crea Intent, construye notificación y la muestra

#### Características de la Notificación

- **Ícono**: Usa ícono del sistema (puede personalizarse)
- **Sonido**: Sonido por defecto del sistema
- **Vibración**: Patrón personalizado [0, 1000, 500, 1000] ms
- **Auto-cancel**: Se elimina cuando el usuario la toca
- **Acción**: Abre MainActivity cuando se toca (con extras opcionales)

### EventFirebaseMessagingService

Servicio que extiende FirebaseMessagingService para recibir mensajes push.

#### Métodos Principales

1. **`onMessageReceived(remoteMessage: RemoteMessage)`**
   - Llamado automáticamente cuando se recibe notificación push
   - Extrae datos de notificación y payload personalizado
   - Delega visualización a EventNotificationManager

2. **`onNewToken(token: String)`**
   - Llamado cuando se recibe o refresca un nuevo token FCM
   - **IMPORTANTE**: El token debe enviarse al backend para almacenarlo

#### Registro en AndroidManifest.xml

El servicio debe estar registrado:

```xml
<service
    android:name=".notifications.EventFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

## Configuración Necesaria

### Backend

1. **Instalar Firebase Admin SDK**
   ```bash
   cd cms-backend
   npm install firebase-admin
   ```

2. **Obtener credenciales de Firebase**
   - Ir a Firebase Console
   - Crear o seleccionar proyecto
   - Generar clave de cuenta de servicio
   - Guardar archivo JSON en el proyecto

3. **Configurar variable de entorno**
   ```env
   FIREBASE_CREDENTIALS_PATH=/path/to/service-account-key.json
   ```

4. **Inicializar Firebase Admin en el módulo**
   ```typescript
   import * as admin from 'firebase-admin';
   import * as serviceAccount from './service-account-key.json';
   
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
   });
   ```

5. **Agregar campo `fcmToken` a tabla `employees`**
   ```sql
   ALTER TABLE employees ADD COLUMN fcm_token VARCHAR(255) NULL;
   ```

6. **Actualizar entidad Employee**
   ```typescript
   @Column({ name: 'fcm_token', length: 255, nullable: true })
   fcmToken?: string;
   ```

### Android

1. **Agregar Firebase al proyecto**
   - Seguir guía oficial de Firebase para Android
   - Descargar `google-services.json`
   - Agregar al proyecto en `mobile-app/app/`

2. **Agregar dependencia en build.gradle.kts**
   ```kotlin
   implementation("com.google.firebase:firebase-messaging:23.4.0")
   ```

3. **Inicializar canal de notificaciones**
   - En `Application` class o `MainActivity.onCreate()`:
   ```kotlin
   EventNotificationManager.initializeNotificationChannel(this)
   ```

4. **Registrar servicio en AndroidManifest.xml**
   - Agregar el registro del servicio como se muestra arriba

5. **Obtener y enviar token FCM al backend**
   - Implementar lógica para obtener token
   - Enviar a backend al iniciar sesión
   - Actualizar cuando se recibe nuevo token en `onNewToken()`

## Logging y Debugging

Ambos componentes incluyen logging exhaustivo:

### Backend
- Usa Logger de NestJS con nombre `EventPushNotificationService`
- Registra cada paso del proceso
- Incluye información detallada de errores

### Android
- Usa `Log.d()` con TAG específico
- Filtros de log:
  - `EventNotificationManager` para logs del manager
  - `EventFirebaseMessaging` para logs del servicio FCM

### Ver logs en desarrollo

**Backend:**
```bash
docker-compose logs cms-backend | grep EventPushNotification
```

**Android:**
```bash
adb logcat | grep -E "EventNotificationManager|EventFirebaseMessaging"
```

## Pruebas

### Prueba Manual Backend

1. Crear un evento desde la interfaz web
2. Verificar logs del backend:
   ```bash
   docker-compose logs cms-backend --tail=100 | grep EventPushNotification
   ```
3. Verificar que se detecta el evento y se obtienen miembros del grupo

### Prueba Manual Android

1. Obtener token FCM del dispositivo
2. Enviar notificación de prueba desde Firebase Console
3. Verificar que se recibe y muestra la notificación
4. Verificar logs:
   ```bash
   adb logcat | grep EventNotificationManager
   ```

## Estado Actual

### ✅ Completado
- Lógica de detección de eventos creados
- Obtención de miembros del grupo
- Construcción de payload de notificación
- Manejo de notificaciones en Android
- Canal de notificaciones configurado
- Logging exhaustivo en ambos componentes

### ⚠️ Pendiente (Configuración)
- Integración real con Firebase Cloud Messaging en backend
- Campo `fcmToken` en base de datos y entidad Employee
- Inicialización de Firebase Admin SDK
- Envío de tokens FCM desde Android al backend
- Registro del servicio FCM en AndroidManifest.xml

### 📝 Notas Importantes

1. **No modifica código existente**: Todos los archivos son nuevos y aislados
2. **Modo simulación**: El envío de FCM está simulado actualmente
3. **Robusto ante errores**: Los errores en notificaciones no afectan la creación de eventos
4. **Extensible**: Fácil agregar más tipos de notificaciones en el futuro

## Próximos Pasos

1. Configurar Firebase Cloud Messaging completamente
2. Agregar campo `fcmToken` a la base de datos
3. Implementar endpoint para actualizar token FCM desde Android
4. Integrar `EventPushNotificationService` en `EventsService.create()`
5. Probar flujo completo end-to-end
6. Personalizar ícono y sonido de notificaciones

## Soporte

Para cualquier duda o problema:
1. Revisar logs detallados (muy verbosos por diseño)
2. Verificar configuración de Firebase
3. Confirmar que el token FCM está registrado en el backend
4. Verificar que el servicio está registrado en AndroidManifest.xml

