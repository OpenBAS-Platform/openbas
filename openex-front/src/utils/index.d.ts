/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ViolationErrorBag {
  type?: string;
  message?: string;
  error?: string;
}

export interface ValidationContent {
  errors?: string[];
}

export interface ValidationError {
  children?: Record<string, ValidationContent>;
}

export interface ValidationErrorBag {
  /** @format int32 */
  code?: number;
  message?: string;
  errors?: ValidationError;
}

export interface UpdateUserInput {
  user_email?: string;
  user_admin?: boolean;
  user_firstname?: string;
  user_lastname?: string;
  user_organization?: string;
  user_pgp_key?: string;
  user_phone?: string;
  user_phone2?: string;
  user_tags?: string[];
}

export interface Article {
  updateAttributes?: object;
  article_id?: string;
  /** @format date-time */
  article_created_at?: string;
  /** @format date-time */
  article_updated_at?: string;
  article_name?: string;
  article_content?: string;
  article_author?: string;
  /** @format int32 */
  article_shares?: number;
  /** @format int32 */
  article_likes?: number;
  /** @format int32 */
  article_comments?: number;
  article_exercise?: Exercise;
  article_media?: Media;
  article_documents?: Document[];
  /** @format date-time */
  article_virtual_publication?: string;
  article_is_scheduled?: boolean;
}

export interface Audience {
  updateAttributes?: object;
  audience_id?: string;
  audience_name?: string;
  audience_description?: string;
  audience_enabled?: boolean;
  audience_exercise?: Exercise;
  /** @format date-time */
  audience_created_at?: string;
  /** @format date-time */
  audience_updated_at?: string;
  audience_tags?: Tag[];
  audience_users?: User[];
  audience_inject_expectations?: InjectExpectation[];
  audience_injects?: Inject[];
  audience_communications?: Communication[];
  /** @format int64 */
  audience_injects_expectations_number?: number;
  /** @format int64 */
  audience_injects_expectations_total_score?: number;
  /** @format int64 */
  audience_users_number?: number;
  /** @format int64 */
  audience_injects_number?: number;
  /** @format int64 */
  audience_injects_expectations_total_expected_score?: number;
}

export interface Challenge {
  updateAttributes?: object;
  challenge_id?: string;
  /** @format date-time */
  challenge_created_at?: string;
  /** @format date-time */
  challenge_updated_at?: string;
  challenge_name?: string;
  challenge_category?: string;
  challenge_content?: string;
  /** @format int32 */
  challenge_score?: number;
  /** @format int32 */
  challenge_max_attempts?: number;
  challenge_flags?: ChallengeFlag[];
  challenge_tags?: Tag[];
  challenge_documents?: Document[];
  challenge_exercises?: string[];
  /** @format date-time */
  challenge_virtual_publication?: string;
}

export interface ChallengeFlag {
  updateAttributes?: object;
  flag_id?: string;
  /** @format date-time */
  flag_created_at?: string;
  /** @format date-time */
  flag_updated_at?: string;
  flag_type?: "VALUE" | "VALUE_CASE" | "REGEXP";
  flag_value?: string;
  flag_challenge?: Challenge;
}

export interface Communication {
  updateAttributes?: object;
  communication_id?: string;
  communication_message_id?: string;
  /** @format date-time */
  communication_received_at?: string;
  /** @format date-time */
  communication_sent_at?: string;
  communication_subject?: string;
  communication_content?: string;
  communication_content_html?: string;
  communication_attachments?: string[];
  communication_inject?: Inject;
  communication_users?: User[];
  communication_ack?: boolean;
  communication_animation?: boolean;
  communication_from?: string;
  communication_to?: string;
  communication_exercise?: string;
}

export interface Document {
  updateAttributes?: object;
  document_id?: string;
  document_name?: string;
  document_target?: string;
  document_description?: string;
  document_type?: string;
  document_tags?: Tag[];
  document_exercises?: Exercise[];
}

export interface Execution {
  status?: "INFO" | "PENDING" | "PARTIAL" | "ERROR" | "SUCCESS";
  execution_runtime?: boolean;
  /** @format date-time */
  execution_start?: string;
  /** @format date-time */
  execution_stop?: string;
  execution_async_id?: string;
  execution_traces?: ExecutionTrace[];
  /** @format int32 */
  execution_time?: number;
}

export interface ExecutionTrace {
  trace_identifier?: string;
  trace_users?: string[];
  trace_message?: string;
  trace_status?: "INFO" | "PENDING" | "PARTIAL" | "ERROR" | "SUCCESS";
  /** @format date-time */
  trace_time?: string;
}

export interface Exercise {
  updateAttributes?: object;
  exercise_id?: string;
  exercise_name?: string;
  exercise_description?: string;
  exercise_status?: "SCHEDULED" | "CANCELED" | "RUNNING" | "PAUSED" | "FINISHED";
  exercise_subtitle?: string;
  /** @format date-time */
  exercise_start_date?: string;
  /** @format date-time */
  exercise_end_date?: string;
  exercise_message_header?: string;
  exercise_message_footer?: string;
  exercise_mail_from?: string;
  exercise_logo_dark?: Document;
  exercise_logo_light?: Document;
  exercise_lessons_anonymized?: boolean;
  /** @format date-time */
  exercise_created_at?: string;
  /** @format date-time */
  exercise_updated_at?: string;
  exercise_injects?: Inject[];
  exercise_pauses?: Pause[];
  exercise_tags?: Tag[];
  exercise_documents?: Document[];
  exercise_articles?: Article[];
  exercise_lessons_categories?: LessonsCategory[];
  exercise_players?: User[];
  exercise_next_possible_status?: ("SCHEDULED" | "CANCELED" | "RUNNING" | "PAUSED" | "FINISHED")[];
  exercise_planners?: User[];
  /** @format int64 */
  exercise_logs_number?: number;
  exercise_observers?: User[];
  /** @format int64 */
  exercise_users_number?: number;
  exercise_injects_statistics?: Record<string, number>;
  /** @format int64 */
  exercise_lessons_answers_number?: number;
  /** @format int64 */
  exercise_communications_number?: number;
  /** @format date-time */
  exercise_next_inject_date?: string;
  /** @format double */
  exercise_score?: number;
}

export interface Grant {
  updateAttributes?: object;
  grant_id?: string;
  grant_name?: "OBSERVER" | "PLANNER";
  grant_group?: Group;
  grant_exercise?: Exercise;
}

export interface Group {
  updateAttributes?: object;
  group_id?: string;
  group_name?: string;
  group_description?: string;
  group_default_user_assign?: boolean;
  group_default_exercise_assign?: ("OBSERVER" | "PLANNER")[];
  group_grants?: Grant[];
  group_users?: User[];
  group_organizations?: Organization[];
  group_default_exercise_planner?: boolean;
  group_default_exercise_observer?: boolean;
}

export interface Inject {
  header?: string;
  footer?: string;
  updateAttributes?: object;
  inject_id?: string;
  inject_title?: string;
  inject_description?: string;
  inject_contract?: string;
  inject_country?: string;
  inject_city?: string;
  inject_enabled?: boolean;
  inject_type?: string;
  inject_content?: object;
  /** @format date-time */
  inject_created_at?: string;
  /** @format date-time */
  inject_updated_at?: string;
  inject_all_audiences?: boolean;
  inject_exercise?: Exercise;
  inject_depends_on?: Inject;
  /** @format int64 */
  inject_depends_duration?: number;
  inject_user?: User;
  inject_status?: InjectStatus;
  inject_tags?: Tag[];
  inject_audiences?: Audience[];
  inject_documents?: InjectDocument[];
  inject_communications?: Communication[];
  inject_expectations?: InjectExpectation[];
  /** @format date-time */
  inject_date?: string;
  /** @format date-time */
  inject_sent_at?: string;
  /** @format int64 */
  inject_communications_number?: number;
  /** @format int64 */
  inject_users_number?: number;
  /** @format int64 */
  inject_communications_not_ack_number?: number;
}

export interface InjectDocument {
  inject_id?: Inject;
  document_id?: Document;
  document_attached?: boolean;
}

export interface InjectExpectation {
  updateAttributes?: object;
  inject_expectation_type?: "TEXT" | "DOCUMENT" | "ARTICLE" | "CHALLENGE" | "MANUAL";
  injectexpectation_id?: string;
  /** @format date-time */
  inject_expectation_created_at?: string;
  /** @format date-time */
  inject_expectation_updated_at?: string;
  inject_expectation_result?: string;
  /** @format int32 */
  inject_expectation_score?: number;
  /** @format int32 */
  inject_expectation_expected_score?: number;
  inject_expectation_exercise?: Exercise;
  inject_expectation_inject?: Inject;
  inject_expectation_user?: User;
  inject_expectation_audience?: Audience;
  inject_expectation_article?: Article;
  inject_expectation_challenge?: Challenge;
}

export interface InjectStatus {
  updateAttributes?: object;
  status_id?: string;
  status_name?: string;
  status_async_id?: string;
  status_reporting?: Execution;
  /** @format date-time */
  status_date?: string;
  /** @format int32 */
  status_execution?: number;
}

