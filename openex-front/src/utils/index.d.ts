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

export interface ViolationErrorBag {
  type?: string;
  message?: string;
  error?: string;
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
  audience_injects_expectations_total_expected_score?: number;
  /** @format int64 */
  audience_injects_number?: number;
  /** @format int64 */
  audience_users_number?: number;
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
  exercise_injects_statistics?: Record<string, number>;
  /** @format int64 */
  exercise_lessons_answers_number?: number;
  /** @format date-time */
  exercise_next_inject_date?: string;
  /** @format int64 */
  exercise_communications_number?: number;
  /** @format double */
  exercise_score?: number;
  exercise_planners?: User[];
  exercise_observers?: User[];
  /** @format int64 */
  exercise_users_number?: number;
  /** @format int64 */
  exercise_logs_number?: number;
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
  group_default_exercise_observer?: boolean;
  group_default_exercise_planner?: boolean;
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
  /**
   * @format int64
   * @min 0
   */
  inject_depends_duration: number;
  inject_user?: User;
  inject_status?: InjectStatus;
  inject_tags?: Tag[];
  inject_audiences?: Audience[];
  inject_documents?: InjectDocument[];
  inject_communications?: Communication[];
  inject_expectations?: InjectExpectation[];
  /** @format date-time */
  inject_date?: string;
  /** @format int64 */
  inject_communications_number?: number;
  /** @format int64 */
  inject_users_number?: number;
  /** @format int64 */
  inject_communications_not_ack_number?: number;
  /** @format date-time */
  inject_sent_at?: string;
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
  /** @format int64 */
  organization_injects_number?: number;
  organization_injects?: Inject[];
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
  user_is_manager?: boolean;
  /** @format int64 */
  user_injects_number?: number;
  user_is_planner?: boolean;
  user_is_observer?: boolean;
  /** @format date-time */
  user_last_comcheck?: string;
  user_is_player?: boolean;
  user_gravatar?: string;
  user_is_only_player?: boolean;
  user_injects?: Inject[];
  user_is_external?: boolean;
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
  dryrun_start_date?: string;
  /** @format date-time */
  dryrun_end_date?: string;
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
