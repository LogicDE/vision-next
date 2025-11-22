package com.example.vision_next2.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.vision_next2.data.local.TokenStorage
import com.example.vision_next2.data.network.NetworkModule
import com.example.vision_next2.data.network.employee.EventDto
import com.example.vision_next2.data.repository.EmployeeRepository
import com.example.vision_next2.ui.viewmodel.AuthViewModel
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import kotlin.collections.emptyList
import kotlin.collections.groupBy
import kotlin.collections.isNotEmpty
import kotlin.text.contains

@Composable
fun EventsScreen(authViewModel: AuthViewModel) {
    val context = LocalContext.current
    val tokenStorage = remember { TokenStorage(context) }
    val repository = remember(tokenStorage) {
        EmployeeRepository(
            NetworkModule.provideEmployeeApi(tokenStorage),
            NetworkModule.provideAuthApiWithClient(tokenStorage),
            tokenStorage
        )
    }
    val profile by authViewModel.profile.collectAsState()
    val isAdmin = profile?.rol?.equals("Admin", ignoreCase = true) == true
    var events by remember { mutableStateOf<List<EventDto>>(emptyList()) }
    var total by remember { mutableStateOf(0) }
    var page by remember { mutableStateOf(1) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun load(pageToLoad: Int, reset: Boolean = false) {
        if (isAdmin) return
        scope.launch {
            loading = true
            val result = repository.getEvents(pageToLoad, 5)
            if (result.isSuccess) {
                val payload = result.getOrNull()
                if (payload != null) {
                    page = payload.page
                    total = payload.total
                    events = if (reset) payload.items else events + payload.items
                    error = null
                }
            } else {
                error = result.exceptionOrNull()?.message ?: "Error al cargar eventos"
            }
            loading = false
        }
    }

    LaunchedEffect(isAdmin) {
        if (profile == null) authViewModel.loadProfile()
        if (!isAdmin) load(1, reset = true)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Eventos", style = MaterialTheme.typography.headlineSmall)
        when {
            isAdmin -> AdminInfoMessage()
            error?.contains("403", true) == true -> Text(
                text = "No tienes acceso a estos eventos. Usa una cuenta de empleado.",
                color = MaterialTheme.colorScheme.error
            )
            error != null -> Text(text = error ?: "", color = MaterialTheme.colorScheme.error)
        }
        if (!isAdmin && loading && events.isEmpty()) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.height(8.dp))
                Text("Cargando eventos...")
            }
        } else if (!isAdmin) {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                val grouped = events.groupBy { it.group?.id ?: -1 }
                if (grouped.isEmpty()) {
                    item {
                        Text(
                            text = "No hay eventos asignados.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    grouped.forEach { (groupId, groupEvents) ->
                        val groupName = groupEvents.firstOrNull()?.group?.name ?: "Sin grupo"
                        item(key = "event-header-$groupId") {
                            Text(
                                text = groupName,
                                style = MaterialTheme.typography.titleSmall,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )
                        }
                        if (groupEvents.isEmpty()) {
                            item(key = "event-empty-$groupId") {
                                Text(
                                    text = "No hay contenido asignado en este grupo.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
                                )
                            }
                        } else {
                            items(groupEvents, key = { it.id }) { event ->
                                EventCard(event)
                            }
                        }
                    }
                }
                item {
                    if (events.size < total && !loading) {
                        Button(
                            onClick = { load(page + 1) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Cargar más eventos")
                        }
                    } else if (loading && events.isNotEmpty()) {
                        CircularProgressIndicator(modifier = Modifier.padding(vertical = 12.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun EventCard(event: EventDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(text = event.titleMessage, style = MaterialTheme.typography.titleMedium)
            event.coordinatorName?.let {
                Text(text = "Coordinador: $it", style = MaterialTheme.typography.bodyMedium)
            }
            Text(
                text = "Grupo: ${event.group?.name ?: "Sin asignar"}",
                style = MaterialTheme.typography.bodySmall
            )
            Text(
                text = "Inicio: ${event.startAt?.let { formatTimestamp(it) } ?: "Por confirmar"}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = "Fin: ${event.endAt?.let { formatTimestamp(it) } ?: "Por confirmar"}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

private fun formatTimestamp(iso: String): String {
    return try {
        val instant = Instant.parse(iso)
        val formatter = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")
        instant.atZone(ZoneId.systemDefault()).format(formatter)
    } catch (_: Exception) {
        iso
    }
}

@Composable
private fun AdminInfoMessage() {
    Text(
        text = "Los administradores no son empleados. Inicia sesión con una cuenta de empleado para visualizar eventos.",
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
}