export interface LessonsAnswer {
  updateAttributes?: object;
  lessonsanswer_id?: string;
  lessons_answer_question?: LessonsQuestion;
  lessons_answer_user?: User;
  /** @format date-time */
  lessons_answer_created_at?: string;
  /** @format date-time */
  lessons_answer_updated_at?: string;
  lessons_answer_positive?: string;
  lessons_answer_negative?: string;
  /** @format int32 */
  lessons_answer_score?: number;
  lessons_answer_exercise?: string;
}

export interface LessonsCategory {
  updateAttributes?: object;
  lessonscategory_id?: string;
  lessons_category_exercise?: Exercise;
  /** @format date-time */
  lessons_category_created_at?: string;
  /** @format date-time */
  lessons_category_updated_at?: string;
  lessons_category_name?: string;
  lessons_category_description?: string;
  /** @format int32 */
  lessons_category_order?: number;
  lessons_category_audiences?: Audience[];
  lessons_category_questions?: LessonsQuestion[];
  lessons_category_users?: string[];
}

export interface LessonsQuestion {
  updateAttributes?: object;
  lessonsquestion_id?: string;
  lessons_question_category?: LessonsCategory;
  /** @format date-time */
  lessons_question_created_at?: string;
  /** @format date-time */
  lessons_question_updated_at?: string;
  lessons_question_content?: string;
  lessons_question_explanation?: string;
  /** @format int32 */
  lessons_question_order?: number;
  lessons_question_answers?: LessonsAnswer[];
  lessons_question_exercise?: string;
}

export interface Media {
  logos?: Document[];
  updateAttributes?: object;
  media_id?: string;
  /** @format date-time */
  media_created_at?: string;
  /** @format date-time */
  media_updated_at?: string;
  media_type?: string;
  media_name?: string;
  media_description?: string;
  media_mode?: string;
  media_primary_color_dark?: string;
  media_primary_color_light?: string;
  media_secondary_color_dark?: string;
  media_secondary_color_light?: string;
  media_logo_dark?: Document;
  media_logo_light?: Document;
}

export interface Organization {
  updateAttributes?: object;
  organization_id?: string;
  organization_name?: string;
  organization_description?: string;
  /** @format date-time */
  organization_created_at?: string;
  /** @format date-time */
  organization_updated_at?: string;
  organization_tags?: Tag[];
  organization_injects?: Inject[];
  /** @format int64 */
  organization_injects_number?: number;
}

export interface Pause {
  updateAttributes?: object;
  log_id?: string;
  /** @format date-time */
  pause_date?: string;
  /** @format int64 */
  pause_duration?: number;
  pause_exercise?: Exercise;
}

export interface Tag {
  updateAttributes?: object;
  tag_id?: string;
  tag_name?: string;
  tag_color?: string;
  tags_documents?: Document[];
}

export interface User {
  updateAttributes?: object;
  user_id?: string;
  user_firstname?: string;
  user_lastname?: string;
  user_lang?: string;
  user_theme?: string;
  user_email?: string;
  user_phone?: string;
  user_phone2?: string;
  user_pgp_key?: string;
  /** @format int32 */
  user_status?: number;
  /** @format date-time */
  user_created_at?: string;
  /** @format date-time */
  user_updated_at?: string;
  user_organization?: Organization;
  user_admin?: boolean;
  user_country?: string;
  user_city?: string;
  user_groups?: Group[];
  user_audiences?: Audience[];
  user_tags?: Tag[];
  user_communications?: Communication[];
  user_is_external?: boolean;
  user_is_manager?: boolean;
  /** @format int64 */
  user_injects_number?: number;
  user_is_planner?: boolean;
  user_is_observer?: boolean;
  /** @format date-time */
  user_last_comcheck?: string;
  user_is_only_player?: boolean;
  user_gravatar?: string;
  user_injects?: Inject[];
  user_is_player?: boolean;
}

export interface ChangePasswordInput {
  password: string;
  password_validation: string;
}

export interface TagUpdateInput {
  tag_name: string;
  tag_color: string;
}

export interface SettingsUpdateInput {
  platform_name: string;
  platform_theme: string;
  platform_lang: string;
}

export interface PlatformSetting {
  setting_key?: string;
  setting_value?: object;
}

export interface UpdatePlayerInput {
  user_email?: string;
  user_firstname?: string;
  user_lastname?: string;
  user_organization?: string;
  user_pgp_key?: string;
  user_country?: string;
  user_phone?: string;
  user_phone2?: string;
  user_tags?: string[];
}

export interface OrganizationUpdateInput {
  organization_name: string;
  organization_description?: string;
  organization_tags?: string[];
}

export interface MediaUpdateInput {
  media_type: string;
  media_name: string;
  media_description: string;
  media_mode?: string;
  media_primary_color_dark?: string;
  media_primary_color_light?: string;
  media_secondary_color_dark?: string;
  media_secondary_color_light?: string;
}

export interface MediaUpdateLogoInput {
  media_logo_dark?: string;
  media_logo_light?: string;
}

export interface UpdateProfileInput {
  user_email?: string;
  user_firstname: string;
  user_lastname: string;
  user_organization?: string;
  user_lang?: string;
  user_theme?: string;
  user_country?: string;
}

export interface UpdateMePasswordInput {
  user_current_password: string;
  user_plain_password: string;
}

export interface UpdateUserInfoInput {
  user_pgp_key?: string;
  user_phone?: string;
  user_phone2?: string;
}

export interface LessonsTemplateUpdateInput {
  lessons_template_name: string;
  lessons_template_description?: string;
}

export interface LessonsTemplate {
  updateAttributes?: object;
  lessonstemplate_id?: string;
  /** @format date-time */
  lessons_template_created_at?: string;
  /** @format date-time */
  lessons_template_updated_at?: string;
  lessons_template_name?: string;
  lessons_template_description?: string;
}

export interface LessonsTemplateCategoryUpdateInput {
  lessons_template_category_name: string;
  lessons_template_category_description?: string;
  /** @format int32 */
  lessons_template_category_order?: number;
}

export interface LessonsTemplateCategory {
  updateAttributes?: object;
  lessonstemplatecategory_id?: string;
  lessons_template_category_template?: LessonsTemplate;
  /** @format date-time */
  lessons_template_category_created_at?: string;
  /** @format date-time */
  lessons_template_category_updated_at?: string;
  lessons_template_category_name?: string;
  lessons_template_category_description?: string;
  /** @format int32 */
  lessons_template_category_order?: number;
  lessons_template_category_questions?: LessonsTemplateQuestion[];
}

export interface LessonsTemplateQuestion {
  updateAttributes?: object;
  lessonstemplatequestion_id?: string;
  lessons_template_question_category?: LessonsTemplateCategory;
  /** @format date-time */
  lessons_template_question_created_at?: string;
  /** @format date-time */
  lessons_template_question_updated_at?: string;
  lessons_template_question_content?: string;
  lessons_template_question_explanation?: string;
  /** @format int32 */
  lessons_template_question_order?: number;
}

export interface LessonsTemplateQuestionUpdateInput {
  lessons_template_question_content: string;
  lessons_template_question_explanation?: string;
  /** @format int32 */
  lessons_template_question_order?: number;
}

export interface InjectDocumentInput {
  document_id?: string;
  document_attached?: boolean;
}

export interface InjectInput {
  inject_title?: string;
  inject_description?: string;
  inject_contract?: string;
  inject_content?: object;
  inject_depends_from_another?: string;
  /** @format int64 */
  inject_depends_duration?: number;
  inject_audiences?: string[];
  inject_documents?: InjectDocumentInput[];
  inject_all_audiences?: boolean;
  inject_country?: string;
  inject_city?: string;
  inject_tags?: string[];
}

export interface GroupUpdateUsersInput {
  group_users?: string[];
}

export interface GroupCreateInput {
  group_name: string;
  group_description?: string;
  group_default_user_assign?: boolean;
  group_default_exercise_observer?: boolean;
  group_default_exercise_planner?: boolean;
}

export interface ExerciseUpdateInput {
  exercise_name: string;
  exercise_subtitle?: string;
  exercise_description?: string;
  exercise_mail_from?: string;
  exercise_message_header?: string;
  exercise_message_footer?: string;
}

export interface ExerciseUpdateTagsInput {
  exercise_tags?: string[];
}

export interface ExerciseUpdateStatusInput {
  exercise_status?: "SCHEDULED" | "CANCELED" | "RUNNING" | "PAUSED" | "FINISHED";
}

export interface ExerciseUpdateStartDateInput {
  /** @format date-time */
  exercise_start_date?: string;
}

export interface ReportUpdateInput {
  report_name: string;
  report_description?: string;
  report_general_information?: boolean;
  report_stats_definition?: boolean;
  report_stats_definition_score?: boolean;
  report_stats_data?: boolean;
  report_stats_results?: boolean;
  report_lessons_objectives?: boolean;
  report_lessons_stats?: boolean;
  report_lessons_details?: boolean;
}

export interface Report {
  updateAttributes?: object;
  report_id?: string;
  report_exercise?: Exercise;
  /** @format date-time */
  report_created_at?: string;
  /** @format date-time */
  report_updated_at?: string;
  report_name?: string;
  report_description?: string;
  report_general_information?: boolean;
  report_stats_definition?: boolean;
  report_stats_definition_score?: boolean;
  report_stats_data?: boolean;
  report_stats_results?: boolean;
  report_lessons_objectives?: boolean;
  report_lessons_stats?: boolean;
  report_lessons_details?: boolean;
}

