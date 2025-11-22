package com.example.vision_next2.data.network.employee

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface EmployeeApi {
    @GET("group-survey-scores/me")
    suspend fun getAssignedSurveys(
        @Query("page") page: Int,
        @Query("limit") limit: Int
    ): SurveyPageDto

    @POST("indiv-survey-scores/submit")
    suspend fun submitSurvey(
        @Body body: SubmitSurveyRequest
    ): SubmitSurveyResponse

    @GET("indiv-survey-scores/me")
    suspend fun getAnsweredSurveys(): List<AnsweredSurveyDto>

    @GET("events/me")
    suspend fun getEvents(
        @Query("page") page: Int,
        @Query("limit") limit: Int
    ): PagedEventsDto

    @GET("interventions/me")
    suspend fun getInterventions(
        @Query("page") page: Int,
        @Query("limit") limit: Int
    ): PagedInterventionsDto
}

