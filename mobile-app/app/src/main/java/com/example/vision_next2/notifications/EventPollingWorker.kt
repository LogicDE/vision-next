/**
 * Event Polling Worker
 * 
 * Este Worker usa WorkManager para verificar periódicamente si hay nuevos eventos
 * y mostrar notificaciones cuando se detecta uno nuevo.
 * 
 * Funcionalidad:
 * - Hace polling al endpoint /events/me cada cierto tiempo
 * - Compara eventos con los últimos conocidos
 * - Muestra notificaciones locales cuando detecta eventos nuevos
 * 
 * NOTA: Este código no modifica funcionalidad existente.
 */

package com.example.vision_next2.notifications

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.vision_next2.data.local.TokenStorage
import com.example.vision_next2.data.network.NetworkModule
import com.example.vision_next2.data.repository.EmployeeRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * TAG para los logs de este worker
 */
private const val TAG = "EventPollingWorker"

/**
 * Clave para SharedPreferences donde guardamos el último evento conocido
 */
private const val PREFS_NAME = "event_notifications_prefs"
private const val KEY_LAST_EVENT_ID = "last_event_id"
private const val KEY_LAST_CHECK_TIME = "last_check_time"

/**
 * Worker que verifica periódicamente si hay nuevos eventos
 * 
 * Este worker se ejecuta periódicamente usando WorkManager y:
 * 1. Obtiene los eventos del usuario desde el backend
 * 2. Compara con el último evento conocido
 * 3. Si hay eventos nuevos, muestra notificaciones
 */
class EventPollingWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    /**
     * Ejecuta el trabajo de polling
     * 
     * @return Result.success() si el trabajo se completó exitosamente
     *         Result.retry() si debe reintentarse
     *         Result.failure() si falló definitivamente
     */
    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        Log.d(TAG, "=== INICIO: Polling de eventos ===")
        
        try {
            // Obtener el token de autenticación
            val tokenStorage = TokenStorage(applicationContext)
            val token = tokenStorage.getAccessToken()
            
            if (token == null) {
                Log.w(TAG, "No hay token de autenticación. Saltando polling.")
                Log.d(TAG, "=== FIN: Polling cancelado (sin autenticación) ===")
                return@withContext Result.success() // No es un error, solo no hay usuario autenticado
            }
            
            Log.d(TAG, "Token de autenticación encontrado. Iniciando consulta de eventos...")
            
            // Crear repositorio y obtener eventos
            val employeeApi = NetworkModule.provideEmployeeApi(tokenStorage)
            val authApi = NetworkModule.provideAuthApiWithClient(tokenStorage)
            val repository = EmployeeRepository(employeeApi, authApi, tokenStorage)
            
            Log.d(TAG, "Consultando eventos del usuario...")
            val result = repository.getEvents(page = 1, limit = 10)
            
            if (result.isFailure) {
                val error = result.exceptionOrNull()
                Log.e(TAG, "Error al obtener eventos: ${error?.message}")
                Log.d(TAG, "=== FIN: Polling fallido ===")
                return@withContext Result.retry() // Reintentar más tarde
            }
            
            val eventsPage = result.getOrNull()
            if (eventsPage == null || eventsPage.items.isEmpty()) {
                Log.d(TAG, "No hay eventos disponibles")
                Log.d(TAG, "=== FIN: Polling completado (sin eventos) ===")
                return@withContext Result.success()
            }
            
            Log.d(TAG, "Eventos obtenidos: ${eventsPage.items.size}")
            
            // Obtener el último evento conocido
            val prefs = applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val lastEventId = prefs.getInt(KEY_LAST_EVENT_ID, -1)
            
            Log.d(TAG, "Último evento conocido: $lastEventId")
            
            // Buscar eventos nuevos (con ID mayor al último conocido)
            val newEvents = eventsPage.items.filter { event ->
                event.id > lastEventId
            }.sortedBy { it.id } // Ordenar por ID para procesar en orden
            
            if (newEvents.isEmpty()) {
                Log.d(TAG, "No hay eventos nuevos")
                Log.d(TAG, "=== FIN: Polling completado (sin eventos nuevos) ===")
                return@withContext Result.success()
            }
            
            Log.d(TAG, "Eventos nuevos detectados: ${newEvents.size}")
            
            // Inicializar canal de notificaciones
            EventNotificationManager.initializeNotificationChannel(applicationContext)
            
            // Mostrar notificación para cada evento nuevo
            for (event in newEvents) {
                Log.d(TAG, "Mostrando notificación para evento ID: ${event.id}, Título: ${event.titleMessage}")
                
                EventNotificationManager.showEventNotification(
                    context = applicationContext,
                    title = "Nuevo evento",
                    message = "¡Descubre de qué trata!",
                    eventId = event.id,
                    groupId = event.group?.id
                )
                
                // Actualizar el último evento conocido
                prefs.edit().putInt(KEY_LAST_EVENT_ID, event.id).apply()
            }
            
            // Actualizar tiempo de última verificación
            prefs.edit().putLong(KEY_LAST_CHECK_TIME, System.currentTimeMillis()).apply()
            
            Log.d(TAG, "=== FIN: Polling completado exitosamente ===")
            return@withContext Result.success()
            
        } catch (e: Exception) {
            Log.e(TAG, "=== ERROR CRÍTICO: Fallo en polling de eventos ===")
            Log.e(TAG, "Tipo de excepción: ${e.javaClass.simpleName}")
            Log.e(TAG, "Mensaje: ${e.message ?: "No disponible"}")
            Log.e(TAG, "Stack trace:", e)
            Log.e(TAG, "=== FIN: Polling terminado con errores ===")
            return@withContext Result.retry() // Reintentar más tarde
        }
    }
    
    /**
     * Inicializa el polling periódico de eventos
     * 
     * Este método debe ser llamado desde la aplicación para iniciar el polling
     * 
     * @param context - Contexto de la aplicación
     */
    companion object {
        /**
         * Inicia el polling periódico de eventos
         * 
         * @param context - Contexto de la aplicación
         */
        fun startPeriodicPolling(context: Context) {
            Log.d(TAG, "=== INICIO: Configuración de polling periódico ===")
            
            try {
                val workManager = androidx.work.WorkManager.getInstance(context)
                
                // Crear una solicitud de trabajo periódico
                // Se ejecutará cada 15 minutos aproximadamente
                val constraints = androidx.work.Constraints.Builder()
                    .setRequiredNetworkType(androidx.work.NetworkType.CONNECTED)
                    .build()
                
                val periodicWork = androidx.work.PeriodicWorkRequestBuilder<EventPollingWorker>(
                    15, // Intervalo mínimo: 15 minutos
                    java.util.concurrent.TimeUnit.MINUTES
                )
                    .setConstraints(constraints)
                    .addTag("event_polling")
                    .build()
                
                // Programar el trabajo (WorkManager maneja automáticamente los duplicados)
                workManager.enqueueUniquePeriodicWork(
                    "event_polling_work",
                    androidx.work.ExistingPeriodicWorkPolicy.KEEP, // Mantener el trabajo existente
                    periodicWork
                )
                
                Log.d(TAG, "Polling periódico configurado exitosamente")
                Log.d(TAG, "Intervalo: 15 minutos")
                Log.d(TAG, "=== FIN: Configuración completada ===")
                
            } catch (e: Exception) {
                Log.e(TAG, "Error al configurar polling periódico: ${e.message}")
                Log.e(TAG, "Stack trace:", e)
            }
        }
        
        /**
         * Detiene el polling periódico de eventos
         * 
         * @param context - Contexto de la aplicación
         */
        fun stopPeriodicPolling(context: Context) {
            Log.d(TAG, "Deteniendo polling periódico...")
            try {
                val workManager = androidx.work.WorkManager.getInstance(context)
                workManager.cancelUniqueWork("event_polling_work")
                Log.d(TAG, "Polling periódico detenido")
            } catch (e: Exception) {
                Log.e(TAG, "Error al detener polling: ${e.message}")
            }
        }
    }
}