export interface ObjectiveInput {
  objective_title?: string;
  objective_description?: string;
  /** @format int32 */
  objective_priority?: number;
}

export interface Evaluation {
  updateAttributes?: object;
  evaluation_id?: string;
  evaluation_objective?: Objective;
  evaluation_user?: User;
  /** @format int64 */
  evaluation_score?: number;
  /** @format date-time */
  evaluation_created_at?: string;
  /** @format date-time */
  evaluation_updated_at?: string;
}

export interface Objective {
  updateAttributes?: object;
  objective_id?: string;
  objective_exercise?: Exercise;
  objective_title?: string;
  objective_description?: string;
  /** @format int32 */
  objective_priority?: number;
  /** @format date-time */
  objective_created_at?: string;
  /** @format date-time */
  objective_updated_at?: string;
  objective_evaluations?: Evaluation[];
  /** @format double */
  objective_score?: number;
}

export interface EvaluationInput {
  /** @format int64 */
  evaluation_score?: number;
}

export interface LogCreateInput {
  log_title?: string;
  log_content?: string;
  log_tags?: string[];
}

export interface Log {
  updateAttributes?: object;
  log_id?: string;
  log_exercise?: Exercise;
  log_user?: User;
  log_title?: string;
  log_content?: string;
  /** @format date-time */
  log_created_at?: string;
  /** @format date-time */
  log_updated_at?: string;
  log_tags?: Tag[];
}

export interface ExerciseUpdateLogoInput {
  exercise_logo_dark?: string;
  exercise_logo_light?: string;
}

export interface LessonsCategoryUpdateInput {
  lessons_category_name: string;
  lessons_category_description?: string;
  /** @format int32 */
  lessons_category_order?: number;
}

export interface LessonsQuestionUpdateInput {
  lessons_question_content: string;
  lessons_question_explanation?: string;
  /** @format int32 */
  lessons_question_order?: number;
}

export interface LessonsCategoryAudiencesInput {
  lessons_category_audiences?: string[];
}

export interface ExerciseLessonsInput {
  exercise_lessons_anonymized?: boolean;
}

export interface InjectUpdateTriggerInput {
  /** @format int64 */
  inject_depends_duration?: number;
}

export interface InjectAudiencesInput {
  inject_audiences?: string[];
}

export interface InjectUpdateActivationInput {
  inject_enabled?: boolean;
}

export interface ExpectationUpdateInput {
  /** @format int32 */
  expectation_score?: number;
}

export interface AudienceUpdateInput {
  audience_name: string;
  audience_description?: string;
  audience_tags?: string[];
}

export interface UpdateUsersAudienceInput {
  audience_users?: string[];
}

export interface AudienceUpdateActivationInput {
  audience_enabled?: boolean;
}

export interface ArticleUpdateInput {
  article_name: string;
  article_content?: string;
  article_author?: string;
  /** @format int32 */
  article_shares?: number;
  /** @format int32 */
  article_likes?: number;
  /** @format int32 */
  article_comments?: number;
  article_documents?: string[];
  article_media: string;
  article_published?: boolean;
}

export interface DocumentUpdateInput {
  document_description?: string;
  document_tags?: string[];
  document_exercises: string[];
}

export interface DocumentTagUpdateInput {
  tags?: string[];
}

export interface ChallengeUpdateInput {
  challenge_name: string;
  challenge_category?: string;
  challenge_content?: string;
  /** @format int32 */
  challenge_score?: number;
  /** @format int32 */
  challenge_max_attempts?: number;
  challenge_tags?: string[];
  challenge_documents?: string[];
  challenge_flags: FlagInput[];
}

export interface FlagInput {
  flag_type: string;
  flag_value: string;
}

export interface CreateUserInput {
  user_email?: string;
  user_admin?: boolean;
  user_firstname?: string;
  user_lastname?: string;
  user_organization?: string;
  user_plain_password?: string;
  user_tags?: string[];
}

export interface TagCreateInput {
  tag_name: string;
  tag_color: string;
}

export interface ResetUserInput {
  login: string;
  lang?: string;
}

export interface CreatePlayerInput {
  user_email?: string;
  user_firstname?: string;
  user_lastname?: string;
  user_organization?: string;
  user_country?: string;
  user_tags?: string[];
}

export interface LessonsAnswerCreateInput {
  /** @format int32 */
  lessons_answer_score?: number;
  lessons_answer_positive?: string;
  lessons_answer_negative?: string;
}

export interface ChallengeTryInput {
  challenge_value?: string;
}

export interface ChallengeInformation {
  challenge_detail?: PublicChallenge;
  challenge_expectation?: InjectExpectation;
}

export interface ChallengesReader {
  exercise_id?: string;
  exercise_information?: PublicExercise;
  exercise_challenges?: ChallengeInformation[];
}

export interface PublicChallenge {
  challenge_id?: string;
  challenge_name?: string;
  challenge_category?: string;
  challenge_content?: string;
  /** @format int32 */
  challenge_score?: number;
  challenge_flags?: PublicChallengeFlag[];
  /** @format int32 */
  challenge_max_attempts?: number;
  challenge_tags?: string[];
  challenge_documents?: string[];
  /** @format date-time */
  challenge_virtual_publication?: string;
}

export interface PublicChallengeFlag {
  flag_id?: string;
  flag_type?: "VALUE" | "VALUE_CASE" | "REGEXP";
  flag_challenge?: string;
}

export interface PublicExercise {
  exercise_id?: string;
  exercise_name?: string;
  exercise_description?: string;
}

export interface OrganizationCreateInput {
  organization_name: string;
  organization_description?: string;
  organization_tags?: string[];
}

export interface MediaCreateInput {
  media_type: string;
  media_name: string;
  media_description: string;
}

export interface RenewTokenInput {
  token_id: string;
}

export interface Token {
  updateAttributes?: object;
  token_id?: string;
  token_user?: User;
  token_value?: string;
  /** @format date-time */
  token_created_at?: string;
}

export interface LoginUserInput {
  login: string;
  password: string;
}

export interface LessonsTemplateCreateInput {
  lessons_template_name: string;
  lessons_template_description?: string;
}

export interface LessonsTemplateCategoryCreateInput {
  lessons_template_category_name: string;
  lessons_template_category_description?: string;
  /** @format int32 */
  lessons_template_category_order?: number;
}

export interface LessonsTemplateQuestionCreateInput {
  lessons_template_question_content: string;
  lessons_template_question_explanation?: string;
  /** @format int32 */
  lessons_template_question_order?: number;
}

export interface OrganizationGrantInput {
  organization_id: string;
}

export interface GroupGrantInput {
  grant_name?: "OBSERVER" | "PLANNER";
  grant_exercise: string;
}

export interface ExerciseCreateInput {
  exercise_name: string;
  exercise_subtitle?: string;
  exercise_description?: string;
  /** @format date-time */
  exercise_start_date?: string;
  exercise_tags?: string[];
}

export interface ReportCreateInput {
  report_name: string;
  report_description?: string;
  report_general_information?: boolean;
  report_stats_definition?: boolean;
  report_stats_definition_score?: boolean;
  report_stats_data?: boolean;
  report_stats_results?: boolean;
  report_lessons_objectives?: boolean;
  report_lessons_stats?: boolean;
  report_lessons_details?: boolean;
}

export interface LessonsSendInput {
  subject?: string;
  body?: string;
}

export interface LessonsCategoryCreateInput {
  lessons_category_name: string;
  lessons_category_description?: string;
  /** @format int32 */
  lessons_category_order?: number;
}

export interface LessonsQuestionCreateInput {
  lessons_question_content: string;
  lessons_question_explanation?: string;
  /** @format int32 */
  lessons_question_order?: number;
}

export interface InjectUpdateStatusInput {
  status?: string;
  message?: string;
}

export interface DirectInjectInput {
  inject_title?: string;
  inject_description?: string;
  inject_contract?: string;
  inject_content?: object;
  inject_users?: string[];
  inject_documents?: InjectDocumentInput[];
}

export interface DryrunCreateInput {
  dryrun_name: string;
  dryrun_users?: string[];
}

export interface Dryrun {
  updateAttributes?: object;
  dryrun_id?: string;
  dryrun_name?: string;
  /** @format int32 */
  dryrun_speed?: number;
  /** @format date-time */
  dryrun_date?: string;
  dryrun_exercise?: Exercise;
  dryrun_users?: User[];
  dryrun_finished?: boolean;
  /** @format int64 */
  dryrun_users_number?: number;
  /** @format date-time */
  dryrun_end_date?: string;
  /** @format date-time */
  dryrun_start_date?: string;
}

export interface ComcheckInput {
  comcheck_name: string;
  /** @format date-time */
  comcheck_end_date?: string;
  comcheck_subject?: string;
  comcheck_message?: string;
  comcheck_audiences?: string[];
}

