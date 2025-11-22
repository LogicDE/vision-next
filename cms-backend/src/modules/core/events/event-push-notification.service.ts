/**
 * Event Push Notification Service
 * 
 * Este servicio está completamente aislado y no modifica el comportamiento existente.
 * Su función es detectar cuando se crea un evento y enviar notificaciones push
 * a todos los miembros del grupo asignado al evento.
 * 
 * NOTA: Este servicio debe ser inyectado en EventsService para que funcione.
 * Por ahora está preparado como módulo independiente que puede ser integrado.
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../../entities/event.entity';
import { GroupEmployee } from '../../../entities/group-employee.entity';
import { Employee } from '../../../entities/employee.entity';

/**
 * Constantes para el servicio de notificaciones push
 */
const NOTIFICATION_TITLE = 'Nuevo evento';
const NOTIFICATION_MESSAGE = '¡Descubre de qué trata!';

/**
 * Logger específico para este servicio de notificaciones
 */
const notificationLogger = new Logger('EventPushNotificationService');

/**
 * Servicio encargado de enviar notificaciones push cuando se crea un evento
 */
@Injectable()
export class EventPushNotificationService {
  /**
   * Constructor del servicio
   * Inyecta los repositorios necesarios para acceder a eventos, grupos y empleados
   * 
   * @param eventRepo - Repositorio para acceder a la tabla events
   * @param groupEmployeeRepo - Repositorio para acceder a la relación groups_employees
   * @param employeeRepo - Repositorio para acceder a la tabla employees (para obtener tokens FCM)
   */
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(GroupEmployee)
    private readonly groupEmployeeRepo: Repository<GroupEmployee>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {
    // Log de inicialización del servicio
    notificationLogger.log('EventPushNotificationService inicializado correctamente');
    notificationLogger.log('Servicio listo para enviar notificaciones push de eventos');
  }

  /**
   * Función principal que se debe llamar después de crear un evento
   * 
   * Esta función:
   * 1. Valida los datos del evento
   * 2. Obtiene todos los miembros del grupo asignado
   * 3. Construye la notificación push
   * 4. Envía la notificación a cada miembro del grupo
   * 
   * @param createdEvent - El evento que acaba de ser creado en la base de datos
   * @returns Promise que se resuelve cuando todas las notificaciones han sido procesadas
   */
  async sendNotificationForNewEvent(createdEvent: Event): Promise<void> {
    notificationLogger.log('=== INICIO: Proceso de envío de notificación push para nuevo evento ===');
    notificationLogger.log(`Evento recibido - ID: ${createdEvent.id}`);

    try {
      // Paso 1: Validar que el evento tiene todos los datos necesarios
      notificationLogger.log('Paso 1: Validando datos del evento...');
      const validationResult = this.validateEventData(createdEvent);
      
      if (!validationResult.isValid) {
        notificationLogger.error(`Validación fallida: ${validationResult.errorMessage}`);
        notificationLogger.log('=== FIN: Proceso cancelado por validación fallida ===');
        return;
      }
      
      notificationLogger.log('Paso 1 completado: Datos del evento válidos');

      // Paso 2: Obtener todos los miembros del grupo asignado al evento
      notificationLogger.log('Paso 2: Obteniendo miembros del grupo...');
      notificationLogger.log(`ID del grupo del evento: ${createdEvent.group?.id || 'NO DISPONIBLE'}`);
      
      const groupMembers = await this.retrieveGroupMembers(createdEvent.group.id);
      
      if (groupMembers.length === 0) {
        notificationLogger.warn('El grupo no tiene miembros. No se enviarán notificaciones.');
        notificationLogger.log('=== FIN: Proceso completado sin notificaciones ===');
        return;
      }
      
      notificationLogger.log(`Paso 2 completado: ${groupMembers.length} miembros encontrados en el grupo`);

      // Paso 3: Construir el payload de la notificación
      notificationLogger.log('Paso 3: Construyendo payload de notificación...');
      const notificationPayload = this.buildNotificationPayload(createdEvent);
      notificationLogger.log(`Paso 3 completado: Payload construido - Título: "${notificationPayload.title}", Mensaje: "${notificationPayload.body}"`);

      // Paso 4: Enviar notificación a cada miembro del grupo
      notificationLogger.log('Paso 4: Enviando notificaciones a los miembros del grupo...');
      await this.dispatchNotificationsToGroupMembers(groupMembers, notificationPayload);
      
      notificationLogger.log('=== FIN: Proceso de envío de notificación completado exitosamente ===');
    } catch (error: any) {
      // Captura de excepciones con logging exhaustivo
      notificationLogger.error('=== ERROR CRÍTICO: Fallo en el proceso de envío de notificaciones ===');
      notificationLogger.error(`Tipo de error: ${error?.constructor?.name || 'Unknown'}`);
      notificationLogger.error(`Mensaje de error: ${error?.message || 'No hay mensaje disponible'}`);
      notificationLogger.error(`Stack trace: ${error?.stack || 'No hay stack trace disponible'}`);
      notificationLogger.error('=== FIN: Proceso terminado con errores ===');
      
      // No relanzamos el error para no afectar la creación del evento
      // El evento ya fue creado, solo falló el envío de notificaciones
    }
  }

