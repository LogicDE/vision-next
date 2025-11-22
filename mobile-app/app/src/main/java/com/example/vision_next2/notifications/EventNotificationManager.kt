/**
 * Event Notification Manager
 * 
 * Este archivo está completamente aislado y maneja la recepción y visualización
 * de notificaciones push cuando se crea un nuevo evento en el sistema.
 * 
 * Funcionalidad:
 * 1. Recibe notificaciones push de Firebase Cloud Messaging (FCM)
 * 2. Construye y muestra la notificación usando NotificationCompat
 * 3. Maneja la interacción del usuario con las notificaciones
 * 
 * NOTA: Este código no modifica ninguna funcionalidad existente.
 */

package com.example.vision_next2.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.vision_next2.MainActivity

/**
 * TAG para los logs de este módulo
 * Permite filtrar los logs relacionados con notificaciones de eventos
 */
private const val TAG = "EventNotificationManager"

/**
 * ID del canal de notificaciones para eventos
 * Debe ser único dentro de la aplicación
 */
private const val CHANNEL_ID = "event_notifications_channel"

/**
 * ID único para las notificaciones de eventos
 * Se puede incrementar para múltiples notificaciones
 */
private const val NOTIFICATION_ID = 1001

/**
 * Nombre descriptivo del canal de notificaciones (visible para el usuario)
 */
private const val CHANNEL_NAME = "Notificaciones de Eventos"

/**
 * Descripción del canal de notificaciones (visible para el usuario en configuración)
 */
private const val CHANNEL_DESCRIPTION = "Notificaciones sobre nuevos eventos y actividades del grupo"

/**
 * Clase principal para gestionar notificaciones de eventos
 * 
 * Esta clase proporciona métodos estáticos para:
 * - Crear el canal de notificaciones (requerido en Android 8.0+)
 * - Construir y mostrar notificaciones push
 * - Manejar los datos recibidos en las notificaciones
 */
object EventNotificationManager {
    