export interface Comcheck {
  updateAttributes?: object;
  comcheck_id?: string;
  comcheck_name?: string;
  /** @format date-time */
  comcheck_start_date?: string;
  /** @format date-time */
  comcheck_end_date?: string;
  comcheck_state?: "RUNNING" | "EXPIRED" | "FINISHED";
  comcheck_subject?: string;
  comcheck_message?: string;
  comcheck_exercise?: Exercise;
  comcheck_statuses?: ComcheckStatus[];
  /** @format int64 */
  comcheck_users_number?: number;
}

export interface ComcheckStatus {
  updateAttributes?: object;
  comcheckstatus_id?: string;
  comcheckstatus_user?: User;
  comcheckstatus_comcheck?: Comcheck;
  /** @format date-time */
  comcheckstatus_sent_date?: string;
  /** @format date-time */
  comcheckstatus_receive_date?: string;
  /** @format int32 */
  comcheckstatus_sent_retry?: number;
  comcheckstatus_state?: "RUNNING" | "SUCCESS" | "FAILURE";
}

export interface AudienceCreateInput {
  audience_name: string;
  audience_description?: string;
  audience_tags?: string[];
}

export interface ArticleCreateInput {
  article_name: string;
  article_content?: string;
  article_author?: string;
  /** @format int32 */
  article_shares?: number;
  /** @format int32 */
  article_likes?: number;
  /** @format int32 */
  article_comments?: number;
  article_documents?: string[];
  article_media: string;
  article_published?: boolean;
}

export interface DocumentCreateInput {
  document_description?: string;
  document_tags?: string[];
  document_exercises?: string[];
}

export interface ChallengeCreateInput {
  challenge_name: string;
  challenge_category?: string;
  challenge_content?: string;
  /** @format int32 */
  challenge_score?: number;
  /** @format int32 */
  challenge_max_attempts?: number;
  challenge_tags?: string[];
  challenge_documents?: string[];
  challenge_flags: FlagInput[];
}

export interface ChallengeResult {
  result?: boolean;
}

export interface PlatformStatistic {
  platform_id?: string;
  exercises_count?: StatisticElement;
  users_count?: StatisticElement;
  injects_count?: StatisticElement;
}

export interface StatisticElement {
  /** @format int64 */
  global_count?: number;
  /** @format int64 */
  progression_count?: number;
}

export interface MediaReader {
  media_id?: string;
  media_information?: Media;
  media_exercise?: Exercise;
  media_articles?: Article[];
}

export interface Contract {
  config?: ContractConfig;
  label?: Record<string, string>;
  manual?: boolean;
  fields?: ContractElement[];
  variables?: ContractVariable[];
  context?: Record<string, string>;
  contract_id?: string;
}

export interface ContractConfig {
  type?: string;
  expose?: boolean;
  label?: Record<string, string>;
  color?: string;
  icon?: string;
}

export interface ContractElement {
  key?: string;
  label?: string;
  mandatory?: boolean;
  expectation?: boolean;
  linkedFields?: LinkedFieldModel[];
  linkedValues?: string[];
  type?:
    | "text"
    | "number"
    | "tuple"
    | "checkbox"
    | "textarea"
    | "select"
    | "article"
    | "challenge"
    | "dependency-select"
    | "attachment"
    | "audience";
}

export interface ContractVariable {
  key?: string;
  label?: string;
  type?: "String" | "Object";
  cardinality?: "1" | "n";
}

export interface LinkedFieldModel {
  key?: string;
  type?:
    | "text"
    | "number"
    | "tuple"
    | "checkbox"
    | "textarea"
    | "select"
    | "article"
    | "challenge"
    | "dependency-select"
    | "attachment"
    | "audience";
}

export interface ExerciseSimple {
  exercise_id?: string;
  exercise_name?: string;
  exercise_status?: "SCHEDULED" | "CANCELED" | "RUNNING" | "PAUSED" | "FINISHED";
  exercise_subtitle?: string;
  /** @format date-time */
  exercise_start_date?: string;
  exercise_tags?: Tag[];
}

export interface DryInject {
  updateAttributes?: object;
  dryinject_id?: string;
  /** @format date-time */
  dryinject_date?: string;
  dryinject_dryrun?: Dryrun;
  dryinject_inject?: Inject;
  dryinject_status?: DryInjectStatus;
  dryinject_exercise?: Exercise;
}