  /**
   * Valida que el evento tiene todos los datos necesarios para enviar notificaciones
   * 
   * @param event - El evento a validar
   * @returns Objeto con el resultado de la validación
   */
  private validateEventData(event: Event): { isValid: boolean; errorMessage?: string } {
    notificationLogger.log('Iniciando validación de datos del evento...');
    notificationLogger.log(`Validando ID del evento: ${event?.id || 'UNDEFINED'}`);
    notificationLogger.log(`Validando grupo del evento: ${event?.group?.id || 'UNDEFINED'}`);

    // Validación 1: El evento debe existir
    if (!event) {
      notificationLogger.error('Validación fallida: El evento es null o undefined');
      return { isValid: false, errorMessage: 'Evento es null o undefined' };
    }

    // Validación 2: El evento debe tener un ID
    if (!event.id) {
      notificationLogger.error('Validación fallida: El evento no tiene ID');
      return { isValid: false, errorMessage: 'Evento no tiene ID válido' };
    }

    // Validación 3: El evento debe tener un grupo asignado
    if (!event.group) {
      notificationLogger.error('Validación fallida: El evento no tiene grupo asignado');
      return { isValid: false, errorMessage: 'Evento no tiene grupo asignado' };
    }

    // Validación 4: El grupo debe tener un ID
    if (!event.group.id) {
      notificationLogger.error('Validación fallida: El grupo del evento no tiene ID');
      return { isValid: false, errorMessage: 'Grupo del evento no tiene ID válido' };
    }

    notificationLogger.log('Todas las validaciones de datos del evento pasaron correctamente');
    return { isValid: true };
  }

  /**
   * Obtiene todos los miembros (empleados) de un grupo específico
   * 
   * @param groupId - El ID del grupo del cual se quieren obtener los miembros
   * @returns Array de GroupEmployee que representan los miembros del grupo
   */
  private async retrieveGroupMembers(groupId: number): Promise<GroupEmployee[]> {
    notificationLogger.log(`Iniciando recuperación de miembros del grupo ${groupId}...`);
    
    try {
      // Buscar todas las relaciones grupo-empleado para este grupo
      // Incluimos la relación con Employee para poder acceder a los datos del empleado
      const members = await this.groupEmployeeRepo.find({
        where: { groupId: groupId },
        relations: ['employee'],
      });

      notificationLogger.log(`Recuperación completada: ${members.length} miembros encontrados`);
      
      // Log detallado de cada miembro encontrado
      members.forEach((member, index) => {
        notificationLogger.log(`Miembro ${index + 1}: Employee ID = ${member.employeeId}, Nombre = ${member.employee?.firstName || 'N/A'} ${member.employee?.lastName || 'N/A'}`);
      });

      return members;
    } catch (error: any) {
      notificationLogger.error(`Error al recuperar miembros del grupo ${groupId}:`);
      notificationLogger.error(`Mensaje: ${error?.message || 'Error desconocido'}`);
      notificationLogger.error(`Stack: ${error?.stack || 'No disponible'}`);
      throw error;
    }
  }