    /**
     * Inicializa el canal de notificaciones para eventos
     * 
     * Este método DEBE ser llamado antes de mostrar cualquier notificación
     * en dispositivos con Android 8.0 (API 26) o superior.
     * 
     * @param context - Contexto de la aplicación (puede ser Application, Activity, etc.)
     */
    fun initializeNotificationChannel(context: Context) {
        Log.d(TAG, "=== INICIO: Inicialización del canal de notificaciones ===")
        Log.d(TAG, "Context recibido: ${context.javaClass.simpleName}")
        
        // Verificar que estamos en Android 8.0 o superior
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Log.d(TAG, "Versión de Android detectada: ${Build.VERSION.SDK_INT} (requiere canal)")
            
            try {
                // Obtener el NotificationManager del sistema
                Log.d(TAG, "Obteniendo NotificationManager del sistema...")
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                Log.d(TAG, "NotificationManager obtenido exitosamente")
                
                // Verificar si el canal ya existe
                Log.d(TAG, "Verificando si el canal '$CHANNEL_ID' ya existe...")
                val existingChannel = notificationManager.getNotificationChannel(CHANNEL_ID)
                
                if (existingChannel != null) {
                    Log.d(TAG, "Canal ya existe. No es necesario crearlo nuevamente.")
                    Log.d(TAG, "Nombre del canal existente: ${existingChannel.name}")
                    Log.d(TAG, "Descripción: ${existingChannel.description}")
                    Log.d(TAG, "Importancia: ${existingChannel.importance}")
                    Log.d(TAG, "=== FIN: Canal ya existe, inicialización completada ===")
                    return
                }
                
                // Crear el canal de notificaciones
                Log.d(TAG, "Canal no existe. Creando nuevo canal de notificaciones...")
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_DEFAULT // Importancia por defecto
                ).apply {
                    description = CHANNEL_DESCRIPTION
                    // Configurar sonido por defecto del sistema
                    setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION), null)
                    // Habilitar vibración
                    enableVibration(true)
                    // Configurar patrón de vibración (1 segundo)
                    vibrationPattern = longArrayOf(0, 1000, 500, 1000)
                }
                
                Log.d(TAG, "Canal creado con configuración:")
                Log.d(TAG, "  - ID: $CHANNEL_ID")
                Log.d(TAG, "  - Nombre: $CHANNEL_NAME")
                Log.d(TAG, "  - Descripción: $CHANNEL_DESCRIPTION")
                Log.d(TAG, "  - Importancia: ${channel.importance}")
                
                // Registrar el canal en el sistema
                Log.d(TAG, "Registrando canal en el sistema...")
                notificationManager.createNotificationChannel(channel)
                Log.d(TAG, "Canal registrado exitosamente en el sistema")
                Log.d(TAG, "=== FIN: Inicialización del canal completada exitosamente ===")
                
            } catch (e: Exception) {
                Log.e(TAG, "=== ERROR: Fallo al inicializar el canal de notificaciones ===")
                Log.e(TAG, "Tipo de excepción: ${e.javaClass.simpleName}")
                Log.e(TAG, "Mensaje: ${e.message ?: "No disponible"}")
                Log.e(TAG, "Stack trace:", e)
                Log.e(TAG, "=== FIN: Inicialización fallida ===")
            }
        } else {
            // En versiones anteriores a Android 8.0, no se necesita canal
            Log.d(TAG, "Versión de Android: ${Build.VERSION.SDK_INT} (no requiere canal)")
            Log.d(TAG, "No es necesario crear canal de notificaciones")
            Log.d(TAG, "=== FIN: Inicialización completada (sin canal requerido) ===")
        }
    }
    
    /**
     * Construye y muestra una notificación de evento
     * 
     * Este método es llamado cuando se recibe una notificación push de FCM
     * o cuando se necesita mostrar una notificación de evento manualmente.
     * 
     * @param context - Contexto de la aplicación
     * @param title - Título de la notificación (ej: "Nuevo evento")
     * @param message - Mensaje de la notificación (ej: "¡Descubre de qué trata!")
     * @param eventId - ID del evento (opcional, para navegación)
     * @param groupId - ID del grupo (opcional, para navegación)
     */
    fun showEventNotification(
        context: Context,
        title: String,
        message: String,
        eventId: Int? = null,
        groupId: Int? = null
    ) {
        Log.d(TAG, "=== INICIO: Construcción y visualización de notificación de evento ===")
        Log.d(TAG, "Context: ${context.javaClass.simpleName}")
        Log.d(TAG, "Título: $title")
        Log.d(TAG, "Mensaje: $message")
        Log.d(TAG, "Event ID: ${eventId ?: "NO DISPONIBLE"}")
        Log.d(TAG, "Group ID: ${groupId ?: "NO DISPONIBLE"}")
        
        try {
            // Paso 1: Validar parámetros de entrada
            Log.d(TAG, "Paso 1: Validando parámetros de entrada...")
            val validationResult = validateNotificationParameters(title, message)
            
            if (!validationResult.isValid) {
                Log.e(TAG, "Validación fallida: ${validationResult.errorMessage}")
                Log.e(TAG, "=== FIN: Proceso cancelado por validación fallida ===")
                return
            }
            Log.d(TAG, "Paso 1 completado: Parámetros válidos")
            
            // Paso 2: Crear Intent para cuando el usuario toque la notificación
            Log.d(TAG, "Paso 2: Creando Intent para acción al tocar la notificación...")
            val intent = createNotificationIntent(context, eventId, groupId)
            Log.d(TAG, "Intent creado exitosamente")
            
            // Paso 3: Crear PendingIntent
            Log.d(TAG, "Paso 3: Creando PendingIntent...")
            val pendingIntent = createPendingIntent(context, intent)
            Log.d(TAG, "PendingIntent creado exitosamente")
            
            // Paso 4: Construir la notificación usando NotificationCompat
            Log.d(TAG, "Paso 4: Construyendo objeto NotificationCompat...")
            val notification = buildNotificationCompat(context, title, message, pendingIntent)
            Log.d(TAG, "NotificationCompat construido exitosamente")
            
            // Paso 5: Obtener NotificationManager y mostrar la notificación
            Log.d(TAG, "Paso 5: Obteniendo NotificationManager...")
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            Log.d(TAG, "NotificationManager obtenido exitosamente")
            
            Log.d(TAG, "Mostrando notificación con ID: $NOTIFICATION_ID")
            notificationManager.notify(NOTIFICATION_ID, notification)
            Log.d(TAG, "Notificación mostrada exitosamente en el sistema")
            
            Log.d(TAG, "=== FIN: Notificación de evento mostrada exitosamente ===")
            
        } catch (e: Exception) {
            Log.e(TAG, "=== ERROR CRÍTICO: Fallo al mostrar notificación de evento ===")
            Log.e(TAG, "Tipo de excepción: ${e.javaClass.simpleName}")
            Log.e(TAG, "Mensaje: ${e.message ?: "No disponible"}")
            Log.e(TAG, "Stack trace:", e)
            Log.e(TAG, "=== FIN: Proceso terminado con errores ===")
        }
    }
    
    /**
     * Valida que los parámetros de la notificación sean válidos
     * 
     * @param title - Título a validar
     * @param message - Mensaje a validar
     * @return Resultado de la validación con mensaje de error si aplica
     */
    private fun validateNotificationParameters(
        title: String?,
        message: String?
    ): ValidationResult {
        Log.d(TAG, "Iniciando validación de parámetros de notificación...")
        Log.d(TAG, "Título recibido: ${title ?: "NULL"}")
        Log.d(TAG, "Mensaje recibido: ${message ?: "NULL"}")
        
        // Validar que el título no sea nulo o vacío
        if (title.isNullOrBlank()) {
            Log.e(TAG, "Validación fallida: Título es null o vacío")
            return ValidationResult(false, "Título de notificación es null o vacío")
        }
        
        // Validar que el mensaje no sea nulo o vacío
        if (message.isNullOrBlank()) {
            Log.e(TAG, "Validación fallida: Mensaje es null o vacío")
            return ValidationResult(false, "Mensaje de notificación es null o vacío")
        }
        
        Log.d(TAG, "Validación completada: Todos los parámetros son válidos")
        return ValidationResult(true, null)
    }
    
    /**
     * Crea un Intent que se ejecutará cuando el usuario toque la notificación
     * 
     * Este Intent puede navegar a una pantalla específica del evento o a la pantalla principal
     * 
     * @param context - Contexto de la aplicación
     * @param eventId - ID del evento (opcional)
     * @param groupId - ID del grupo (opcional)
     * @return Intent configurado para abrir la aplicación
     */
    private fun createNotificationIntent(
        context: Context,
        eventId: Int?,
        groupId: Int?
    ): Intent {
        Log.d(TAG, "Creando Intent para acción de notificación...")
        
        // Intent para abrir MainActivity
        val intent = Intent(context, MainActivity::class.java).apply {
            // Configurar flags para crear una nueva tarea y limpiar la pila
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            
            // Agregar datos extra si están disponibles
            if (eventId != null) {
                Log.d(TAG, "Agregando eventId al Intent: $eventId")
                putExtra("event_id", eventId)
            }
            
            if (groupId != null) {
                Log.d(TAG, "Agregando groupId al Intent: $groupId")
                putExtra("group_id", groupId)
            }
            
            // Indicar que viene de una notificación
            putExtra("from_notification", true)
        }
        
        Log.d(TAG, "Intent creado exitosamente con flags y extras configurados")
        return intent
    }
    
    /**
     * Crea un PendingIntent que encapsula el Intent
     * 
     * PendingIntent permite al sistema ejecutar el Intent más tarde
     * 
     * @param context - Contexto de la aplicación
     * @param intent - Intent a encapsular
     * @return PendingIntent configurado
     */
    private fun createPendingIntent(context: Context, intent: Intent): PendingIntent {
        Log.d(TAG, "Creando PendingIntent...")
        
        val pendingIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // En Android 6.0+ usar FLAG_IMMUTABLE para mejor seguridad
            Log.d(TAG, "Usando FLAG_IMMUTABLE (Android ${Build.VERSION.SDK_INT})")
            PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        } else {
            // Versiones anteriores
            Log.d(TAG, "Usando flags estándar (Android ${Build.VERSION.SDK_INT})")
            PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT
            )
        }
        
        Log.d(TAG, "PendingIntent creado exitosamente")
        return pendingIntent
    }
    
    /**
     * Construye el objeto NotificationCompat con todas las configuraciones
     * 
     * Este es el método principal que construye la notificación según las especificaciones:
     * - Título: "Nuevo evento"
     * - Mensaje: "¡Descubre de qué trata!"
     * 
     * @param context - Contexto de la aplicación
     * @param title - Título de la notificación
     * @param message - Mensaje de la notificación
     * @param pendingIntent - PendingIntent para cuando se toque la notificación
     * @return NotificationCompat configurado y listo para mostrar
     */
    private fun buildNotificationCompat(
        context: Context,
        title: String,
        message: String,
        pendingIntent: PendingIntent
    ): android.app.Notification {
        Log.d(TAG, "=== INICIO: Construcción de NotificationCompat ===")
        Log.d(TAG, "Context: ${context.javaClass.simpleName}")
        Log.d(TAG, "Título: $title")
        Log.d(TAG, "Mensaje: $message")
        
        try {
            // Crear el builder de la notificación
            Log.d(TAG, "Creando NotificationCompat.Builder...")
            val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            
            Log.d(TAG, "Configurando propiedades de la notificación...")
            
            // Configurar el ícono pequeño (requerido)
            // NOTA: Se usa un ícono del sistema como fallback. En producción,
            // se debería agregar un ícono personalizado en res/drawable/
            Log.d(TAG, "Configurando ícono pequeño...")
            builder.setSmallIcon(android.R.drawable.ic_dialog_info)
            Log.d(TAG, "Ícono pequeño configurado: android.R.drawable.ic_dialog_info")
            
            // Configurar el título de la notificación
            Log.d(TAG, "Configurando título: '$title'")
            builder.setContentTitle(title)
            
            // Configurar el mensaje/texto de la notificación
            Log.d(TAG, "Configurando mensaje: '$message'")
            builder.setContentText(message)
            
            // Configurar la prioridad de la notificación
            // PRIORITY_DEFAULT: Se mostrará normalmente, pero no interrumpirá al usuario
            Log.d(TAG, "Configurando prioridad: PRIORITY_DEFAULT")
            builder.setPriority(NotificationCompat.PRIORITY_DEFAULT)
            
            // Configurar el PendingIntent (acción al tocar)
            Log.d(TAG, "Configurando PendingIntent para acción al tocar...")
            builder.setContentIntent(pendingIntent)
            Log.d(TAG, "PendingIntent configurado exitosamente")
            
            // Configurar auto-cancel: la notificación se elimina cuando se toca
            Log.d(TAG, "Configurando auto-cancel: true")
            builder.setAutoCancel(true)
            
            // Configurar sonido por defecto
            Log.d(TAG, "Configurando sonido de notificación...")
            val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            builder.setSound(defaultSoundUri)
            Log.d(TAG, "Sonido configurado: $defaultSoundUri")
            
            // Configurar vibración por defecto (1 segundo)
            Log.d(TAG, "Configurando patrón de vibración...")
            builder.setVibrate(longArrayOf(0, 1000, 500, 1000))
            Log.d(TAG, "Vibración configurada: [0, 1000, 500, 1000] ms")
            
            // Construir la notificación final
            Log.d(TAG, "Construyendo objeto Notification final...")
            val notification = builder.build()
            Log.d(TAG, "Notification construido exitosamente")
            
            Log.d(TAG, "=== FIN: NotificationCompat construido exitosamente ===")
            return notification
            
        } catch (e: Exception) {
            Log.e(TAG, "=== ERROR: Fallo al construir NotificationCompat ===")
            Log.e(TAG, "Tipo: ${e.javaClass.simpleName}")
            Log.e(TAG, "Mensaje: ${e.message ?: "No disponible"}")
            Log.e(TAG, "Stack trace:", e)
            throw e
        }
    }
    
    /**
     * Clase de datos para representar el resultado de una validación
     * 
     * @param isValid - Indica si la validación pasó
     * @param errorMessage - Mensaje de error si la validación falló (null si pasó)
     */
    private data class ValidationResult(
        val isValid: Boolean,
        val errorMessage: String?
    )
}