export interface DryInjectStatus {
  updateAttributes?: object;
  status_id?: string;
  status_name?: "INFO" | "PENDING" | "PARTIAL" | "ERROR" | "SUCCESS";
  status_reporting?: Execution;
  /** @format date-time */
  status_date?: string;
  /** @format int32 */
  status_execution?: number;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:8080";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title OpenEX API
 * @version 3.3.0-SNAPSHOT
 * @license Apache 2.0 (https://www.openex.io/)
 * @baseUrl http://localhost:8080
 * @externalDocs https://docs.openex.io/
 *
 * Software under open source licence designed to plan and conduct exercises
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags user-api
     * @name UpdateUser
     * @request PUT:/api/users/{userId}
     */
    updateUser: (userId: string, data: UpdateUserInput, params: RequestParams = {}) =>
      this.request<User, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/users/${userId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-api
     * @name DeleteUser
     * @request DELETE:/api/users/{userId}
     */
    deleteUser: (userId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/users/${userId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-api
     * @name ChangePassword
     * @request PUT:/api/users/{userId}/password
     */
    changePassword: (userId: string, data: ChangePasswordInput, params: RequestParams = {}) =>
      this.request<User, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/users/${userId}/password`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags tag-api
     * @name UpdateTag
     * @request PUT:/api/tags/{tagId}
     */
    updateTag: (tagId: string, data: TagUpdateInput, params: RequestParams = {}) =>
      this.request<Tag, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/tags/${tagId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags tag-api
     * @name DeleteTag
     * @request DELETE:/api/tags/{tagId}
     */
    deleteTag: (tagId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/tags/${tagId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags settings-api
     * @name Settings
     * @request GET:/api/settings
     */
    settings: (params: RequestParams = {}) =>
      this.request<PlatformSetting[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/settings`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags settings-api
     * @name UpdateSettings
     * @request PUT:/api/settings
     */
    updateSettings: (data: SettingsUpdateInput, params: RequestParams = {}) =>
      this.request<PlatformSetting[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/settings`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags player-api
     * @name UpdatePlayer
     * @request PUT:/api/players/{userId}
     */
    updatePlayer: (userId: string, data: UpdatePlayerInput, params: RequestParams = {}) =>
      this.request<User, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/players/${userId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags player-api
     * @name DeletePlayer
     * @request DELETE:/api/players/{userId}
     */
    deletePlayer: (userId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/players/${userId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags organization-api
     * @name UpdateOrganization
     * @request PUT:/api/organizations/{organizationId}
     */
    updateOrganization: (organizationId: string, data: OrganizationUpdateInput, params: RequestParams = {}) =>
      this.request<Organization, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/organizations/${organizationId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags organization-api
     * @name DeleteOrganization
     * @request DELETE:/api/organizations/{organizationId}
     */
    deleteOrganization: (organizationId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/organizations/${organizationId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags media-api
     * @name Media
     * @request GET:/api/medias/{mediaId}
     */
    media: (mediaId: string, params: RequestParams = {}) =>
      this.request<Media, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/medias/${mediaId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags media-api
     * @name UpdateMedia
     * @request PUT:/api/medias/{mediaId}
     */
    updateMedia: (mediaId: string, data: MediaUpdateInput, params: RequestParams = {}) =>
      this.request<Media, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/medias/${mediaId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags media-api
     * @name DeleteMedia
     * @request DELETE:/api/medias/{mediaId}
     */
    deleteMedia: (mediaId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/medias/${mediaId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags media-api
     * @name UpdateMediaLogos
     * @request PUT:/api/medias/{mediaId}/logos
     */
    updateMediaLogos: (mediaId: string, data: MediaUpdateLogoInput, params: RequestParams = {}) =>
      this.request<Media, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/medias/${mediaId}/logos`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags me-api
     * @name UpdateProfile
     * @request PUT:/api/me/profile
     */
    updateProfile: (data: UpdateProfileInput, params: RequestParams = {}) =>
      this.request<User, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/me/profile`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags me-api
     * @name UpdatePassword
     * @request PUT:/api/me/password
     */
    updatePassword: (data: UpdateMePasswordInput, params: RequestParams = {}) =>
      this.request<User, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/me/password`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags me-api
     * @name UpdateInformation
     * @request PUT:/api/me/information
     */
    updateInformation: (data: UpdateUserInfoInput, params: RequestParams = {}) =>
      this.request<User, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/me/information`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name UpdateLessonsTemplate
     * @request PUT:/api/lessons_templates/{lessonsTemplateId}
     */
    updateLessonsTemplate: (lessonsTemplateId: string, data: LessonsTemplateUpdateInput, params: RequestParams = {}) =>
      this.request<LessonsTemplate, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates/${lessonsTemplateId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name DeleteLessonsTemplate
     * @request DELETE:/api/lessons_templates/{lessonsTemplateId}
     */
    deleteLessonsTemplate: (lessonsTemplateId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates/${lessonsTemplateId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name UpdateLessonsTemplateCategory
     * @request PUT:/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories/{lessonsTemplateCategoryId}
     */
    updateLessonsTemplateCategory: (
      lessonsTemplateCategoryId: string,
      lessonsTemplateId: string,
      data: LessonsTemplateCategoryUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<LessonsTemplateCategory, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories/${lessonsTemplateCategoryId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name DeleteLessonsTemplateCategory
     * @request DELETE:/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories/{lessonsTemplateCategoryId}
     */
    deleteLessonsTemplateCategory: (
      lessonsTemplateCategoryId: string,
      lessonsTemplateId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories/${lessonsTemplateCategoryId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name UpdateLessonsTemplateQuestion
     * @request PUT:/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories/{lessonsTemplateCategoryId}/lessons_template_questions/{lessonsTemplateQuestionId}
     */
    updateLessonsTemplateQuestion: (
      lessonsTemplateQuestionId: string,
      lessonsTemplateId: string,
      lessonsTemplateCategoryId: string,
      data: LessonsTemplateQuestionUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<LessonsTemplateQuestion, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories/${lessonsTemplateCategoryId}/lessons_template_questions/${lessonsTemplateQuestionId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name DeleteLessonsTemplateQuestion
     * @request DELETE:/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories/{lessonsTemplateCategoryId}/lessons_template_questions/{lessonsTemplateQuestionId}
     */
    deleteLessonsTemplateQuestion: (
      lessonsTemplateQuestionId: string,
      lessonsTemplateId: string,
      lessonsTemplateCategoryId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories/${lessonsTemplateCategoryId}/lessons_template_questions/${lessonsTemplateQuestionId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name UpdateInject
     * @request PUT:/api/injects/{exerciseId}/{injectId}
     */
    updateInject: (exerciseId: string, injectId: string, data: InjectInput, params: RequestParams = {}) =>
      this.request<Inject, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/injects/${exerciseId}/${injectId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-api
     * @name UpdateGroupUsers
     * @request PUT:/api/groups/{groupId}/users
     */
    updateGroupUsers: (groupId: string, data: GroupUpdateUsersInput, params: RequestParams = {}) =>
      this.request<Group, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/groups/${groupId}/users`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-api
     * @name UpdateGroupInformation
     * @request PUT:/api/groups/{groupId}/information
     */
    updateGroupInformation: (groupId: string, data: GroupCreateInput, params: RequestParams = {}) =>
      this.request<Group, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/groups/${groupId}/information`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name Exercise
     * @request GET:/api/exercises/{exerciseId}
     */
    exercise: (exerciseId: string, params: RequestParams = {}) =>
      this.request<Exercise, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name UpdateExerciseInformation
     * @request PUT:/api/exercises/{exerciseId}
     */
    updateExerciseInformation: (exerciseId: string, data: ExerciseUpdateInput, params: RequestParams = {}) =>
      this.request<Exercise, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name DeleteExercise
     * @request DELETE:/api/exercises/{exerciseId}
     */
    deleteExercise: (exerciseId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name UpdateExerciseTags
     * @request PUT:/api/exercises/{exerciseId}/tags
     */
    updateExerciseTags: (exerciseId: string, data: ExerciseUpdateTagsInput, params: RequestParams = {}) =>
      this.request<Exercise, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/tags`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name ChangeExerciseStatus
     * @request PUT:/api/exercises/{exerciseId}/status
     */
    changeExerciseStatus: (exerciseId: string, data: ExerciseUpdateStatusInput, params: RequestParams = {}) =>
      this.request<Exercise, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/status`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name UpdateExerciseStart
     * @request PUT:/api/exercises/{exerciseId}/start_date
     */
    updateExerciseStart: (exerciseId: string, data: ExerciseUpdateStartDateInput, params: RequestParams = {}) =>
      this.request<Exercise, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/start_date`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags report-api
     * @name UpdateExerciseReport
     * @request PUT:/api/exercises/{exerciseId}/reports/{reportId}
     */
    updateExerciseReport: (exerciseId: string, reportId: string, data: ReportUpdateInput, params: RequestParams = {}) =>
      this.request<Report, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/reports/${reportId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags report-api
     * @name DeleteExerciseReport
     * @request DELETE:/api/exercises/{exerciseId}/reports/{reportId}
     */
    deleteExerciseReport: (exerciseId: string, reportId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/reports/${reportId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags objective-api
     * @name UpdateObjective
     * @request PUT:/api/exercises/{exerciseId}/objectives/{objectiveId}
     */
    updateObjective: (exerciseId: string, objectiveId: string, data: ObjectiveInput, params: RequestParams = {}) =>
      this.request<Objective, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/objectives/${objectiveId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags objective-api
     * @name DeleteObjective
     * @request DELETE:/api/exercises/{exerciseId}/objectives/{objectiveId}
     */
    deleteObjective: (exerciseId: string, objectiveId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/objectives/${objectiveId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags objective-api
     * @name GetEvaluation
     * @request GET:/api/exercises/{exerciseId}/objectives/{objectiveId}/evaluations/{evaluationId}
     */
    getEvaluation: (exerciseId: string, evaluationId: string, objectiveId: string, params: RequestParams = {}) =>
      this.request<Evaluation, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/objectives/${objectiveId}/evaluations/${evaluationId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags objective-api
     * @name UpdateEvaluation
     * @request PUT:/api/exercises/{exerciseId}/objectives/{objectiveId}/evaluations/{evaluationId}
     */
    updateEvaluation: (
      exerciseId: string,
      objectiveId: string,
      evaluationId: string,
      data: EvaluationInput,
      params: RequestParams = {},
    ) =>
      this.request<Evaluation, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/objectives/${objectiveId}/evaluations/${evaluationId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags objective-api
     * @name DeleteEvaluation
     * @request DELETE:/api/exercises/{exerciseId}/objectives/{objectiveId}/evaluations/{evaluationId}
     */
    deleteEvaluation: (exerciseId: string, evaluationId: string, objectiveId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/objectives/${objectiveId}/evaluations/${evaluationId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name UpdateLog
     * @request PUT:/api/exercises/{exerciseId}/logs/{logId}
     */
    updateLog: (exerciseId: string, logId: string, data: LogCreateInput, params: RequestParams = {}) =>
      this.request<Log, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/logs/${logId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name DeleteLog
     * @request DELETE:/api/exercises/{exerciseId}/logs/{logId}
     */
    deleteLog: (exerciseId: string, logId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/logs/${logId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name UpdateExerciseLogos
     * @request PUT:/api/exercises/{exerciseId}/logos
     */
    updateExerciseLogos: (exerciseId: string, data: ExerciseUpdateLogoInput, params: RequestParams = {}) =>
      this.request<Exercise, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/logos`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name UpdateExerciseLessonsCategory
     * @request PUT:/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}
     */
    updateExerciseLessonsCategory: (
      exerciseId: string,
      lessonsCategoryId: string,
      data: LessonsCategoryUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<LessonsCategory, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name DeleteExerciseLessonsCategory
     * @request DELETE:/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}
     */
    deleteExerciseLessonsCategory: (exerciseId: string, lessonsCategoryId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name UpdateExerciseLessonsQuestion
     * @request PUT:/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}
     */
    updateExerciseLessonsQuestion: (
      exerciseId: string,
      lessonsQuestionId: string,
      lessonsCategoryId: string,
      data: LessonsQuestionUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<LessonsQuestion, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}/lessons_questions/${lessonsQuestionId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name DeleteExerciseLessonsQuestion
     * @request DELETE:/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}
     */
    deleteExerciseLessonsQuestion: (
      exerciseId: string,
      lessonsQuestionId: string,
      lessonsCategoryId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}/lessons_questions/${lessonsQuestionId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name UpdateExerciseLessonsCategoryAudiences
     * @request PUT:/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/audiences
     */
    updateExerciseLessonsCategoryAudiences: (
      exerciseId: string,
      lessonsCategoryId: string,
      data: LessonsCategoryAudiencesInput,
      params: RequestParams = {},
    ) =>
      this.request<LessonsCategory, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}/audiences`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name UpdateExerciseLessons
     * @request PUT:/api/exercises/{exerciseId}/lessons
     */
    updateExerciseLessons: (exerciseId: string, data: ExerciseLessonsInput, params: RequestParams = {}) =>
      this.request<Exercise, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name UpdateInjectActivation
     * @request PUT:/api/exercises/{exerciseId}/injects/{injectId}/trigger
     */
    updateInjectActivation: (
      exerciseId: string,
      injectId: string,
      data: InjectUpdateTriggerInput,
      params: RequestParams = {},
    ) =>
      this.request<Inject, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/injects/${injectId}/trigger`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name ExerciseInjectAudiences
     * @request GET:/api/exercises/{exerciseId}/injects/{injectId}/audiences
     */
    exerciseInjectAudiences: (exerciseId: string, injectId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/injects/${injectId}/audiences`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name UpdateInjectAudiences
     * @request PUT:/api/exercises/{exerciseId}/injects/{injectId}/audiences
     */
    updateInjectAudiences: (
      exerciseId: string,
      injectId: string,
      data: InjectAudiencesInput,
      params: RequestParams = {},
    ) =>
      this.request<Inject, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/injects/${injectId}/audiences`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name UpdateInjectActivation1
     * @request PUT:/api/exercises/{exerciseId}/injects/{injectId}/activation
     */
    updateInjectActivation1: (
      exerciseId: string,
      injectId: string,
      data: InjectUpdateActivationInput,
      params: RequestParams = {},
    ) =>
      this.request<Inject, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/injects/${injectId}/activation`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name UpdateInjectExpectation
     * @request PUT:/api/exercises/{exerciseId}/expectations/{expectationId}
     */
    updateInjectExpectation: (
      exerciseId: string,
      expectationId: string,
      data: ExpectationUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<InjectExpectation, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/expectations/${expectationId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags audience-api
     * @name GetAudience
     * @request GET:/api/exercises/{exerciseId}/audiences/{audienceId}
     */
    getAudience: (exerciseId: string, audienceId: string, params: RequestParams = {}) =>
      this.request<Audience, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/audiences/${audienceId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags audience-api
     * @name UpdateAudience
     * @request PUT:/api/exercises/{exerciseId}/audiences/{audienceId}
     */
    updateAudience: (exerciseId: string, audienceId: string, data: AudienceUpdateInput, params: RequestParams = {}) =>
      this.request<Audience, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/audiences/${audienceId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags audience-api
     * @name DeleteAudience
     * @request DELETE:/api/exercises/{exerciseId}/audiences/{audienceId}
     */
    deleteAudience: (exerciseId: string, audienceId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/audiences/${audienceId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags audience-api
     * @name GetAudiencePlayers
     * @request GET:/api/exercises/{exerciseId}/audiences/{audienceId}/players
     */
    getAudiencePlayers: (exerciseId: string, audienceId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/audiences/${audienceId}/players`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags audience-api
     * @name UpdateAudienceUsers
     * @request PUT:/api/exercises/{exerciseId}/audiences/{audienceId}/players
     */
    updateAudienceUsers: (
      exerciseId: string,
      audienceId: string,
      data: UpdateUsersAudienceInput,
      params: RequestParams = {},
    ) =>
      this.request<Audience, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/audiences/${audienceId}/players`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags audience-api
     * @name UpdateAudienceActivation
     * @request PUT:/api/exercises/{exerciseId}/audiences/{audienceId}/activation
     */
    updateAudienceActivation: (
      exerciseId: string,
      audienceId: string,
      data: AudienceUpdateActivationInput,
      params: RequestParams = {},
    ) =>
      this.request<Audience, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/audiences/${audienceId}/activation`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags media-api
     * @name UpdateArticle
     * @request PUT:/api/exercises/{exerciseId}/articles/{articleId}
     */
    updateArticle: (exerciseId: string, articleId: string, data: ArticleUpdateInput, params: RequestParams = {}) =>
      this.request<Article, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/articles/${articleId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags media-api
     * @name DeleteArticle
     * @request DELETE:/api/exercises/{exerciseId}/articles/{articleId}
     */
    deleteArticle: (exerciseId: string, articleId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/articles/${articleId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags document-api
     * @name Document
     * @request GET:/api/documents/{documentId}
     */
    document: (documentId: string, params: RequestParams = {}) =>
      this.request<Document, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/documents/${documentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags document-api
     * @name UpdateDocumentInformation
     * @request PUT:/api/documents/{documentId}
     */
    updateDocumentInformation: (documentId: string, data: DocumentUpdateInput, params: RequestParams = {}) =>
      this.request<Document, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/documents/${documentId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags document-api
     * @name DeleteDocument1
     * @request DELETE:/api/documents/{documentId}
     */
    deleteDocument1: (documentId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/documents/${documentId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags document-api
     * @name DocumentTags1
     * @request GET:/api/documents/{documentId}/tags
     */
    documentTags1: (documentId: string, params: RequestParams = {}) =>
      this.request<Tag[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/documents/${documentId}/tags`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags document-api
     * @name DocumentTags
     * @request PUT:/api/documents/{documentId}/tags
     */
    documentTags: (documentId: string, data: DocumentTagUpdateInput, params: RequestParams = {}) =>
      this.request<Document, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/documents/${documentId}/tags`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenge-api
     * @name UpdateChallenge
     * @request PUT:/api/challenges/{challengeId}
     */
    updateChallenge: (challengeId: string, data: ChallengeUpdateInput, params: RequestParams = {}) =>
      this.request<Challenge, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/challenges/${challengeId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenge-api
     * @name DeleteChallenge
     * @request DELETE:/api/challenges/{challengeId}
     */
    deleteChallenge: (challengeId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/challenges/${challengeId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-api
     * @name Users
     * @request GET:/api/users
     */
    users: (params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/users`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-api
     * @name CreateUser
     * @request POST:/api/users
     */
    createUser: (data: CreateUserInput, params: RequestParams = {}) =>
      this.request<User, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/users`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags tag-api
     * @name Tags
     * @request GET:/api/tags
     */
    tags: (params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/tags`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags tag-api
     * @name CreateTag
     * @request POST:/api/tags
     */
    createTag: (data: TagCreateInput, params: RequestParams = {}) =>
      this.request<Tag, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/tags`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-api
     * @name PasswordReset
     * @request POST:/api/reset
     */
    passwordReset: (data: ResetUserInput, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/reset`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-api
     * @name ValidatePasswordResetToken
     * @request GET:/api/reset/{token}
     */
    validatePasswordResetToken: (token: string, params: RequestParams = {}) =>
      this.request<boolean, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/reset/${token}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-api
     * @name ChangePasswordReset
     * @request POST:/api/reset/{token}
     */
    changePasswordReset: (token: string, data: ChangePasswordInput, params: RequestParams = {}) =>
      this.request<User, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/reset/${token}`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags player-api
     * @name Players
     * @request GET:/api/players
     */
    players: (params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/players`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags player-api
     * @name CreatePlayer
     * @request POST:/api/players
     */
    createPlayer: (data: CreatePlayerInput, params: RequestParams = {}) =>
      this.request<User, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/players`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name CreateExerciseLessonsQuestion
     * @request POST:/api/player/lessons/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}/lessons_answers
     */
    createExerciseLessonsQuestion: (
      exerciseId: string,
      lessonsQuestionId: string,
      lessonsCategoryId: string,
      data: LessonsAnswerCreateInput,
      query?: {
        userId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<LessonsAnswer, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/player/lessons/${exerciseId}/lessons_categories/${lessonsCategoryId}/lessons_questions/${lessonsQuestionId}/lessons_answers`,
        method: "POST",
        query: query,
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenge-api
     * @name ValidateChallenge
     * @request POST:/api/player/challenges/{exerciseId}/{challengeId}/validate
     */
    validateChallenge: (
      exerciseId: string,
      challengeId: string,
      data: ChallengeTryInput,
      query?: {
        userId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ChallengesReader, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/player/challenges/${exerciseId}/${challengeId}/validate`,
        method: "POST",
        query: query,
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags organization-api
     * @name Organizations
     * @request GET:/api/organizations
     */
    organizations: (params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/organizations`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags organization-api
     * @name CreateOrganization
     * @request POST:/api/organizations
     */
    createOrganization: (data: OrganizationCreateInput, params: RequestParams = {}) =>
      this.request<Organization, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/organizations`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags media-api
     * @name Medias
     * @request GET:/api/medias
     */
    medias: (params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/medias`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags media-api
     * @name CreateMedia
     * @request POST:/api/medias
     */
    createMedia: (data: MediaCreateInput, params: RequestParams = {}) =>
      this.request<Media, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/medias`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags me-api
     * @name RenewToken
     * @request POST:/api/me/token/refresh
     */
    renewToken: (data: RenewTokenInput, params: RequestParams = {}) =>
      this.request<Token, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/me/token/refresh`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-api
     * @name Login
     * @request POST:/api/login
     */
    login: (data: LoginUserInput, params: RequestParams = {}) =>
      this.request<User, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name LessonsTemplates
     * @request GET:/api/lessons_templates
     */
    lessonsTemplates: (params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name CreateLessonsTemplate
     * @request POST:/api/lessons_templates
     */
    createLessonsTemplate: (data: LessonsTemplateCreateInput, params: RequestParams = {}) =>
      this.request<LessonsTemplate, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name LessonsTemplateCategories
     * @request GET:/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories
     */
    lessonsTemplateCategories: (lessonsTemplateId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name CreateLessonsTemplateCategory
     * @request POST:/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories
     */
    createLessonsTemplateCategory: (
      lessonsTemplateId: string,
      data: LessonsTemplateCategoryCreateInput,
      params: RequestParams = {},
    ) =>
      this.request<LessonsTemplateCategory, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name LessonsTemplateCategoryQuestions
     * @request GET:/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories/{lessonsTemplateCategoryId}/lessons_template_questions
     */
    lessonsTemplateCategoryQuestions: (
      lessonsTemplateCategoryId: string,
      lessonsTemplateId: string,
      params: RequestParams = {},
    ) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories/${lessonsTemplateCategoryId}/lessons_template_questions`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name CreateLessonsTemplateQuestion
     * @request POST:/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories/{lessonsTemplateCategoryId}/lessons_template_questions
     */
    createLessonsTemplateQuestion: (
      lessonsTemplateCategoryId: string,
      lessonsTemplateId: string,
      data: LessonsTemplateQuestionCreateInput,
      params: RequestParams = {},
    ) =>
      this.request<LessonsTemplateQuestion, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories/${lessonsTemplateCategoryId}/lessons_template_questions`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-api
     * @name Groups
     * @request GET:/api/groups
     */
    groups: (params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/groups`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-api
     * @name CreateGroup
     * @request POST:/api/groups
     */
    createGroup: (data: GroupCreateInput, params: RequestParams = {}) =>
      this.request<Group, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/groups`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-api
     * @name GroupOrganization
     * @request POST:/api/groups/{groupId}/organizations
     */
    groupOrganization: (groupId: string, data: OrganizationGrantInput, params: RequestParams = {}) =>
      this.request<Group, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/groups/${groupId}/organizations`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-api
     * @name GroupGrant
     * @request POST:/api/groups/{groupId}/grants
     */
    groupGrant: (groupId: string, data: GroupGrantInput, params: RequestParams = {}) =>
      this.request<Grant, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/groups/${groupId}/grants`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name Exercises
     * @request GET:/api/exercises
     */
    exercises: (params: RequestParams = {}) =>
      this.request<ExerciseSimple[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name CreateExercise
     * @request POST:/api/exercises
     */
    createExercise: (data: ExerciseCreateInput, params: RequestParams = {}) =>
      this.request<Exercise, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags report-api
     * @name ExerciseReports
     * @request GET:/api/exercises/{exerciseId}/reports
     */
    exerciseReports: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/reports`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags report-api
     * @name CreateExerciseReport
     * @request POST:/api/exercises/{exerciseId}/reports
     */
    createExerciseReport: (exerciseId: string, data: ReportCreateInput, params: RequestParams = {}) =>
      this.request<Report, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/reports`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags objective-api
     * @name GetMainObjectives
     * @request GET:/api/exercises/{exerciseId}/objectives
     */
    getMainObjectives: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/objectives`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags objective-api
     * @name CreateObjective
     * @request POST:/api/exercises/{exerciseId}/objectives
     */
    createObjective: (exerciseId: string, data: ObjectiveInput, params: RequestParams = {}) =>
      this.request<Objective, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/objectives`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags objective-api
     * @name GetEvaluations
     * @request GET:/api/exercises/{exerciseId}/objectives/{objectiveId}/evaluations
     */
    getEvaluations: (exerciseId: string, objectiveId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/objectives/${objectiveId}/evaluations`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags objective-api
     * @name CreateEvaluation
     * @request POST:/api/exercises/{exerciseId}/objectives/{objectiveId}/evaluations
     */
    createEvaluation: (exerciseId: string, objectiveId: string, data: EvaluationInput, params: RequestParams = {}) =>
      this.request<Evaluation, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/objectives/${objectiveId}/evaluations`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name CreateLog
     * @request POST:/api/exercises/{exerciseId}/logs
     */
    createLog: (exerciseId: string, data: LogCreateInput, params: RequestParams = {}) =>
      this.request<Log, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/logs`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name SendExerciseLessons
     * @request POST:/api/exercises/{exerciseId}/lessons_send
     */
    sendExerciseLessons: (exerciseId: string, data: LessonsSendInput, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_send`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name EmptyExerciseLessons
     * @request POST:/api/exercises/{exerciseId}/lessons_empty
     */
    emptyExerciseLessons: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_empty`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name ExerciseLessonsCategories
     * @request GET:/api/exercises/{exerciseId}/lessons_categories
     */
    exerciseLessonsCategories: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_categories`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name CreateExerciseLessonsCategory
     * @request POST:/api/exercises/{exerciseId}/lessons_categories
     */
    createExerciseLessonsCategory: (exerciseId: string, data: LessonsCategoryCreateInput, params: RequestParams = {}) =>
      this.request<LessonsCategory, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_categories`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name ExerciseLessonsCategoryQuestions
     * @request GET:/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions
     */
    exerciseLessonsCategoryQuestions: (exerciseId: string, lessonsCategoryId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}/lessons_questions`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name CreateExerciseLessonsQuestion1
     * @request POST:/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions
     */
    createExerciseLessonsQuestion1: (
      exerciseId: string,
      lessonsCategoryId: string,
      data: LessonsQuestionCreateInput,
      params: RequestParams = {},
    ) =>
      this.request<LessonsQuestion, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}/lessons_questions`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name ApplyExerciseLessonsTemplate
     * @request POST:/api/exercises/{exerciseId}/lessons_apply_template/{lessonsTemplateId}
     */
    applyExerciseLessonsTemplate: (exerciseId: string, lessonsTemplateId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_apply_template/${lessonsTemplateId}`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name ResetExerciseLessonsAnswers
     * @request POST:/api/exercises/{exerciseId}/lessons_answers_reset
     */
    resetExerciseLessonsAnswers: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_answers_reset`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name ExerciseInjects
     * @request GET:/api/exercises/{exerciseId}/injects
     */
    exerciseInjects: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/injects`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name CreateInject
     * @request POST:/api/exercises/{exerciseId}/injects
     */
    createInject: (exerciseId: string, data: InjectInput, params: RequestParams = {}) =>
      this.request<Inject, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/injects`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name SetInjectStatus
     * @request POST:/api/exercises/{exerciseId}/injects/{injectId}/status
     */
    setInjectStatus: (
      exerciseId: string,
      injectId: string,
      data: InjectUpdateStatusInput,
      params: RequestParams = {},
    ) =>
      this.request<Inject, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/injects/${injectId}/status`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name ExecuteInject
     * @request POST:/api/exercises/{exerciseId}/inject
     */
    executeInject: (
      exerciseId: string,
      data: {
        input: DirectInjectInput;
        /** @format binary */
        file: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<InjectStatus, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/inject`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name Dryruns
     * @request GET:/api/exercises/{exerciseId}/dryruns
     */
    dryruns: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/dryruns`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name CreateDryrun
     * @request POST:/api/exercises/{exerciseId}/dryruns
     */
    createDryrun: (exerciseId: string, data: DryrunCreateInput, params: RequestParams = {}) =>
      this.request<Dryrun, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/dryruns`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags comcheck-api
     * @name CommunicationCheck
     * @request POST:/api/exercises/{exerciseId}/comchecks
     */
    communicationCheck: (exerciseId: string, data: ComcheckInput, params: RequestParams = {}) =>
      this.request<Comcheck, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/comchecks`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags audience-api
     * @name GetAudiences
     * @request GET:/api/exercises/{exerciseId}/audiences
     */
    getAudiences: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/audiences`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags audience-api
     * @name CreateAudience
     * @request POST:/api/exercises/{exerciseId}/audiences
     */
    createAudience: (exerciseId: string, data: AudienceCreateInput, params: RequestParams = {}) =>
      this.request<Audience, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/audiences`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags media-api
     * @name ExerciseArticles
     * @request GET:/api/exercises/{exerciseId}/articles
     */
    exerciseArticles: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/articles`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags media-api
     * @name CreateArticle
     * @request POST:/api/exercises/{exerciseId}/articles
     */
    createArticle: (exerciseId: string, data: ArticleCreateInput, params: RequestParams = {}) =>
      this.request<Article, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/articles`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name ExerciseImport
     * @request POST:/api/exercises/import
     */
    exerciseImport: (
      data: {
        /** @format binary */
        file: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/import`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags document-api
     * @name Documents
     * @request GET:/api/documents
     */
    documents: (params: RequestParams = {}) =>
      this.request<Document[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/documents`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags document-api
     * @name UploadDocument
     * @request POST:/api/documents
     */
    uploadDocument: (
      data: {
        input: DocumentCreateInput;
        /** @format binary */
        file: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<Document, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/documents`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenge-api
     * @name Challenges
     * @request GET:/api/challenges
     */
    challenges: (params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/challenges`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenge-api
     * @name CreateChallenge
     * @request POST:/api/challenges
     */
    createChallenge: (data: ChallengeCreateInput, params: RequestParams = {}) =>
      this.request<Challenge, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/challenges`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenge-api
     * @name TryChallenge
     * @request POST:/api/challenges/{challengeId}/try
     */
    tryChallenge: (challengeId: string, data: ChallengeTryInput, params: RequestParams = {}) =>
      this.request<ChallengeResult, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/challenges/${challengeId}/try`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags stream-api
     * @name StreamFlux
     * @request GET:/api/stream
     */
    streamFlux: (params: RequestParams = {}) =>
      this.request<object[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/stream`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags statistic-api
     * @name PlatformStatistic
     * @request GET:/api/statistics
     */
    platformStatistic: (params: RequestParams = {}) =>
      this.request<PlatformStatistic, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/statistics`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags player-api
     * @name PlayerCommunications
     * @request GET:/api/player/{userId}/communications
     */
    playerCommunications: (userId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/player/${userId}/communications`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags document-api
     * @name PlayerDocuments
     * @request GET:/api/player/{exerciseId}/documents
     */
    playerDocuments: (
      exerciseId: string,
      query?: {
        userId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Document[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/player/${exerciseId}/documents`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags document-api
     * @name DownloadPlayerDocument
     * @request GET:/api/player/{exerciseId}/documents/{documentId}/file
     */
    downloadPlayerDocument: (
      exerciseId: string,
      documentId: string,
      query?: {
        userId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/player/${exerciseId}/documents/${documentId}/file`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags media-api
     * @name PlayerArticles
     * @request GET:/api/player/medias/{exerciseId}/{mediaId}
     */
    playerArticles: (
      exerciseId: string,
      mediaId: string,
      query?: {
        userId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<MediaReader, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/player/medias/${exerciseId}/${mediaId}`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name PlayerLessonsQuestions
     * @request GET:/api/player/lessons/{exerciseId}/lessons_questions
     */
    playerLessonsQuestions: (
      exerciseId: string,
      query?: {
        userId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<LessonsQuestion[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/player/lessons/${exerciseId}/lessons_questions`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name PlayerLessonsCategories
     * @request GET:/api/player/lessons/{exerciseId}/lessons_categories
     */
    playerLessonsCategories: (
      exerciseId: string,
      query?: {
        userId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<LessonsCategory[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/player/lessons/${exerciseId}/lessons_categories`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name PlayerLessonsAnswers
     * @request GET:/api/player/lessons/{exerciseId}/lessons_answers
     */
    playerLessonsAnswers: (
      exerciseId: string,
      query?: {
        userId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<LessonsAnswer[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/player/lessons/${exerciseId}/lessons_answers`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name PlayerExercise
     * @request GET:/api/player/exercises/{exerciseId}
     */
    playerExercise: (
      exerciseId: string,
      query?: {
        userId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublicExercise, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/player/exercises/${exerciseId}`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenge-api
     * @name PlayerChallenges
     * @request GET:/api/player/challenges/{exerciseId}
     */
    playerChallenges: (
      exerciseId: string,
      query?: {
        userId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ChallengesReader, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/player/challenges/${exerciseId}`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags media-api
     * @name ObserverArticles
     * @request GET:/api/observer/medias/{exerciseId}/{mediaId}
     */
    observerArticles: (exerciseId: string, mediaId: string, params: RequestParams = {}) =>
      this.request<MediaReader, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/observer/medias/${exerciseId}/${mediaId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenge-api
     * @name ObserverChallenges
     * @request GET:/api/observer/challenges/{exerciseId}
     */
    observerChallenges: (exerciseId: string, params: RequestParams = {}) =>
      this.request<ChallengesReader, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/observer/challenges/${exerciseId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags me-api
     * @name Me
     * @request GET:/api/me
     */
    me: (params: RequestParams = {}) =>
      this.request<User, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/me`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags me-api
     * @name Tokens
     * @request GET:/api/me/tokens
     */
    tokens: (params: RequestParams = {}) =>
      this.request<Token[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/me/tokens`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags me-api
     * @name Logout
     * @request GET:/api/logout
     */
    logout: (params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/logout`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-template-api
     * @name LessonsTemplateQuestions
     * @request GET:/api/lessons_templates/{lessonsTemplateId}/lessons_template_questions
     */
    lessonsTemplateQuestions: (lessonsTemplateId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/lessons_templates/${lessonsTemplateId}/lessons_template_questions`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name TryInject
     * @request GET:/api/injects/try/{injectId}
     */
    tryInject: (injectId: string, params: RequestParams = {}) =>
      this.request<InjectStatus, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/injects/try/${injectId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name NextInjectsToExecute
     * @request GET:/api/injects/next
     */
    nextInjectsToExecute: (
      query?: {
        /** @format int32 */
        size?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<Inject[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/injects/next`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name InjectTypes
     * @request GET:/api/inject_types
     */
    injectTypes: (params: RequestParams = {}) =>
      this.request<Contract[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/inject_types`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-api
     * @name Group
     * @request GET:/api/groups/{groupId}
     */
    group: (groupId: string, params: RequestParams = {}) =>
      this.request<Group, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/groups/${groupId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-api
     * @name DeleteGroup
     * @request DELETE:/api/groups/{groupId}
     */
    deleteGroup: (groupId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/groups/${groupId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name Logs
     * @request GET:/api/exercises/{exercise}/logs
     */
    logs: (exercise: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exercise}/logs`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name Comchecks
     * @request GET:/api/exercises/{exercise}/comchecks
     */
    comchecks: (exercise: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exercise}/comchecks`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name Comcheck
     * @request GET:/api/exercises/{exercise}/comchecks/{comcheck}
     */
    comcheck: (exercise: string, comcheck: string, params: RequestParams = {}) =>
      this.request<Comcheck, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exercise}/comchecks/${comcheck}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name ComcheckStatuses
     * @request GET:/api/exercises/{exercise}/comchecks/{comcheck}/statuses
     */
    comcheckStatuses: (exercise: string, comcheck: string, params: RequestParams = {}) =>
      this.request<ComcheckStatus[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exercise}/comchecks/${comcheck}/statuses`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name ExerciseLessonsQuestions
     * @request GET:/api/exercises/{exerciseId}/lessons_questions
     */
    exerciseLessonsQuestions: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_questions`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons-api
     * @name ExerciseLessonsAnswers
     * @request GET:/api/exercises/{exerciseId}/lessons_answers
     */
    exerciseLessonsAnswers: (
      exerciseId: string,
      query?: {
        userId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<LessonsAnswer[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/lessons_answers`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name ExerciseInject
     * @request GET:/api/exercises/{exerciseId}/injects/{injectId}
     */
    exerciseInject: (exerciseId: string, injectId: string, params: RequestParams = {}) =>
      this.request<Inject, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/injects/${injectId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name DeleteInject
     * @request DELETE:/api/exercises/{exerciseId}/injects/{injectId}
     */
    deleteInject: (exerciseId: string, injectId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/injects/${injectId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags inject-api
     * @name ExerciseInjectCommunications
     * @request GET:/api/exercises/{exerciseId}/injects/{injectId}/communications
     */
    exerciseInjectCommunications: (exerciseId: string, injectId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/injects/${injectId}/communications`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name ExerciseExport
     * @request GET:/api/exercises/{exerciseId}/export
     */
    exerciseExport: (
      exerciseId: string,
      query?: {
        isWithPlayers?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/export`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name ExerciseInjectExpectations
     * @request GET:/api/exercises/{exerciseId}/expectations
     */
    exerciseInjectExpectations: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/expectations`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name Dryrun
     * @request GET:/api/exercises/{exerciseId}/dryruns/{dryrunId}
     */
    dryrun: (exerciseId: string, dryrunId: string, params: RequestParams = {}) =>
      this.request<Dryrun, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/dryruns/${dryrunId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name DeleteDryrun
     * @request DELETE:/api/exercises/{exerciseId}/dryruns/{dryrunId}
     */
    deleteDryrun: (exerciseId: string, dryrunId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/dryruns/${dryrunId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name DryrunInjects
     * @request GET:/api/exercises/{exerciseId}/dryruns/{dryrunId}/dryinjects
     */
    dryrunInjects: (exerciseId: string, dryrunId: string, params: RequestParams = {}) =>
      this.request<DryInject[], ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/dryruns/${dryrunId}/dryinjects`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name ExerciseCommunications
     * @request GET:/api/exercises/{exerciseId}/communications
     */
    exerciseCommunications: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/communications`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenge-api
     * @name ExerciseChallenges
     * @request GET:/api/exercises/{exerciseId}/challenges
     */
    exerciseChallenges: (exerciseId: string, params: RequestParams = {}) =>
      this.request<object, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/challenges`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags document-api
     * @name DownloadDocument
     * @request GET:/api/documents/{documentId}/file
     */
    downloadDocument: (documentId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/documents/${documentId}/file`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name DownloadAttachment
     * @request GET:/api/communications/attachment
     */
    downloadAttachment: (
      query: {
        file: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/communications/attachment`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags comcheck-api
     * @name CheckValidation
     * @request GET:/api/comcheck/{comcheckStatusId}
     */
    checkValidation: (comcheckStatusId: string, params: RequestParams = {}) =>
      this.request<ComcheckStatus, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/comcheck/${comcheckStatusId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-api
     * @name DeleteGroupOrganization
     * @request DELETE:/api/groups/{groupId}/organizations/{organizationId}
     */
    deleteGroupOrganization: (groupId: string, organizationId: string, params: RequestParams = {}) =>
      this.request<Group, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/groups/${groupId}/organizations/${organizationId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-api
     * @name DeleteGrant
     * @request DELETE:/api/grants/{grantId}
     */
    deleteGrant: (grantId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/grants/${grantId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercise-api
     * @name DeleteDocument
     * @request DELETE:/api/exercises/{exerciseId}/{documentId}
     */
    deleteDocument: (exerciseId: string, documentId: string, params: RequestParams = {}) =>
      this.request<Exercise, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/${documentId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags comcheck-api
     * @name DeleteComcheck
     * @request DELETE:/api/exercises/{exerciseId}/comchecks/{comcheckId}
     */
    deleteComcheck: (exerciseId: string, comcheckId: string, params: RequestParams = {}) =>
      this.request<void, ValidationErrorBag | ViolationErrorBag>({
        path: `/api/exercises/${exerciseId}/comchecks/${comcheckId}`,
        method: "DELETE",
        ...params,
      }),
  };
}