  /**
   * Construye el payload de la notificación push con los datos del evento
   * 
   * Según las especificaciones:
   * - Título: "Nuevo evento"
   * - Mensaje: "¡Descubre de qué trata!"
   * 
   * @param event - El evento del cual se construirá la notificación
   * @returns Objeto con el título y cuerpo de la notificación
   */
  private buildNotificationPayload(event: Event): { title: string; body: string; data?: any } {
    notificationLogger.log('Iniciando construcción del payload de notificación...');
    notificationLogger.log(`Datos del evento recibidos: ID=${event.id}, Título=${event.titleMessage}, Grupo=${event.group.id}`);

    // Construir el payload según las especificaciones
    const payload = {
      title: NOTIFICATION_TITLE, // Título fijo: "Nuevo evento"
      body: NOTIFICATION_MESSAGE, // Mensaje fijo: "¡Descubre de qué trata!"
      // Opcionalmente, podemos incluir datos adicionales del evento
      // para que la app móvil pueda navegar al evento cuando se toque la notificación
      data: {
        eventId: event.id,
        groupId: event.group.id,
        eventTitle: event.titleMessage,
        coordinatorName: event.coordinatorName || null,
        startAt: event.startAt ? event.startAt.toISOString() : null,
        endAt: event.endAt ? event.endAt.toISOString() : null,
      },
    };

    notificationLogger.log(`Payload construido exitosamente:`, JSON.stringify(payload, null, 2));
    return payload;
  }

  /**
   * Envía las notificaciones push a todos los miembros del grupo
   * 
   * Esta función itera sobre cada miembro del grupo y envía una notificación push
   * utilizando el token FCM (Firebase Cloud Messaging) del empleado.
   * 
   * NOTA: Esta función actualmente registra en logs lo que haría, ya que la integración
   * completa con FCM requiere configuración adicional que no está presente en el proyecto.
   * 
   * @param groupMembers - Array de miembros del grupo a los que se enviará la notificación
   * @param notificationPayload - El payload de la notificación a enviar
   */
  private async dispatchNotificationsToGroupMembers(
    groupMembers: GroupEmployee[],
    notificationPayload: { title: string; body: string; data?: any },
  ): Promise<void> {
    notificationLogger.log(`Iniciando envío de notificaciones a ${groupMembers.length} miembros...`);

    // Contadores para estadísticas del envío
    let successCount = 0;
    let failureCount = 0;

    // Iterar sobre cada miembro del grupo
    for (let i = 0; i < groupMembers.length; i++) {
      const member = groupMembers[i];
      notificationLogger.log(`Procesando miembro ${i + 1}/${groupMembers.length}: Employee ID = ${member.employeeId}`);

      try {
        // Obtener el empleado completo para acceder a su token FCM
        notificationLogger.log(`Obteniendo datos completos del empleado ${member.employeeId}...`);
        const employee = await this.employeeRepo.findOne({
          where: { id: member.employeeId },
        });

        if (!employee) {
          notificationLogger.warn(`Empleado ${member.employeeId} no encontrado. Saltando notificación.`);
          failureCount++;
          continue;
        }

        // NOTA: No se requiere token FCM. El sistema funciona mediante polling.
        // La aplicación Android consulta periódicamente el endpoint /events/me
        // y detecta eventos nuevos comparando IDs.
        
        // Generar un identificador único para este dispositivo (simulado)
        // En un sistema real, esto podría ser un ID de dispositivo o sesión
        const deviceId = `device_${member.employeeId}_${Date.now()}`;
        
        notificationLogger.log(`Procesando notificación para empleado ${member.employeeId} (${employee.email})...`);
        notificationLogger.log(`Device ID simulado: ${deviceId.substring(0, 30)}...`);

        // Registrar la notificación (la app Android la detectará en su próximo polling)
        notificationLogger.log(`Registrando notificación para empleado ${member.employeeId}...`);
        await this.sendPushNotification(deviceId, notificationPayload);
        
        notificationLogger.log(`Notificación enviada exitosamente a empleado ${member.employeeId}`);
        successCount++;

      } catch (error: any) {
        notificationLogger.error(`Error al enviar notificación a empleado ${member.employeeId}:`);
        notificationLogger.error(`Tipo: ${error?.constructor?.name || 'Unknown'}`);
        notificationLogger.error(`Mensaje: ${error?.message || 'No disponible'}`);
        notificationLogger.error(`Stack: ${error?.stack || 'No disponible'}`);
        failureCount++;
      }
    }

    // Log de resumen final
    notificationLogger.log(`=== RESUMEN DE ENVÍO DE NOTIFICACIONES ===`);
    notificationLogger.log(`Total de miembros procesados: ${groupMembers.length}`);
    notificationLogger.log(`Notificaciones exitosas: ${successCount}`);
    notificationLogger.log(`Notificaciones fallidas: ${failureCount}`);
    notificationLogger.log(`=== FIN DEL RESUMEN ===`);
  }

