package com.example.vision_next2.ui.screens

import android.util.Log
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
import com.example.vision_next2.data.network.employee.InterventionDto
import com.example.vision_next2.data.repository.EmployeeRepository
import com.example.vision_next2.ui.viewmodel.AuthViewModel
import kotlinx.coroutines.launch

@Composable
fun InterventionsScreen(authViewModel: AuthViewModel) {
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
    var interventions by remember { mutableStateOf<List<InterventionDto>>(emptyList()) }
    var total by remember { mutableStateOf(0) }
    var page by remember { mutableStateOf(1) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun load(pageToLoad: Int, reset: Boolean = false) {
        if (isAdmin) return
        scope.launch {
            loading = true
            Log.d("InterventionsScreen", "Requesting page=$pageToLoad reset=$reset")
            val result = repository.getInterventions(pageToLoad, 5)
            if (result.isSuccess) {
                val payload = result.getOrNull()
                if (payload != null) {
                    page = payload.page
                    total = payload.total
                    interventions = if (reset) payload.items else interventions + payload.items
                    error = null
                    Log.d("InterventionsScreen", "Loaded ${payload.items.size} interventions (total ${payload.total})")
                }
            } else {
                val errorMsg = result.exceptionOrNull()?.message ?: "Error al cargar intervenciones"
                error = errorMsg
                Log.e("InterventionsScreen", "Failed loading interventions: $errorMsg", result.exceptionOrNull())
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
        Text("Intervenciones activas", style = MaterialTheme.typography.headlineSmall)
        when {
            isAdmin -> AdminInfoMessage()
            error?.contains("403", true) == true -> Text(
                text = "No tienes acceso a estas intervenciones. Usa una cuenta de empleado.",
                color = MaterialTheme.colorScheme.error
            )
            error != null -> Text(text = error ?: "", color = MaterialTheme.colorScheme.error)
        }
        if (!isAdmin && loading && interventions.isEmpty()) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.height(8.dp))
                Text("Cargando intervenciones...")
            }
        } else if (!isAdmin) {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                val grouped = interventions.groupBy { it.group?.id ?: -1 }
                if (grouped.isEmpty()) {
                    item {
                        Text(
                            text = "No hay intervenciones asignadas.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    grouped.forEach { (groupId, groupInterventions) ->
                        val groupName = groupInterventions.firstOrNull()?.group?.name ?: "Sin grupo"
                        item(key = "interventions-header-$groupId") {
                            Text(
                                text = groupName,
                                style = MaterialTheme.typography.titleSmall,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )
                        }
                        if (groupInterventions.isEmpty()) {
                            item(key = "interventions-empty-$groupId") {
                                Text(
                                    text = "No hay contenido asignado en este grupo.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
                                )
                            }
                        } else {
                            items(groupInterventions, key = { it.id }) { intervention ->
                                InterventionCard(intervention)
                            }
                        }
                    }
                }
                item {
                    if (interventions.size < total && !loading) {
                        Button(
                            onClick = { load(page + 1) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Cargar más intervenciones")
                        }
                    } else if (loading && interventions.isNotEmpty()) {
                        CircularProgressIndicator(modifier = Modifier.padding(vertical = 12.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun AdminInfoMessage() {
    Text(
        text = "Los administradores no son empleados. Inicia sesión con una cuenta de empleado para visualizar intervenciones.",
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
}

@Composable
private fun InterventionCard(intervention: InterventionDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(text = intervention.titleMessage, style = MaterialTheme.typography.titleMedium)
            Text(text = intervention.bodyMessage, style = MaterialTheme.typography.bodyMedium)
            intervention.description?.let {
                Text(text = it, style = MaterialTheme.typography.bodySmall)
            }
            Text(
                text = "Grupo: ${intervention.group?.name ?: "Sin asignar"}",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
