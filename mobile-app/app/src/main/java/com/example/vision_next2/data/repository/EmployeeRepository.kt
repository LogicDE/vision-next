package com.example.vision_next2.data.repository

import com.example.vision_next2.data.network.employee.EmployeeApi
import com.example.vision_next2.data.network.employee.PagedEventsDto
import com.example.vision_next2.data.network.employee.PagedInterventionsDto
import com.example.vision_next2.data.network.employee.SubmitSurveyRequest
import com.example.vision_next2.data.network.employee.SubmitSurveyResponse
import com.example.vision_next2.data.network.employee.SurveyPageDto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.IOException

class EmployeeRepository(private val api: EmployeeApi) {
    suspend fun getSurveys(page: Int, limit: Int): Result<SurveyPageDto> =
        execute { api.getAssignedSurveys(page, limit) }

    suspend fun submitSurvey(surveyId: Int, answers: List<Int>): Result<SubmitSurveyResponse> =
        execute { api.submitSurvey(SubmitSurveyRequest(surveyId, answers)) }

    suspend fun getEvents(page: Int, limit: Int): Result<PagedEventsDto> =
        execute { api.getEvents(page, limit) }

    suspend fun getInterventions(page: Int, limit: Int): Result<PagedInterventionsDto> =
        execute { api.getInterventions(page, limit) }

    private suspend fun <T> execute(block: suspend () -> T): Result<T> =
        withContext(Dispatchers.IO) {
            try {
                Result.success(block())
            } catch (e: HttpException) {
                Result.failure(Exception("HTTP ${e.code()}: ${e.message()}"))
            } catch (e: IOException) {
                Result.failure(Exception("Error de red: ${e.message}"))
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
}

