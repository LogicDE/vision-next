package com.example.vision_next2.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
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
import com.example.vision_next2.data.network.employee.AssignedSurveyDto
import com.example.vision_next2.data.network.employee.SurveyQuestionDto
import com.example.vision_next2.data.repository.EmployeeRepository
import com.example.vision_next2.ui.viewmodel.AuthViewModel
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@Composable
fun SurveysScreen(authViewModel: AuthViewModel) {
    val context = LocalContext.current
    val tokenStorage = remember { TokenStorage(context) }
    val repository = remember(tokenStorage) {
        EmployeeRepository(
            NetworkModule.provideEmployeeApi(tokenStorage),
            NetworkModule.provideAuthApiWithClient(tokenStorage),
            tokenStorage
        )
    }
    val profileState = authViewModel.profile.collectAsState()
    val profile = profileState.value
    val isAdmin = profile?.rol?.equals("Admin", ignoreCase = true) == true

    var surveys by remember { mutableStateOf<List<AssignedSurveyDto>>(emptyList()) }
    var total by remember { mutableStateOf(0) }
    var page by remember { mutableStateOf(1) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var selectedSurvey by remember { mutableStateOf<AssignedSurveyDto?>(null) }
    val answers = remember { mutableStateMapOf<Int, Int>() }
    var submitting by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    fun loadPage(targetPage: Int, reset: Boolean = false) {
        if (isAdmin) return
        scope.launch {
            loading = true
            error = null
            try {
                val response = repository.getSurveys(targetPage, 5)
                if (response.isSuccess) {
                    val payload = response.getOrNull()
                    if (payload != null) {
                        page = payload.page
                        total = payload.total
                        surveys = if (reset) payload.items else surveys + payload.items
                        // Clear error if we got successful response
                        error = null
                    } else {
                        error = "No se recibieron datos"
                    }
                } else {
                    val exception = response.exceptionOrNull()
                    val errorMsg = exception?.message ?: "Error al cargar encuestas"
                    error = errorMsg
                    // Log for debugging
                    android.util.Log.e("SurveysScreen", "Error loading surveys: $errorMsg", exception)
                }
            } catch (e: Exception) {
                error = "Error inesperado: ${e.message}"
                android.util.Log.e("SurveysScreen", "Exception in loadPage", e)
            } finally {
                loading = false
            }
        }
    }

    LaunchedEffect(isAdmin) {
        if (profile == null) {
            authViewModel.loadProfile()
        }
        if (!isAdmin) {
            loadPage(1, reset = true)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Encuestas",
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedButton(
            onClick = { loadPage(1, reset = true) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Refrescar")
        }
        when {
            isAdmin -> {
                AdminInfoMessage()
            }
            error?.contains("403", true) == true -> {
                Text(
                    text = "No tienes acceso a estas encuestas. Inicia sesión con la cuenta del empleado para visualizar el contenido.",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            error != null -> {
                Text(
                    text = error ?: "",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }

        if (!isAdmin) {
            if (loading && surveys.isEmpty()) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator()
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Cargando encuestas...")
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.weight(1f, fill = true)
                ) {
                    val grouped = surveys.groupBy { it.group?.id ?: -1 }
                    if (grouped.isEmpty()) {
                        item {
                            Text(
                                text = "No hay encuestas asignadas todavía.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    } else {
                        grouped.forEach { (groupId, groupSurveys) ->
                            val groupName = groupSurveys.firstOrNull()?.group?.name ?: "Sin grupo"
                            item(key = "survey-header-$groupId") {
                                Text(
                                    text = groupName,
                                    style = MaterialTheme.typography.titleMedium,
                                    color = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.padding(vertical = 8.dp)
                                )
                            }
                            if (groupSurveys.isEmpty()) {
                                item(key = "survey-empty-$groupId") {
                                    Text(
                                        text = "No hay contenido asignado en este grupo.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
                                    )
                                }
                            } else {
                                // Sort: active first, then inactive
                                val sortedSurveys = groupSurveys.sortedWith(
                                    compareBy<AssignedSurveyDto> { !it.isActive }
                                        .thenByDescending { it.startAt ?: "" }
                                )
                                
                                items(sortedSurveys, key = { "${it.id}-${it.surveyVersionId}" }) { survey ->
                                    SurveyCard(
                                        survey = survey,
                                        onRespond = {
                                            selectedSurvey = survey
                                            answers.clear()
                                        }
                                    )
                                }
                            }
                        }
                    }
                    item {
                        if (surveys.size < total && !loading) {
                            Button(
                                onClick = { loadPage(page + 1) },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Cargar más")
                            }
                        } else if (loading && surveys.isNotEmpty()) {
                            CircularProgressIndicator(modifier = Modifier.padding(vertical = 12.dp))
                        }
                    }
                }
            }
        }
    }

    if (!isAdmin) {
        selectedSurvey?.let { survey ->
            SurveyDialog(
                survey = survey,
                answers = answers,
                submitting = submitting,
                onDismiss = {
                    if (!submitting) {
                        selectedSurvey = null
                        answers.clear()
                    }
                },
                onSubmit = {
                    if (submitting) return@SurveyDialog
                    val orderedAnswers = survey.questions.mapNotNull { q -> answers[q.id] }
                    if (orderedAnswers.size != survey.questions.size) {
                        error = "Responde todas las preguntas"
                        return@SurveyDialog
                    }
                    scope.launch {
                        submitting = true
                        val result = repository.submitSurvey(survey.surveyVersionId, orderedAnswers)
                        if (result.isSuccess) {
                            val updated = surveys.map {
                                if (it.surveyVersionId == survey.surveyVersionId) {
                                    it.copy(
                                        answered = true,
                                        indivScore = result.getOrNull()?.indivScore,
                                        submittedAt = result.getOrNull()?.submittedAt
                                    )
                                } else it
                            }
                            surveys = updated
                            selectedSurvey = null
                            answers.clear()
                        } else {
                            error = result.exceptionOrNull()?.message ?: "Error al enviar encuesta"
                        }
                        submitting = false
                    }
                }
            )
        }
    }
}

@Composable
private fun SurveyCard(survey: AssignedSurveyDto, onRespond: () -> Unit) {
    val startLabel = survey.startAt?.let { formatTimestamp(it) } ?: "Sin fecha"
    val endLabel = survey.endAt?.let { formatTimestamp(it) } ?: "Sin fecha"
    val hasQuestions = survey.questions.isNotEmpty()

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = when {
                survey.answered -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.8f)
                survey.isActive -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                else -> MaterialTheme.colorScheme.surfaceVariant
            }
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(survey.name, style = MaterialTheme.typography.titleMedium)
                if (survey.isActive && !survey.answered) {
                    FilterChip(
                        selected = true,
                        onClick = { },
                        label = { Text("Activa", style = MaterialTheme.typography.labelSmall) }
                    )
                }
            }
            Text(
                text = "Grupo: ${survey.group?.name ?: "Sin asignar"}",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "Inicio: $startLabel",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = "Fin: $endLabel",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (survey.answered) {
                Text(
                    text = "Calificación enviada: ${survey.indivScore ?: "-"} / 5",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.primary
                )
            } else {
                if (!hasQuestions) {
                    Text(
                        text = "Esta encuesta no tiene preguntas configuradas aún.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                OutlinedButton(
                    onClick = onRespond,
                    enabled = hasQuestions
                ) {
                    Text("Responder encuesta")
                }
            }
        }
    }
}

@Composable
private fun SurveyDialog(
    survey: AssignedSurveyDto,
    answers: MutableMap<Int, Int>,
    submitting: Boolean,
    onDismiss: () -> Unit,
    onSubmit: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Responder ${survey.name}") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                survey.questions.forEach { question ->
                    QuestionAnswerRow(
                        question = question,
                        selected = answers[question.id],
                        onSelect = { answers[question.id] = it }
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onSubmit,
                enabled = !submitting && answers.size == survey.questions.size
            ) {
                Text(if (submitting) "Enviando..." else "Enviar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !submitting) {
                Text("Cancelar")
            }
        }
    )
}

@Composable
private fun QuestionAnswerRow(
    question: SurveyQuestionDto,
    selected: Int?,
    onSelect: (Int) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(question.text, style = MaterialTheme.typography.bodyMedium)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            (1..5).forEach { value ->
                FilterChip(
                    selected = selected == value,
                    onClick = { onSelect(value) },
                    label = { Text("$value") }
                )
            }
        }
    }
}

private fun formatTimestamp(value: String): String {
    return try {
        val instant = Instant.parse(value)
        val formatter = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")
        instant.atZone(ZoneId.systemDefault()).format(formatter)
    } catch (_: Exception) {
        value
    }
}

@Composable
private fun AdminInfoMessage() {
    Text(
        text = "Los administradores no son empleados. Inicia sesión con una cuenta de empleado para visualizar contenido.",
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(8.dp)
    )
}