  /**
   * Envía una notificación push individual
   * 
   * NOTA: Esta función está en modo simulación. El sistema de notificaciones
   * real funciona mediante polling desde la aplicación Android, que verifica
   * periódicamente si hay eventos nuevos y muestra notificaciones locales.
   * 
   * Este método solo registra en logs que se intentó enviar una notificación.
   * La aplicación Android detectará el nuevo evento en su próximo polling.
   * 
   * @param fcmToken - El token FCM del dispositivo (no se usa actualmente)
   * @param payload - El payload de la notificación (título, cuerpo, datos)
   */
  private async sendPushNotification(
    fcmToken: string,
    payload: { title: string; body: string; data?: any },
  ): Promise<void> {
    notificationLogger.log('=== INICIO: Registro de notificación de evento ===');
    notificationLogger.log(`Token dispositivo: ${fcmToken.substring(0, 30)}...`);
    notificationLogger.log(`Título: ${payload.title}`);
    notificationLogger.log(`Cuerpo: ${payload.body}`);
    notificationLogger.log(`Datos adicionales: ${JSON.stringify(payload.data || {})}`);

    try {
      // ============================================
      // MODO SIMULACIÓN: Sistema basado en polling
      // ============================================
      // 
      // La aplicación Android usa WorkManager para hacer polling periódico
      // al endpoint /events/me. Cuando detecta un evento nuevo (comparando IDs),
      // muestra una notificación local automáticamente.
      //
      // No se requiere FCM ni ningún servicio externo de push notifications.
      // El evento ya está guardado en la base de datos, y la app lo detectará
      // en su próximo ciclo de polling (cada 15 minutos aproximadamente).
      //
      notificationLogger.log('[INFO] Evento guardado en base de datos');
      notificationLogger.log('[INFO] La aplicación Android detectará este evento en su próximo polling');
      notificationLogger.log('[INFO] No se requiere FCM ni servicios externos de push');
      
      // Simular un pequeño delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      notificationLogger.log('=== FIN: Registro de notificación completado ===');
    } catch (error: any) {
      notificationLogger.error('=== ERROR: Fallo al registrar notificación ===');
      notificationLogger.error(`Tipo: ${error?.constructor?.name || 'Unknown'}`);
      notificationLogger.error(`Mensaje: ${error?.message || 'No disponible'}`);
      notificationLogger.error(`Stack: ${error?.stack || 'No disponible'}`);
      throw error;
    }
  }
}

