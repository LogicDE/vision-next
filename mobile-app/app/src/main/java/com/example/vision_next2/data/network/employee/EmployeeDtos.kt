package com.example.vision_next2.data.network.employee

data class SurveyQuestionDto(
    val id: Int,
    val text: String
)

data class GroupSummaryDto(
    val id: Int?,
    val name: String?
)

data class AssignedSurveyDto(
    val id: Int,
    val name: String,
    val startAt: String?,
    val endAt: String?,
    val groupScore: Int?,
    val group: GroupSummaryDto?,
    val answered: Boolean,
    val indivScore: Int?,
    val submittedAt: String?,
    val questions: List<SurveyQuestionDto>
)

data class SurveyPageDto(
    val items: List<AssignedSurveyDto>,
    val total: Int,
    val page: Int,
    val limit: Int
)

data class SubmitSurveyRequest(
    val surveyId: Int,
    val answers: List<Int>
)

data class SubmitSurveyResponse(
    val id: Int,
    val surveyId: Int,
    val indivScore: Int?,
    val submittedAt: String?
)

data class AnsweredSurveyDto(
    val id: Int,
    val survey: AssignedSurveyDto,
    val indivScore: Int?,
    val submittedAt: String?
)

data class EventDto(
    val id: Int,
    val titleMessage: String,
    val bodyMessage: String?,
    val coordinatorName: String?,
    val startAt: String?,
    val endAt: String?,
    val group: GroupSummaryDto?
)

data class PagedEventsDto(
    val items: List<EventDto>,
    val total: Int,
    val page: Int,
    val limit: Int
)

data class InterventionDto(
    val id: Int,
    val titleMessage: String,
    val bodyMessage: String,
    val description: String?,
    val group: GroupSummaryDto?
)

data class PagedInterventionsDto(
    val items: List<InterventionDto>,
    val total: Int,
    val page: Int,
    val limit: Int
)

