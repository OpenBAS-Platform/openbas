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

export interface AiGenericTextInput {
  ai_content: string;
  ai_format?: string;
  ai_tone?: string;
}

export interface AiMediaInput {
  ai_author?: string;
  ai_context?: string;
  ai_format: string;
  ai_input: string;
  /** @format int32 */
  ai_paragraphs?: number;
  ai_tone?: string;
}

export interface AiMessageInput {
  ai_context?: string;
  ai_format: string;
  ai_input: string;
  /** @format int32 */
  ai_paragraphs?: number;
  ai_recipient?: string;
  ai_sender?: string;
  ai_tone?: string;
}

export interface AiResult {
  chunk_content?: string;
  chunk_id?: string;
}

export interface Article {
  article_author?: string;
  article_channel: Channel;
  /** @format int32 */
  article_comments?: number;
  article_content?: string;
  /** @format date-time */
  article_created_at: string;
  article_documents?: Document[];
  article_exercise?: Exercise;
  article_id: string;
  article_is_scheduled?: boolean;
  /** @format int32 */
  article_likes?: number;
  article_name?: string;
  article_scenario?: Scenario;
  /** @format int32 */
  article_shares?: number;
  /** @format date-time */
  article_updated_at: string;
  /** @format date-time */
  article_virtual_publication?: string;
  listened?: boolean;
}

export interface ArticleCreateInput {
  article_author?: string;
  article_channel: string;
  /** @format int32 */
  article_comments?: number;
  article_content?: string;
  article_documents?: string[];
  /** @format int32 */
  article_likes?: number;
  article_name: string;
  article_published?: boolean;
  /** @format int32 */
  article_shares?: number;
}

export interface ArticleUpdateInput {
  article_author?: string;
  article_channel: string;
  /** @format int32 */
  article_comments?: number;
  article_content?: string;
  article_documents?: string[];
  /** @format int32 */
  article_likes?: number;
  article_name: string;
  article_published?: boolean;
  /** @format int32 */
  article_shares?: number;
}

export interface Asset {
  asset_active?: boolean;
  asset_children?: Asset[];
  /** @format date-time */
  asset_cleared_at?: string;
  /** @format date-time */
  asset_created_at: string;
  asset_description?: string;
  asset_executor?: Executor;
  asset_external_reference?: string;
  asset_id: string;
  asset_inject?: Inject;
  /** @format date-time */
  asset_last_seen?: string;
  asset_name: string;
  asset_parent?: Asset;
  asset_process_name?: string;
  /** @uniqueItems true */
  asset_tags?: Tag[];
  asset_type?: string;
  /** @format date-time */
  asset_updated_at: string;
  listened?: boolean;
}

export interface AssetAgentJob {
  asset_agent_asset?: Asset;
  asset_agent_command: string;
  asset_agent_id: string;
  asset_agent_inject?: Inject;
  listened?: boolean;
}

export interface AssetGroup {
  asset_group_assets?: Asset[];
  /** @format date-time */
  asset_group_created_at: string;
  asset_group_description?: string;
  asset_group_dynamic_assets?: Asset[];
  asset_group_dynamic_filter?: FilterGroup;
  asset_group_id: string;
  asset_group_name: string;
  /** @uniqueItems true */
  asset_group_tags?: Tag[];
  /** @format date-time */
  asset_group_updated_at: string;
  listened?: boolean;
}

export interface AssetGroupInput {
  asset_group_description?: string;
  asset_group_dynamic_filter?: FilterGroup;
  asset_group_name: string;
  asset_group_tags?: string[];
}

export interface AtomicTestingInput {
  inject_all_teams?: boolean;
  inject_asset_groups?: string[];
  inject_assets?: string[];
  inject_content?: object;
  inject_description?: string;
  inject_documents?: InjectDocumentInput[];
  inject_injector_contract?: string;
  inject_tags?: string[];
  inject_teams?: string[];
  inject_title?: string;
}

export interface AtomicTestingOutput {
  inject_asset_groups: string[];
  inject_assets: string[];
  inject_expectation_results?: ExpectationResultsByType[];
  inject_expectations: string[];
  inject_id: string;
  inject_injector_contract?: InjectorContract;
  inject_status?: InjectStatus;
  inject_targets?: InjectTargetWithResult[];
  inject_teams: string[];
  inject_title: string;
  inject_type?: string;
  /** @format date-time */
  inject_updated_at: string;
}

export interface AtomicTestingUpdateTagsInput {
  atomic_tags?: string[];
}

export interface AttackPattern {
  /** @format date-time */
  attack_pattern_created_at?: string;
  attack_pattern_description?: string;
  attack_pattern_external_id: string;
  attack_pattern_id: string;
  attack_pattern_kill_chain_phases?: KillChainPhase[];
  attack_pattern_name: string;
  attack_pattern_parent?: AttackPattern;
  attack_pattern_permissions_required?: string[];
  attack_pattern_platforms?: string[];
  attack_pattern_stix_id: string;
  /** @format date-time */
  attack_pattern_updated_at?: string;
  listened?: boolean;
}

export interface AttackPatternCreateInput {
  attack_pattern_description?: string;
  attack_pattern_external_id: string;
  attack_pattern_kill_chain_phases?: string[];
  attack_pattern_name: string;
  attack_pattern_parent?: string;
  attack_pattern_permissions_required?: string[];
  attack_pattern_platforms?: string[];
  attack_pattern_stix_id?: string;
}

export interface AttackPatternUpdateInput {
  attack_pattern_description?: string;
  attack_pattern_external_id: string;
  attack_pattern_kill_chain_phases?: string[];
  attack_pattern_name: string;
}

export interface AttackPatternUpsertInput {
  attack_patterns?: AttackPatternCreateInput[];
}

export interface Challenge {
  challenge_category?: string;
  challenge_content?: string;
  /** @format date-time */
  challenge_created_at: string;
  challenge_documents?: Document[];
  challenge_exercises?: string[];
  challenge_flags?: ChallengeFlag[];
  challenge_id: string;
  /** @format int32 */
  challenge_max_attempts?: number;
  challenge_name?: string;
  challenge_scenarios?: string[];
  /** @format double */
  challenge_score?: number;
  /** @uniqueItems true */
  challenge_tags?: Tag[];
  /** @format date-time */
  challenge_updated_at: string;
  /** @format date-time */
  challenge_virtual_publication?: string;
  listened?: boolean;
}

export interface ChallengeCreateInput {
  challenge_category?: string;
  challenge_content?: string;
  challenge_documents?: string[];
  challenge_flags: FlagInput[];
  /** @format int32 */
  challenge_max_attempts?: number;
  challenge_name: string;
  /** @format int32 */
  challenge_score?: number;
  challenge_tags?: string[];
}

export interface ChallengeFlag {
  flag_challenge?: Challenge;
  /** @format date-time */
  flag_created_at?: string;
  flag_id?: string;
  flag_type?: "VALUE" | "VALUE_CASE" | "REGEXP";
  /** @format date-time */
  flag_updated_at?: string;
  flag_value?: string;
  listened?: boolean;
}

export interface ChallengeInformation {
  challenge_detail?: PublicChallenge;
  challenge_expectation?: InjectExpectation;
}

export interface ChallengeResult {
  result?: boolean;
}

export interface ChallengeTryInput {
  challenge_value?: string;
}

export interface ChallengeUpdateInput {
  challenge_category?: string;
  challenge_content?: string;
  challenge_documents?: string[];
  challenge_flags: FlagInput[];
  /** @format int32 */
  challenge_max_attempts?: number;
  challenge_name: string;
  /** @format int32 */
  challenge_score?: number;
  challenge_tags?: string[];
}

export interface ChallengesReader {
  exercise_challenges?: ChallengeInformation[];
  exercise_id?: string;
  exercise_information?: PublicExercise;
}

export interface ChangePasswordInput {
  password: string;
  password_validation: string;
}

export interface Channel {
  /** @format date-time */
  channel_created_at: string;
  channel_description?: string;
  channel_id: string;
  channel_logo_dark?: Document;
  channel_logo_light?: Document;
  channel_mode?: string;
  channel_name?: string;
  channel_primary_color_dark?: string;
  channel_primary_color_light?: string;
  channel_secondary_color_dark?: string;
  channel_secondary_color_light?: string;
  channel_type?: string;
  /** @format date-time */
  channel_updated_at: string;
  listened?: boolean;
  logos?: Document[];
}

export interface ChannelCreateInput {
  channel_description: string;
  channel_name: string;
  channel_type: string;
}

export interface ChannelReader {
  channel_articles?: Article[];
  channel_exercise?: Exercise;
  channel_id?: string;
  channel_information?: Channel;
  channel_scenario?: Scenario;
}

export interface ChannelUpdateInput {
  channel_description: string;
  channel_mode?: string;
  channel_name: string;
  channel_primary_color_dark?: string;
  channel_primary_color_light?: string;
  channel_secondary_color_dark?: string;
  channel_secondary_color_light?: string;
  channel_type: string;
}

export interface ChannelUpdateLogoInput {
  channel_logo_dark?: string;
  channel_logo_light?: string;
}

export interface Collector {
  /** @format date-time */
  collector_created_at: string;
  collector_external?: boolean;
  collector_id: string;
  /** @format date-time */
  collector_last_execution?: string;
  collector_name: string;
  /** @format int32 */
  collector_period?: number;
  collector_security_platform?: SecurityPlatform;
  collector_type: string;
  /** @format date-time */
  collector_updated_at: string;
  listened?: boolean;
}

export interface CollectorCreateInput {
  collector_id: string;
  collector_name: string;
  /** @format int32 */
  collector_period?: number;
  collector_security_platform?: string;
  collector_type: string;
}

export interface CollectorUpdateInput {
  /** @format date-time */
  collector_last_execution?: string;
}

export interface Comcheck {
  /** @format date-time */
  comcheck_end_date: string;
  comcheck_exercise?: Exercise;
  comcheck_id: string;
  comcheck_message?: string;
  comcheck_name?: string;
  /** @format date-time */
  comcheck_start_date: string;
  comcheck_state?: "RUNNING" | "EXPIRED" | "FINISHED";
  comcheck_statuses?: ComcheckStatus[];
  comcheck_subject?: string;
  /** @format int64 */
  comcheck_users_number?: number;
  listened?: boolean;
}

export interface ComcheckInput {
  /** @format date-time */
  comcheck_end_date?: string;
  comcheck_message?: string;
  comcheck_name: string;
  comcheck_subject?: string;
  comcheck_teams?: string[];
}

export interface ComcheckStatus {
  comcheckstatus_comcheck?: Comcheck;
  comcheckstatus_id?: string;
  /** @format date-time */
  comcheckstatus_receive_date?: string;
  /** @format date-time */
  comcheckstatus_sent_date?: string;
  /** @format int32 */
  comcheckstatus_sent_retry?: number;
  comcheckstatus_state?: "RUNNING" | "SUCCESS" | "FAILURE";
  comcheckstatus_user?: User;
  listened?: boolean;
}

export interface Communication {
  communication_ack?: boolean;
  communication_animation?: boolean;
  communication_attachments?: string[];
  communication_content?: string;
  communication_content_html?: string;
  communication_exercise?: string;
  communication_from: string;
  communication_id: string;
  communication_inject?: Inject;
  communication_message_id: string;
  /** @format date-time */
  communication_received_at: string;
  /** @format date-time */
  communication_sent_at: string;
  communication_subject?: string;
  communication_to: string;
  communication_users?: User[];
  listened?: boolean;
}

export interface CreateUserInput {
  user_admin?: boolean;
  user_email: string;
  user_firstname?: string;
  user_lastname?: string;
  user_organization?: string;
  user_plain_password?: string;
  user_tags?: string[];
}

export interface DirectInjectInput {
  inject_content?: object;
  inject_description?: string;
  inject_documents?: InjectDocumentInput[];
  inject_injector_contract?: string;
  inject_title?: string;
  inject_users?: string[];
}

export interface Document {
  document_description?: string;
  /** @uniqueItems true */
  document_exercises?: Exercise[];
  document_id: string;
  document_name: string;
  /** @uniqueItems true */
  document_scenarios?: Scenario[];
  /** @uniqueItems true */
  document_tags?: Tag[];
  document_target?: string;
  document_type: string;
  listened?: boolean;
}

export interface DocumentCreateInput {
  document_description?: string;
  document_exercises?: string[];
  document_scenarios?: string[];
  document_tags?: string[];
}

export interface DocumentTagUpdateInput {
  tags?: string[];
}

export interface DocumentUpdateInput {
  document_description?: string;
  document_exercises?: string[];
  document_scenarios?: string[];
  document_tags?: string[];
}

export interface DryInject {
  /** @format date-time */
  dryinject_date: string;
  dryinject_dryrun?: Dryrun;
  dryinject_exercise?: Exercise;
  dryinject_id?: string;
  dryinject_inject?: Inject;
  dryinject_status?: DryInjectStatus;
  listened?: boolean;
}

export interface DryInjectStatus {
  listened?: boolean;
  status_id?: string;
  status_name?:
    | "DRAFT"
    | "INFO"
    | "QUEUING"
    | "EXECUTING"
    | "PENDING"
    | "PARTIAL"
    | "ERROR"
    | "MAYBE_PARTIAL_PREVENTED"
    | "MAYBE_PREVENTED"
    | "SUCCESS";
  status_traces?: InjectStatusExecution[];
  /** @format date-time */
  tracking_ack_date?: string;
  /** @format date-time */
  tracking_end_date?: string;
  /** @format date-time */
  tracking_sent_date?: string;
  /** @format int32 */
  tracking_total_count?: number;
  /** @format int32 */
  tracking_total_error?: number;
  /** @format int64 */
  tracking_total_execution_time?: number;
  /** @format int32 */
  tracking_total_success?: number;
}

export interface Dryrun {
  /** @format date-time */
  dryrun_date: string;
  /** @format date-time */
  dryrun_end_date?: string;
  dryrun_exercise?: Exercise;
  dryrun_finished?: boolean;
  dryrun_id: string;
  dryrun_name?: string;
  /** @format int32 */
  dryrun_speed?: number;
  /** @format date-time */
  dryrun_start_date?: string;
  dryrun_users?: User[];
  /** @format int64 */
  dryrun_users_number?: number;
  listened?: boolean;
}

export interface DryrunCreateInput {
  dryrun_name: string;
  dryrun_users?: string[];
}

export interface Endpoint {
  asset_active?: boolean;
  asset_children?: Asset[];
  /** @format date-time */
  asset_cleared_at?: string;
  /** @format date-time */
  asset_created_at: string;
  asset_description?: string;
  asset_executor?: Executor;
  asset_external_reference?: string;
  asset_id: string;
  asset_inject?: Inject;
  /** @format date-time */
  asset_last_seen?: string;
  asset_name: string;
  asset_parent?: Asset;
  asset_process_name?: string;
  /** @uniqueItems true */
  asset_tags?: Tag[];
  asset_type?: string;
  /** @format date-time */
  asset_updated_at: string;
  endpoint_agent_version?: string;
  endpoint_arch: "x86_64" | "arm64" | "Unknown";
  endpoint_hostname?: string;
  endpoint_ips: string[];
  endpoint_mac_addresses?: string[];
  endpoint_platform: "Linux" | "Windows" | "MacOS" | "Container" | "Service" | "Generic" | "Internal" | "Unknown";
  listened?: boolean;
}

export interface EndpointInput {
  asset_description?: string;
  /** @format date-time */
  asset_last_seen?: string | null;
  asset_name: string;
  asset_tags?: string[];
  endpoint_agent_version?: string;
  endpoint_arch: "x86_64" | "arm64" | "Unknown";
  endpoint_hostname?: string;
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  endpoint_ips: string[];
  endpoint_mac_addresses?: string[];
  endpoint_platform: "Linux" | "Windows" | "MacOS" | "Container" | "Service" | "Generic" | "Internal" | "Unknown";
}

export interface EndpointRegisterInput {
  asset_description?: string;
  asset_external_reference: string;
  /** @format date-time */
  asset_last_seen?: string | null;
  asset_name: string;
  asset_tags?: string[];
  endpoint_agent_version?: string;
  endpoint_arch: "x86_64" | "arm64" | "Unknown";
  endpoint_hostname?: string;
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  endpoint_ips: string[];
  endpoint_mac_addresses?: string[];
  endpoint_platform: "Linux" | "Windows" | "MacOS" | "Container" | "Service" | "Generic" | "Internal" | "Unknown";
}

export interface Evaluation {
  /** @format date-time */
  evaluation_created_at: string;
  evaluation_id: string;
  evaluation_objective: Objective;
  /** @format int64 */
  evaluation_score?: number;
  /** @format date-time */
  evaluation_updated_at: string;
  evaluation_user: User;
  listened?: boolean;
}

export interface EvaluationInput {
  /** @format int64 */
  evaluation_score?: number;
}

export interface Executor {
  /** @format date-time */
  executor_created_at: string;
  executor_doc?: string;
  executor_id: string;
  executor_name: string;
  executor_platforms?: string[];
  executor_type: string;
  /** @format date-time */
  executor_updated_at: string;
  listened?: boolean;
}

export interface ExecutorCreateInput {
  executor_id: string;
  executor_name: string;
  executor_platforms?: string[];
  executor_type: string;
}

export interface ExecutorUpdateInput {
  /** @format date-time */
  executor_last_execution?: string;
}

export interface Exercise {
  /** @format int64 */
  exercise_all_users_number?: number;
  exercise_articles?: Article[];
  exercise_category?: string;
  /** @format int64 */
  exercise_communications_number?: number;
  /** @format date-time */
  exercise_created_at: string;
  exercise_description?: string;
  exercise_documents?: Document[];
  /** @format date-time */
  exercise_end_date?: string;
  exercise_id: string;
  exercise_injects?: Inject[];
  exercise_injects_statistics?: Record<string, number>;
  exercise_kill_chain_phases?: KillChainPhase[];
  exercise_lessons_anonymized?: boolean;
  /** @format int64 */
  exercise_lessons_answers_number?: number;
  exercise_lessons_categories?: LessonsCategory[];
  exercise_logo_dark?: Document;
  exercise_logo_light?: Document;
  /** @format int64 */
  exercise_logs_number?: number;
  exercise_mail_from: string;
  exercise_mails_reply_to?: string[];
  exercise_main_focus?: string;
  exercise_message_footer?: string;
  exercise_message_header?: string;
  exercise_name: string;
  /** @format date-time */
  exercise_next_inject_date?: string;
  exercise_next_possible_status?: ("SCHEDULED" | "CANCELED" | "RUNNING" | "PAUSED" | "FINISHED")[];
  exercise_observers?: User[];
  exercise_pauses?: Pause[];
  exercise_planners?: User[];
  exercise_platforms?: ("Linux" | "Windows" | "MacOS" | "Container" | "Service" | "Generic" | "Internal" | "Unknown")[];
  exercise_scenario?: Scenario;
  /** @format double */
  exercise_score?: number;
  exercise_severity?: "low" | "medium" | "high" | "critical";
  /** @format date-time */
  exercise_start_date?: string;
  exercise_status: "SCHEDULED" | "CANCELED" | "RUNNING" | "PAUSED" | "FINISHED";
  exercise_subtitle?: string;
  /** @uniqueItems true */
  exercise_tags?: Tag[];
  exercise_teams?: Team[];
  exercise_teams_users?: ExerciseTeamUser[];
  /** @format date-time */
  exercise_updated_at: string;
  exercise_users?: User[];
  /** @format int64 */
  exercise_users_number?: number;
  listened?: boolean;
}

export interface ExerciseCreateInput {
  exercise_category?: string;
  exercise_description?: string;
  exercise_main_focus?: string;
  exercise_name: string;
  exercise_severity?: string;
  /** @format date-time */
  exercise_start_date?: string | null;
  exercise_subtitle?: string;
  exercise_tags?: string[];
}

export interface ExerciseDetails {
  /** @format int64 */
  exercise_all_users_number?: number;
  /** @uniqueItems true */
  exercise_articles?: string[];
  exercise_category?: string;
  /** @format int64 */
  exercise_communications_number?: number;
  /** @format date-time */
  exercise_created_at?: string;
  exercise_description?: string;
  /** @uniqueItems true */
  exercise_documents?: string[];
  /** @format date-time */
  exercise_end_date?: string;
  exercise_id: string;
  /** @uniqueItems true */
  exercise_injects?: string[];
  exercise_injects_statistics?: Record<string, number>;
  exercise_kill_chain_phases?: KillChainPhase[];
  exercise_lessons_anonymized?: boolean;
  /** @format int64 */
  exercise_lessons_answers_number?: number;
  /** @uniqueItems true */
  exercise_lessons_categories?: string[];
  /** @format int64 */
  exercise_logs_number?: number;
  exercise_mail_from?: string;
  exercise_mails_reply_to?: string[];
  exercise_main_focus?: string;
  exercise_message_footer?: string;
  exercise_message_header?: string;
  exercise_name: string;
  /** @format date-time */
  exercise_next_inject_date?: string;
  exercise_next_possible_status?: ("SCHEDULED" | "CANCELED" | "RUNNING" | "PAUSED" | "FINISHED")[];
  /** @uniqueItems true */
  exercise_observers?: string[];
  /** @uniqueItems true */
  exercise_pauses?: string[];
  /** @uniqueItems true */
  exercise_planners?: string[];
  exercise_platforms?: string[];
  exercise_scenario?: string;
  /** @format double */
  exercise_score?: number;
  exercise_severity?: string;
  /** @format date-time */
  exercise_start_date?: string;
  exercise_status?: "SCHEDULED" | "CANCELED" | "RUNNING" | "PAUSED" | "FINISHED";
  exercise_subtitle?: string;
  /** @uniqueItems true */
  exercise_tags?: string[];
  /** @uniqueItems true */
  exercise_teams?: string[];
  /** @uniqueItems true */
  exercise_teams_users?: ExerciseTeamUser[];
  /** @format date-time */
  exercise_updated_at?: string;
  /** @uniqueItems true */
  exercise_users?: string[];
  /** @format int64 */
  exercise_users_number?: number;
}

export interface ExerciseSimple {
  exercise_category?: string;
  exercise_global_score?: ExpectationResultsByType[];
  exercise_id: string;
  exercise_name: string;
  /** @format date-time */
  exercise_start_date?: string;
  exercise_status?: "SCHEDULED" | "CANCELED" | "RUNNING" | "PAUSED" | "FINISHED";
  exercise_subtitle?: string;
  /** @uniqueItems true */
  exercise_tags?: Tag[];
  exercise_targets: InjectTargetWithResult[];
  /** @format date-time */
  exercise_updated_at?: string;
}

export interface ExerciseTeamPlayersEnableInput {
  exercise_team_players?: string[];
}

export interface ExerciseTeamUser {
  exercise_id?: Exercise;
  team_id?: Team;
  user_id?: User;
}

export interface ExerciseUpdateInput {
  exercise_category?: string;
  exercise_description?: string;
  exercise_mail_from?: string;
  exercise_mails_reply_to?: string[];
  exercise_main_focus?: string;
  exercise_message_footer?: string;
  exercise_message_header?: string;
  exercise_name: string;
  exercise_severity?: string;
  exercise_subtitle?: string;
  exercise_tags?: string[];
}

export interface ExerciseUpdateLogoInput {
  exercise_logo_dark?: string;
  exercise_logo_light?: string;
}

export interface ExerciseUpdateStartDateInput {
  /** @format date-time */
  exercise_start_date?: string;
}

export interface ExerciseUpdateStatusInput {
  exercise_status?: "SCHEDULED" | "CANCELED" | "RUNNING" | "PAUSED" | "FINISHED";
}

export interface ExerciseUpdateTagsInput {
  exercise_tags?: string[];
}

export interface ExerciseUpdateTeamsInput {
  exercise_teams?: string[];
}

export interface ExpectationResultsByType {
  avgResult: "FAILED" | "PENDING" | "PARTIAL" | "UNKNOWN" | "SUCCESS";
  distribution: ResultDistribution[];
  type: "DETECTION" | "HUMAN_RESPONSE" | "PREVENTION";
}

export interface ExpectationUpdateInput {
  /** @format double */
  expectation_score: number;
  source_id: string;
  source_name: string;
  source_type: string;
}

export interface ExportMapperInput {
  export_mapper_name?: string;
  ids_to_export: string[];
}

export interface Filter {
  key: string;
  mode?: "and" | "or";
  operator?:
    | "eq"
    | "not_eq"
    | "contains"
    | "not_contains"
    | "starts_with"
    | "not_starts_with"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "empty"
    | "not_empty";
  values?: string[];
}

export interface FilterGroup {
  filters?: Filter[];
  mode: "and" | "or";
}

export interface FlagInput {
  flag_type: string;
  flag_value: string;
}

export interface FullTextSearchCountResult {
  clazz: string;
  /** @format int64 */
  count: number;
}

export interface FullTextSearchResult {
  clazz: string;
  description?: string;
  id: string;
  name: string;
  /** @uniqueItems true */
  tags?: Tag[];
}

export interface Grant {
  grant_exercise?: Exercise;
  grant_group?: Group;
  grant_id: string;
  grant_name: "OBSERVER" | "PLANNER";
  grant_scenario?: Scenario;
  listened?: boolean;
}

export interface Group {
  group_default_exercise_assign?: ("OBSERVER" | "PLANNER")[];
  group_default_exercise_observer?: boolean;
  group_default_exercise_planner?: boolean;
  group_default_scenario_assign?: ("OBSERVER" | "PLANNER")[];
  group_default_scenario_observer?: boolean;
  group_default_scenario_planner?: boolean;
  group_default_user_assign?: boolean;
  group_description?: string;
  group_grants?: Grant[];
  group_id: string;
  group_name: string;
  group_organizations?: Organization[];
  group_users?: User[];
  listened?: boolean;
}

export interface GroupCreateInput {
  group_default_exercise_observer?: boolean;
  group_default_exercise_planner?: boolean;
  group_default_scenario_observer?: boolean;
  group_default_scenario_planner?: boolean;
  group_default_user_assign?: boolean;
  group_description?: string;
  group_name: string;
}

export interface GroupGrantInput {
  grant_exercise?: string;
  grant_name?: "OBSERVER" | "PLANNER";
  grant_scenario?: string;
}

export interface GroupUpdateUsersInput {
  group_users?: string[];
}

export interface ImportMapper {
  /** @format date-time */
  import_mapper_created_at?: string;
  import_mapper_id: string;
  import_mapper_inject_importers?: InjectImporter[];
  import_mapper_inject_type_column: string;
  import_mapper_name: string;
  /** @format date-time */
  import_mapper_updated_at?: string;
  listened?: boolean;
}

export interface ImportMapperAddInput {
  import_mapper_inject_importers: InjectImporterAddInput[];
  /** @pattern ^[A-Z]{1,2}$ */
  import_mapper_inject_type_column: string;
  import_mapper_name: string;
}

export interface ImportMapperUpdateInput {
  import_mapper_inject_importers: InjectImporterUpdateInput[];
  /** @pattern ^[A-Z]{1,2}$ */
  import_mapper_inject_type_column: string;
  import_mapper_name: string;
}

export interface ImportMessage {
  message_code?:
    | "NO_POTENTIAL_MATCH_FOUND"
    | "SEVERAL_MATCHES"
    | "ABSOLUTE_TIME_WITHOUT_START_DATE"
    | "DATE_SET_IN_PAST"
    | "DATE_SET_IN_FUTURE"
    | "NO_TEAM_FOUND"
    | "EXPECTATION_SCORE_UNDEFINED";
  message_level?: "CRITICAL" | "ERROR" | "WARN" | "INFO";
  message_params?: Record<string, string>;
}

export interface ImportPostSummary {
  available_sheets: string[];
  import_id: string;
}

export interface ImportTestSummary {
  import_message?: ImportMessage[];
  injects?: InjectResultDTO[];
  /** @format int32 */
  total_injects?: number;
}

export interface Inject {
  footer?: string;
  header?: string;
  inject_all_teams?: boolean;
  inject_asset_groups?: AssetGroup[];
  inject_assets?: Asset[];
  inject_attack_patterns?: AttackPattern[];
  inject_city?: string;
  inject_communications?: Communication[];
  /** @format int64 */
  inject_communications_not_ack_number?: number;
  /** @format int64 */
  inject_communications_number?: number;
  inject_content?: object;
  inject_country?: string;
  /** @format date-time */
  inject_created_at: string;
  /** @format date-time */
  inject_date?: string;
  /**
   * @format int64
   * @min 0
   */
  inject_depends_duration: number;
  inject_depends_on?: Inject;
  inject_description?: string;
  inject_documents?: InjectDocument[];
  inject_enabled?: boolean;
  inject_exercise?: Exercise;
  inject_expectations?: InjectExpectation[];
  inject_id: string;
  inject_injector_contract?: InjectorContract;
  inject_kill_chain_phases?: KillChainPhase[];
  inject_payloads?: Asset[];
  inject_ready?: boolean;
  inject_scenario?: Scenario;
  /** @format date-time */
  inject_sent_at?: string;
  inject_status?: InjectStatus;
  /** @uniqueItems true */
  inject_tags?: Tag[];
  inject_teams?: Team[];
  inject_testable?: boolean;
  inject_title: string;
  inject_type?: string;
  /** @format date-time */
  inject_updated_at: string;
  inject_user?: User;
  /** @format int64 */
  inject_users_number?: number;
  listened?: boolean;
}

export interface InjectDocument {
  document_attached?: boolean;
  document_id?: Document;
  document_name?: string;
  inject_id?: Inject;
}

export interface InjectDocumentInput {
  document_attached?: boolean;
  document_id?: string;
}

export interface InjectExecutionInput {
  execution_context_identifiers?: string[];
  /** @format int32 */
  execution_duration?: number;
  execution_message?: string;
  execution_status: string;
}

export interface InjectExpectation {
  inject_expectation_article?: Article;
  inject_expectation_asset?: Asset;
  inject_expectation_asset_group?: AssetGroup;
  inject_expectation_challenge?: Challenge;
  /** @format date-time */
  inject_expectation_created_at?: string;
  inject_expectation_description?: string;
  inject_expectation_exercise?: Exercise;
  /** @format double */
  inject_expectation_expected_score: number;
  inject_expectation_group?: boolean;
  inject_expectation_id: string;
  inject_expectation_inject?: Inject;
  inject_expectation_name?: string;
  inject_expectation_results?: InjectExpectationResult[];
  /** @format double */
  inject_expectation_score?: number;
  inject_expectation_signatures?: InjectExpectationSignature[];
  inject_expectation_status?: "FAILED" | "PENDING" | "PARTIAL" | "UNKNOWN" | "SUCCESS";
  inject_expectation_team?: Team;
  inject_expectation_type: "TEXT" | "DOCUMENT" | "ARTICLE" | "CHALLENGE" | "MANUAL" | "PREVENTION" | "DETECTION";
  /** @format date-time */
  inject_expectation_updated_at?: string;
  inject_expectation_user?: User;
  listened?: boolean;
  targetId?: string;
}

export interface InjectExpectationResult {
  date?: string;
  result: string;
  /** @format double */
  score?: number;
  sourceId?: string;
  sourceName?: string;
  sourceType?: string;
}

export interface InjectExpectationResultsByAttackPattern {
  inject_attack_pattern?: AttackPattern;
  inject_expectation_results?: InjectExpectationResultsByType[];
}

export interface InjectExpectationResultsByType {
  inject_title?: string;
  results?: ExpectationResultsByType[];
}

export interface InjectExpectationSignature {
  type?: string;
  value?: string;
}

export interface InjectExpectationUpdateInput {
  collector_id: string;
  is_success: boolean;
  result: string;
  success?: boolean;
}

export interface InjectImporter {
  /** @format date-time */
  inject_importer_created_at?: string;
  inject_importer_id: string;
  inject_importer_injector_contract: InjectorContract;
  inject_importer_rule_attributes?: RuleAttribute[];
  inject_importer_type_value: string;
  /** @format date-time */
  inject_importer_updated_at?: string;
  listened?: boolean;
}

export interface InjectImporterAddInput {
  inject_importer_injector_contract: string;
  inject_importer_rule_attributes?: RuleAttributeAddInput[];
  inject_importer_type_value: string;
}

export interface InjectImporterUpdateInput {
  inject_importer_id?: string;
  inject_importer_injector_contract: string;
  inject_importer_rule_attributes?: RuleAttributeUpdateInput[];
  inject_importer_type_value: string;
}

export interface InjectInput {
  inject_all_teams?: boolean;
  inject_asset_groups?: string[];
  inject_assets?: string[];
  inject_city?: string;
  inject_content?: object;
  inject_country?: string;
  /** @format int64 */
  inject_depends_duration?: number;
  inject_depends_from_another?: string;
  inject_description?: string;
  inject_documents?: InjectDocumentInput[];
  inject_injector_contract?: string;
  inject_tags?: string[];
  inject_teams?: string[];
  inject_title?: string;
}

export interface InjectOutput {
  inject_asset_groups?: string[];
  inject_assets?: string[];
  inject_content?: object;
  /**
   * @format int64
   * @min 0
   */
  inject_depends_duration: number;
  inject_depends_on?: string;
  inject_enabled?: boolean;
  inject_exercise?: string;
  inject_id: string;
  inject_injector_contract?: InjectorContract;
  inject_ready?: boolean;
  inject_scenario?: string;
  /** @uniqueItems true */
  inject_tags?: string[];
  inject_teams?: string[];
  inject_testable?: boolean;
  inject_title: string;
  inject_type?: string;
}

export interface InjectReceptionInput {
  /** @format int32 */
  tracking_total_count?: number;
}

export interface InjectResultDTO {
  /** Attack Patterns */
  inject_attack_patterns: AttackPattern[];
  inject_commands_lines?: InjectStatusCommandLine;
  inject_content?: object;
  /** Description */
  inject_description: string;
  /** Result of expectations */
  inject_expectation_results: ExpectationResultsByType[];
  inject_expectations?: InjectExpectation[];
  /** Id */
  inject_id: string;
  inject_injector_contract: InjectorContract;
  /** Kill Chain Phases */
  inject_kill_chain_phases: KillChainPhase[];
  inject_ready?: boolean;
  inject_status?: InjectStatus;
  /**
   * Specifies the categories of targetResults for atomic testing.
   * @example "assets, asset groups, teams, players"
   */
  inject_targets: InjectTargetWithResult[];
  /** Title */
  inject_title: string;
  inject_type?: string;
  /** @format date-time */
  inject_updated_at?: string;
  injects_documents?: string[];
  injects_tags?: string[];
}

export interface InjectStatus {
  listened?: boolean;
  status_commands_lines?: InjectStatusCommandLine;
  status_id?: string;
  status_name:
    | "DRAFT"
    | "INFO"
    | "QUEUING"
    | "EXECUTING"
    | "PENDING"
    | "PARTIAL"
    | "ERROR"
    | "MAYBE_PARTIAL_PREVENTED"
    | "MAYBE_PREVENTED"
    | "SUCCESS";
  status_traces?: InjectStatusExecution[];
  /** @format date-time */
  tracking_ack_date?: string;
  /** @format date-time */
  tracking_end_date?: string;
  /** @format date-time */
  tracking_sent_date?: string;
  /** @format int32 */
  tracking_total_count?: number;
  /** @format int32 */
  tracking_total_error?: number;
  /** @format int64 */
  tracking_total_execution_time?: number;
  /** @format int32 */
  tracking_total_success?: number;
}

export interface InjectStatusCommandLine {
  cleanup_command?: string[];
  content?: string[];
  external_id?: string;
}

export interface InjectStatusExecution {
  execution_category?: string;
  execution_context_identifiers?: string[];
  /** @format int32 */
  execution_duration?: number;
  execution_message?: string;
  execution_status?:
    | "DRAFT"
    | "INFO"
    | "QUEUING"
    | "EXECUTING"
    | "PENDING"
    | "PARTIAL"
    | "ERROR"
    | "MAYBE_PARTIAL_PREVENTED"
    | "MAYBE_PREVENTED"
    | "SUCCESS";
  /** @format date-time */
  execution_time?: string;
}

export interface InjectTargetWithResult {
  children?: InjectTargetWithResult[];
  expectationResultsByTypes?: ExpectationResultsByType[];
  id: string;
  name?: string;
  platformType?: "Linux" | "Windows" | "MacOS" | "Container" | "Service" | "Generic" | "Internal" | "Unknown";
  targetType?: "ASSETS" | "ASSETS_GROUPS" | "PLAYER" | "TEAMS";
}

export interface InjectTeamsInput {
  inject_teams?: string[];
}

export interface InjectTestStatus {
  inject_id?: string;
  /** @format date-time */
  inject_test_status_created_at?: string;
  /** @format date-time */
  inject_test_status_updated_at?: string;
  inject_title?: string;
  inject_type?: string;
  injector_contract?: InjectorContract;
  listened?: boolean;
  status_id?: string;
  status_name:
    | "DRAFT"
    | "INFO"
    | "QUEUING"
    | "EXECUTING"
    | "PENDING"
    | "PARTIAL"
    | "ERROR"
    | "MAYBE_PARTIAL_PREVENTED"
    | "MAYBE_PREVENTED"
    | "SUCCESS";
  status_traces?: InjectStatusExecution[];
  /** @format date-time */
  tracking_ack_date?: string;
  /** @format date-time */
  tracking_end_date?: string;
  /** @format date-time */
  tracking_sent_date?: string;
  /** @format int32 */
  tracking_total_count?: number;
  /** @format int32 */
  tracking_total_error?: number;
  /** @format int64 */
  tracking_total_execution_time?: number;
  /** @format int32 */
  tracking_total_success?: number;
}

export interface InjectUpdateActivationInput {
  inject_enabled?: boolean;
}

export interface InjectUpdateStatusInput {
  message?: string;
  status?: string;
}

export interface InjectUpdateTriggerInput {
  /** @format int64 */
  inject_depends_duration?: number;
}

export interface Injector {
  injector_category?: string;
  /** @format date-time */
  injector_created_at: string;
  injector_custom_contracts?: boolean;
  injector_executor_clear_commands?: Record<string, string>;
  injector_executor_commands?: Record<string, string>;
  injector_external?: boolean;
  injector_id: string;
  injector_name: string;
  injector_payloads?: boolean;
  injector_type: string;
  /** @format date-time */
  injector_updated_at: string;
  listened?: boolean;
}

export interface InjectorConnection {
  host?: string;
  pass?: string;
  /** @format int32 */
  port?: number;
  use_ssl?: boolean;
  user?: string;
  vhost?: string;
}

export interface InjectorContract {
  convertedContent?: object;
  injector_contract_atomic_testing?: boolean;
  injector_contract_attack_patterns?: AttackPattern[];
  injector_contract_content: string;
  /** @format date-time */
  injector_contract_created_at: string;
  injector_contract_custom?: boolean;
  injector_contract_id: string;
  injector_contract_import_available?: boolean;
  injector_contract_injector: Injector;
  injector_contract_injector_type?: string;
  injector_contract_labels?: Record<string, string>;
  injector_contract_manual?: boolean;
  injector_contract_needs_executor?: boolean;
  injector_contract_payload?: Payload;
  injector_contract_platforms?: (
    | "Linux"
    | "Windows"
    | "MacOS"
    | "Container"
    | "Service"
    | "Generic"
    | "Internal"
    | "Unknown"
  )[];
  /** @format date-time */
  injector_contract_updated_at: string;
  listened?: boolean;
}

export interface InjectorContractAddInput {
  atomicTesting?: boolean;
  contract_attack_patterns_external_ids?: string[];
  contract_attack_patterns_ids?: string[];
  contract_content: string;
  contract_id: string;
  contract_labels?: Record<string, string>;
  contract_manual?: boolean;
  contract_platforms?: string[];
  injector_id: string;
  is_atomic_testing?: boolean;
}

export interface InjectorContractInput {
  atomicTesting?: boolean;
  contract_attack_patterns_external_ids?: string[];
  contract_content: string;
  contract_id: string;
  contract_labels?: Record<string, string>;
  contract_manual?: boolean;
  contract_platforms?: ("Linux" | "Windows" | "MacOS" | "Container" | "Service" | "Generic" | "Internal" | "Unknown")[];
  is_atomic_testing?: boolean;
}

export interface InjectorContractOutput {
  injector_contract_attack_patterns?: string[];
  injector_contract_content: string;
  injector_contract_id: string;
  injector_contract_injector_type?: string;
  injector_contract_labels?: Record<string, string>;
  injector_contract_payload_type?: string;
  injector_contract_platforms?: (
    | "Linux"
    | "Windows"
    | "MacOS"
    | "Container"
    | "Service"
    | "Generic"
    | "Internal"
    | "Unknown"
  )[];
}

export interface InjectorContractUpdateInput {
  atomicTesting?: boolean;
  contract_attack_patterns_ids?: string[];
  contract_content: string;
  contract_labels?: Record<string, string>;
  contract_manual?: boolean;
  contract_platforms?: string[];
  is_atomic_testing?: boolean;
}

export interface InjectorContractUpdateMappingInput {
  contract_attack_patterns_ids?: string[];
}

export interface InjectorCreateInput {
  injector_category?: string;
  injector_contracts?: InjectorContractInput[];
  injector_custom_contracts?: boolean;
  injector_executor_clear_commands?: Record<string, string>;
  injector_executor_commands?: Record<string, string>;
  injector_id: string;
  injector_name: string;
  injector_payloads?: boolean;
  injector_type: string;
}

export interface InjectorRegistration {
  connection?: InjectorConnection;
  listen?: string;
}

export interface InjectorUpdateInput {
  injector_category?: string;
  injector_contracts?: InjectorContractInput[];
  injector_custom_contracts?: boolean;
  injector_executor_clear_commands?: Record<string, string>;
  injector_executor_commands?: Record<string, string>;
  injector_name: string;
  injector_payloads?: boolean;
}

export interface InjectsImportInput {
  import_mapper_id: string;
  /** @format date-time */
  launch_date?: string;
  sheet_name: string;
  /** @format int32 */
  timezone_offset: number;
}

export interface InjectsImportTestInput {
  import_mapper: ImportMapperAddInput;
  sheet_name: string;
  /** @format int32 */
  timezone_offset: number;
}

export type JsonNode = object;

export interface KillChainPhase {
  listened?: boolean;
  /** @format date-time */
  phase_created_at: string;
  phase_description?: string;
  phase_external_id: string;
  phase_id: string;
  phase_kill_chain_name: string;
  phase_name: string;
  /** @format int64 */
  phase_order?: number;
  phase_shortname: string;
  phase_stix_id?: string;
  /** @format date-time */
  phase_updated_at: string;
}

export interface KillChainPhaseCreateInput {
  phase_description?: string;
  phase_external_id?: string;
  phase_kill_chain_name: string;
  phase_name: string;
  /** @format int64 */
  phase_order?: number;
  phase_shortname: string;
  phase_stix_id?: string;
}

export interface KillChainPhaseUpdateInput {
  phase_kill_chain_name: string;
  phase_name: string;
  /** @format int64 */
  phase_order?: number;
}

export interface KillChainPhaseUpsertInput {
  kill_chain_phases?: KillChainPhaseCreateInput[];
}

export interface LessonsAnswer {
  /** @format date-time */
  lessons_answer_created_at: string;
  lessons_answer_exercise?: string;
  lessons_answer_negative?: string;
  lessons_answer_positive?: string;
  lessons_answer_question: LessonsQuestion;
  /** @format int32 */
  lessons_answer_score: number;
  /** @format date-time */
  lessons_answer_updated_at: string;
  lessons_answer_user?: User;
  lessonsanswer_id: string;
  listened?: boolean;
}

export interface LessonsAnswerCreateInput {
  lessons_answer_negative?: string;
  lessons_answer_positive?: string;
  /** @format int32 */
  lessons_answer_score?: number;
}

export interface LessonsCategory {
  /** @format date-time */
  lessons_category_created_at: string;
  lessons_category_description?: string;
  lessons_category_exercise?: Exercise;
  lessons_category_name: string;
  /** @format int32 */
  lessons_category_order?: number;
  lessons_category_questions?: LessonsQuestion[];
  lessons_category_scenario?: Scenario;
  lessons_category_teams?: Team[];
  /** @format date-time */
  lessons_category_updated_at: string;
  lessons_category_users?: string[];
  lessonscategory_id: string;
  listened?: boolean;
}

export interface LessonsCategoryCreateInput {
  lessons_category_description?: string;
  lessons_category_name: string;
  /** @format int32 */
  lessons_category_order?: number;
}

export interface LessonsCategoryTeamsInput {
  lessons_category_teams?: string[];
}

export interface LessonsCategoryUpdateInput {
  lessons_category_description?: string;
  lessons_category_name: string;
  /** @format int32 */
  lessons_category_order?: number;
}

export interface LessonsInput {
  lessons_anonymized?: boolean;
}

export interface LessonsQuestion {
  lessons_question_answers?: LessonsAnswer[];
  lessons_question_category: LessonsCategory;
  lessons_question_content: string;
  /** @format date-time */
  lessons_question_created_at: string;
  lessons_question_exercise?: string;
  lessons_question_explanation?: string;
  /** @format int32 */
  lessons_question_order?: number;
  lessons_question_scenario?: string;
  /** @format date-time */
  lessons_question_updated_at: string;
  lessonsquestion_id: string;
  listened?: boolean;
}

export interface LessonsQuestionCreateInput {
  lessons_question_content: string;
  lessons_question_explanation?: string;
  /** @format int32 */
  lessons_question_order?: number;
}

export interface LessonsQuestionUpdateInput {
  lessons_question_content: string;
  lessons_question_explanation?: string;
  /** @format int32 */
  lessons_question_order?: number;
}

export interface LessonsSendInput {
  body?: string;
  subject?: string;
}

export interface LessonsTemplate {
  /** @format date-time */
  lessons_template_created_at: string;
  lessons_template_description?: string;
  lessons_template_name: string;
  /** @format date-time */
  lessons_template_updated_at: string;
  lessonstemplate_id: string;
  listened?: boolean;
}

export interface LessonsTemplateCategory {
  /** @format date-time */
  lessons_template_category_created_at: string;
  lessons_template_category_description?: string;
  lessons_template_category_name: string;
  /** @format int32 */
  lessons_template_category_order: number;
  lessons_template_category_questions?: LessonsTemplateQuestion[];
  lessons_template_category_template?: LessonsTemplate;
  /** @format date-time */
  lessons_template_category_updated_at: string;
  lessonstemplatecategory_id: string;
  listened?: boolean;
}

export interface LessonsTemplateCategoryInput {
  lessons_template_category_description?: string;
  lessons_template_category_name: string;
  /** @format int32 */
  lessons_template_category_order: number;
}

export interface LessonsTemplateInput {
  lessons_template_description?: string;
  lessons_template_name: string;
}

export interface LessonsTemplateQuestion {
  lessons_template_question_category?: LessonsTemplateCategory;
  lessons_template_question_content: string;
  /** @format date-time */
  lessons_template_question_created_at: string;
  lessons_template_question_explanation?: string;
  /** @format int32 */
  lessons_template_question_order: number;
  /** @format date-time */
  lessons_template_question_updated_at: string;
  lessonstemplatequestion_id: string;
  listened?: boolean;
}

export interface LessonsTemplateQuestionInput {
  lessons_template_question_content: string;
  lessons_template_question_explanation?: string;
  /** @format int32 */
  lessons_template_question_order: number;
}

export interface Log {
  listened?: boolean;
  log_content: string;
  /** @format date-time */
  log_created_at: string;
  log_exercise?: Exercise;
  log_id: string;
  /** @uniqueItems true */
  log_tags?: Tag[];
  log_title: string;
  /** @format date-time */
  log_updated_at: string;
  log_user?: User;
}

export interface LogCreateInput {
  log_content?: string;
  log_tags?: string[];
  log_title?: string;
}

export interface LoginUserInput {
  login: string;
  password: string;
}

export interface Mitigation {
  listened?: boolean;
  mitigation_attack_patterns?: AttackPattern[];
  /** @format date-time */
  mitigation_created_at: string;
  mitigation_description?: string;
  mitigation_external_id: string;
  mitigation_id: string;
  mitigation_log_sources?: string[];
  mitigation_name: string;
  mitigation_stix_id: string;
  mitigation_threat_hunting_techniques?: string;
  /** @format date-time */
  mitigation_updated_at: string;
}

export interface MitigationCreateInput {
  mitigation_attack_patterns?: string[];
  mitigation_description?: string;
  mitigation_external_id: string;
  mitigation_log_sources?: string[];
  mitigation_name: string;
  mitigation_stix_id?: string;
  mitigation_threat_hunting_techniques?: string;
}

export interface MitigationUpdateInput {
  mitigation_attack_patterns?: string[];
  mitigation_description?: string;
  mitigation_external_id: string;
  mitigation_name: string;
}

export interface MitigationUpsertInput {
  mitigations?: MitigationCreateInput[];
}

export interface OAuthProvider {
  provider_login?: string;
  provider_name?: string;
  provider_uri?: string;
}

export interface Objective {
  listened?: boolean;
  /** @format date-time */
  objective_created_at: string;
  objective_description?: string;
  objective_evaluations?: Evaluation[];
  objective_exercise?: Exercise;
  objective_id: string;
  /** @format int32 */
  objective_priority?: number;
  objective_scenario?: Scenario;
  /** @format double */
  objective_score?: number;
  objective_title?: string;
  /** @format date-time */
  objective_updated_at: string;
}

export interface ObjectiveInput {
  objective_description?: string;
  /** @format int32 */
  objective_priority?: number;
  objective_title?: string;
}

export interface Option {
  id?: string;
  label?: string;
}

export interface Organization {
  listened?: boolean;
  /** @format date-time */
  organization_created_at: string;
  organization_description?: string;
  organization_id: string;
  organization_injects?: Inject[];
  /** @format int64 */
  organization_injects_number?: number;
  organization_name: string;
  /** @uniqueItems true */
  organization_tags?: Tag[];
  /** @format date-time */
  organization_updated_at: string;
}

export interface OrganizationCreateInput {
  organization_description?: string;
  organization_name: string;
  organization_tags?: string[];
}

export interface OrganizationGrantInput {
  organization_id: string;
}

export interface OrganizationUpdateInput {
  organization_description?: string;
  organization_name: string;
  organization_tags?: string[];
}

export interface PageAtomicTestingOutput {
  content?: AtomicTestingOutput[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageAttackPattern {
  content?: AttackPattern[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageEndpoint {
  content?: Endpoint[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageExerciseSimple {
  content?: ExerciseSimple[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageFullTextSearchResult {
  content?: FullTextSearchResult[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageGroup {
  content?: Group[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageInjectResultDTO {
  content?: InjectResultDTO[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageInjectTestStatus {
  content?: InjectTestStatus[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageInjectorContractOutput {
  content?: InjectorContractOutput[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageKillChainPhase {
  content?: KillChainPhase[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageLessonsTemplate {
  content?: LessonsTemplate[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageMitigation {
  content?: Mitigation[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PagePayload {
  content?: Payload[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageRawPaginationAssetGroup {
  content?: RawPaginationAssetGroup[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageRawPaginationDocument {
  content?: RawPaginationDocument[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageRawPaginationImportMapper {
  content?: RawPaginationImportMapper[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageRawPaginationPlayer {
  content?: RawPaginationPlayer[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageRawPaginationScenario {
  content?: RawPaginationScenario[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageRawPaginationTeam {
  content?: RawPaginationTeam[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageSecurityPlatform {
  content?: SecurityPlatform[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageTag {
  content?: Tag[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageUser {
  content?: User[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  number?: number;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  /** @format int32 */
  size?: number;
  sort?: SortObject[];
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface PageableObject {
  /** @format int64 */
  offset?: number;
  /** @format int32 */
  pageNumber?: number;
  /** @format int32 */
  pageSize?: number;
  paged?: boolean;
  sort?: SortObject[];
  unpaged?: boolean;
}

export interface Pause {
  listened?: boolean;
  log_id?: string;
  /** @format date-time */
  pause_date?: string;
  /** @format int64 */
  pause_duration?: number;
  pause_exercise?: Exercise;
}

export interface Payload {
  listened?: boolean;
  payload_arguments?: PayloadArgument[];
  payload_attack_patterns?: AttackPattern[];
  payload_cleanup_command?: string;
  payload_cleanup_executor?: string;
  payload_collector?: Collector;
  payload_collector_type?: string;
  /** @format date-time */
  payload_created_at: string;
  payload_description?: string;
  payload_external_id?: string;
  payload_id: string;
  payload_name: string;
  payload_platforms?: ("Linux" | "Windows" | "MacOS" | "Container" | "Service" | "Generic" | "Internal" | "Unknown")[];
  payload_prerequisites?: PayloadPrerequisite[];
  payload_source?: "COMMUNITY" | "FILIGRAN" | "MANUAL";
  payload_status?: "UNVERIFIED" | "VERIFIED";
  /** @uniqueItems true */
  payload_tags?: Tag[];
  payload_type?: string;
  /** @format date-time */
  payload_updated_at: string;
}

export interface PayloadArgument {
  default_value: string;
  description?: string;
  key: string;
  type: string;
}

export interface PayloadCreateInput {
  command_content?: string;
  command_executor?: string;
  dns_resolution_hostname?: string;
  executable_file?: string;
  file_drop_file?: string;
  payload_arguments?: PayloadArgument[];
  payload_attack_patterns?: string[];
  payload_cleanup_command?: string;
  payload_cleanup_executor?: string;
  payload_description?: string;
  payload_name: string;
  payload_platforms: ("Linux" | "Windows" | "MacOS" | "Container" | "Service" | "Generic" | "Internal" | "Unknown")[];
  payload_prerequisites?: PayloadPrerequisite[];
  payload_source: string;
  payload_status: string;
  payload_tags?: string[];
  payload_type: string;
}

export interface PayloadPrerequisite {
  check_command?: string;
  description?: string;
  executor: string;
  get_command: string;
}

export interface PayloadUpdateInput {
  command_content?: string;
  command_executor?: string;
  dns_resolution_hostname?: string;
  executable_file?: string;
  file_drop_file?: string;
  payload_arguments?: PayloadArgument[];
  payload_attack_patterns?: string[];
  payload_cleanup_command?: string;
  payload_cleanup_executor?: string;
  payload_description?: string;
  payload_name: string;
  payload_platforms?: ("Linux" | "Windows" | "MacOS" | "Container" | "Service" | "Generic" | "Internal" | "Unknown")[];
  payload_prerequisites?: PayloadPrerequisite[];
  payload_tags?: string[];
}

export interface PayloadUpsertInput {
  command_content?: string;
  command_executor?: string;
  dns_resolution_hostname?: string;
  executable_file?: string;
  file_drop_file?: string;
  payload_arguments?: PayloadArgument[];
  payload_attack_patterns?: string[];
  payload_cleanup_command?: string;
  payload_cleanup_executor?: string;
  payload_collector?: string;
  payload_description?: string;
  payload_external_id: string;
  payload_name: string;
  payload_platforms?: string[];
  payload_prerequisites?: PayloadPrerequisite[];
  payload_source: string;
  payload_status: string;
  payload_tags?: string[];
  payload_type: string;
}

export interface PlatformSettings {
  auth_saml2_enable?: boolean;
  platform_saml2_providers?: OAuthProvider[];
  auth_local_enable?: boolean;
  auth_openid_enable?: boolean;
  disabled_dev_features?: string[];
  executor_caldera_enable?: boolean;
  executor_caldera_public_url?: string;
  executor_tanium_enable?: boolean;
  java_version?: string;
  map_tile_server_dark?: string;
  map_tile_server_light?: string;
  platform_agent_url?: string;
  platform_ai_enabled?: boolean;
  platform_ai_has_token?: boolean;
  platform_ai_model?: string;
  platform_ai_type?: string;
  platform_banner_by_level?: Record<string, string[]>;
  platform_base_url?: string;
  platform_dark_theme?: ThemeInput;
  platform_enterprise_edition?: string;
  platform_lang?: string;
  platform_light_theme?: ThemeInput;
  platform_name?: string;
  platform_openid_providers?: OAuthProvider[];
  platform_policies?: PolicyInput;
  platform_theme?: string;
  platform_version?: string;
  platform_whitemark?: string;
  postgre_version?: string;
  rabbitmq_version?: string;
  xtm_opencti_enable?: boolean;
  xtm_opencti_url?: string;
}

export interface PlatformStatistic {
  asset_groups_count?: StatisticElement;
  assets_count?: StatisticElement;
  exercises_count?: StatisticElement;
  expectation_results?: ExpectationResultsByType[];
  inject_expectation_results?: InjectExpectationResultsByAttackPattern[];
  injects_count?: StatisticElement;
  platform_id?: string;
  scenarios_count?: StatisticElement;
  teams_count?: StatisticElement;
  users_count?: StatisticElement;
}

export interface PlayerInput {
  /** @pattern ^\+[\d\s\-.()]+$ */
  user_phone2?: string;
  user_country?: string;
  user_email: string;
  user_firstname?: string;
  user_lastname?: string;
  user_organization?: string;
  user_pgp_key?: string;
  /** @pattern ^\+[\d\s\-.()]+$ */
  user_phone?: string;
  user_tags?: string[];
  user_teams?: string[];
}

export interface PolicyInput {
  platform_consent_confirm_text?: string;
  platform_consent_message?: string;
  platform_login_message?: string;
}

export interface PropertySchemaDTO {
  schema_property_has_dynamic_value?: boolean;
  schema_property_name: string;
  schema_property_type: string;
  schema_property_type_array?: boolean;
  schema_property_values?: string[];
}

export interface PublicChallenge {
  challenge_category?: string;
  challenge_content?: string;
  challenge_documents?: string[];
  challenge_flags?: PublicChallengeFlag[];
  challenge_id?: string;
  /** @format int32 */
  challenge_max_attempts?: number;
  challenge_name?: string;
  /** @format double */
  challenge_score?: number;
  challenge_tags?: string[];
  /** @format date-time */
  challenge_virtual_publication?: string;
}

export interface PublicChallengeFlag {
  flag_challenge?: string;
  flag_id?: string;
  flag_type?: "VALUE" | "VALUE_CASE" | "REGEXP";
}

export interface PublicExercise {
  exercise_description?: string;
  exercise_id?: string;
  exercise_name?: string;
}

export interface RawAttackPattern {
  attack_pattern_created_at?: string;
  attack_pattern_description?: string;
  attack_pattern_external_id?: string;
  attack_pattern_id?: string;
  attack_pattern_kill_chain_phases?: string[];
  attack_pattern_name?: string;
  attack_pattern_parent?: string;
  attack_pattern_permissions_required?: string[];
  attack_pattern_platforms?: string[];
  attack_pattern_stix_id?: string;
  attack_pattern_updated_at?: string;
}

export interface RawDocument {
  document_description?: string;
  document_exercises?: string[];
  document_id?: string;
  document_name?: string;
  document_scenarios?: string[];
  document_tags?: string[];
  document_target?: string;
  document_type?: string;
}

export interface RawPaginationAssetGroup {
  asset_group_assets?: string[];
  asset_group_description?: string;
  asset_group_dynamic_filter?: FilterGroup;
  asset_group_id?: string;
  asset_group_name?: string;
  asset_group_tags?: string[];
}

export interface RawPaginationDocument {
  document_description?: string;
  document_exercises?: string[];
  document_id?: string;
  document_name?: string;
  document_scenarios?: string[];
  document_tags?: string[];
  document_type?: string;
}

export interface RawPaginationImportMapper {
  /** @format date-time */
  import_mapper_created_at?: string;
  import_mapper_id: string;
  import_mapper_name?: string;
  /** @format date-time */
  import_mapper_updated_at?: string;
}

export interface RawPaginationPlayer {
  user_phone2?: string;
  user_country?: string;
  user_email?: string;
  user_firstname?: string;
  user_id?: string;
  user_lastname?: string;
  user_organization?: string;
  user_pgp_key?: string;
  user_phone?: string;
  user_tags?: string[];
}

export interface RawPaginationScenario {
  scenario_category?: string;
  scenario_id?: string;
  scenario_name?: string;
  /** @uniqueItems true */
  scenario_platforms?: string[];
  scenario_recurrence?: string;
  scenario_severity?: "low" | "medium" | "high" | "critical";
  /** @uniqueItems true */
  scenario_tags?: string[];
  /** @format date-time */
  scenario_updated_at?: string;
}

export interface RawPaginationTeam {
  team_contextual?: boolean;
  team_description?: string;
  team_id?: string;
  team_name?: string;
  team_organization?: string;
  team_tags?: string[];
  /** @format date-time */
  team_updated_at?: string;
  /** @format int64 */
  team_users_number?: number;
}

export interface RawUser {
  /** @format date-time */
  user_created_at?: string;
  user_email?: string;
  user_firstname?: string;
  user_gravatar?: string;
  user_groups?: string[];
  user_id?: string;
  user_lastname?: string;
  user_organization?: string;
  user_phone?: string;
  user_tags?: string[];
  user_teams?: string[];
}

export interface RenewTokenInput {
  token_id: string;
}

export interface Report {
  listened?: boolean;
  /** @format date-time */
  report_created_at: string;
  report_exercise?: Exercise;
  report_global_observation?: string;
  report_id: string;
  report_informations?: ReportInformation[];
  report_name: string;
  /** @format date-time */
  report_updated_at: string;
}

export interface ReportInformation {
  id: string;
  listened?: boolean;
  report: Report;
  report_informations_display?: boolean;
  report_informations_type:
    | "MAIN_INFORMATION"
    | "SCORE_DETAILS"
    | "INJECT_RESULT"
    | "GLOBAL_OBSERVATION"
    | "PLAYER_SURVEYS"
    | "EXERCISE_DETAILS";
}

export interface ReportInformationInput {
  report_informations_display: boolean;
  report_informations_type:
    | "MAIN_INFORMATION"
    | "SCORE_DETAILS"
    | "INJECT_RESULT"
    | "GLOBAL_OBSERVATION"
    | "PLAYER_SURVEYS"
    | "EXERCISE_DETAILS";
}

export interface ReportInput {
  report_informations?: ReportInformationInput[];
  report_name: string;
}

export interface ResetUserInput {
  lang?: string;
  login: string;
}

export interface ResultDistribution {
  label: string;
  /** @format int32 */
  value: number;
}

export interface RuleAttribute {
  listened?: boolean;
  rule_attribute_additional_config?: Record<string, string>;
  rule_attribute_columns?: string;
  /** @format date-time */
  rule_attribute_created_at?: string;
  rule_attribute_default_value?: string;
  rule_attribute_id: string;
  rule_attribute_name: string;
  /** @format date-time */
  rule_attribute_updated_at?: string;
}

export interface RuleAttributeAddInput {
  rule_attribute_additional_config?: Record<string, string>;
  rule_attribute_columns?: string | null;
  rule_attribute_default_value?: string;
  rule_attribute_name: string;
}

export interface RuleAttributeUpdateInput {
  rule_attribute_additional_config?: Record<string, string>;
  rule_attribute_columns?: string | null;
  rule_attribute_default_value?: string;
  rule_attribute_id?: string;
  rule_attribute_name: string;
}

export interface Scenario {
  listened?: boolean;
  /** @format int64 */
  scenario_all_users_number?: number;
  scenario_articles?: Article[];
  scenario_category?: string;
  /** @format int64 */
  scenario_communications_number?: number;
  /** @format date-time */
  scenario_created_at: string;
  scenario_description?: string;
  scenario_documents?: Document[];
  scenario_exercises?: Exercise[];
  scenario_external_reference?: string;
  scenario_external_url?: string;
  scenario_id: string;
  scenario_injects?: Inject[];
  scenario_injects_statistics?: Record<string, number>;
  scenario_kill_chain_phases?: KillChainPhase[];
  scenario_lessons_anonymized?: boolean;
  scenario_lessons_categories?: LessonsCategory[];
  scenario_mail_from: string;
  scenario_mails_reply_to?: string[];
  scenario_main_focus?: string;
  scenario_message_footer?: string;
  scenario_message_header?: string;
  scenario_name: string;
  scenario_observers?: User[];
  scenario_planners?: User[];
  scenario_platforms?: ("Linux" | "Windows" | "MacOS" | "Container" | "Service" | "Generic" | "Internal" | "Unknown")[];
  scenario_recurrence?: string;
  /** @format date-time */
  scenario_recurrence_end?: string;
  /** @format date-time */
  scenario_recurrence_start?: string;
  scenario_severity?: "low" | "medium" | "high" | "critical";
  scenario_subtitle?: string;
  /** @uniqueItems true */
  scenario_tags?: Tag[];
  scenario_teams?: Team[];
  scenario_teams_users?: ScenarioTeamUser[];
  /** @format date-time */
  scenario_updated_at: string;
  scenario_users?: User[];
  /** @format int64 */
  scenario_users_number?: number;
}

export interface ScenarioInformationInput {
  scenario_mail_from: string;
  scenario_mails_reply_to?: string[];
  scenario_message_footer?: string;
  scenario_message_header?: string;
}

export interface ScenarioInput {
  scenario_category?: string;
  scenario_description?: string;
  scenario_external_reference?: string;
  scenario_external_url?: string;
  scenario_main_focus?: string;
  scenario_name: string;
  scenario_severity?: string;
  scenario_subtitle?: string;
  scenario_tags?: string[];
}

export interface ScenarioRecurrenceInput {
  scenario_recurrence?: string;
  /** @format date-time */
  scenario_recurrence_end?: string;
  /** @format date-time */
  scenario_recurrence_start?: string;
}

export interface ScenarioSimple {
  scenario_id?: string;
  scenario_name?: string;
  scenario_subtitle?: string;
  /** @uniqueItems true */
  scenario_tags?: Tag[];
}

export interface ScenarioStatistic {
  scenarios_attack_scenario_count?: Record<string, number>;
  /** @format int64 */
  scenarios_global_count?: number;
}

export interface ScenarioTeamPlayersEnableInput {
  scenario_team_players?: string[];
}

export interface ScenarioTeamUser {
  scenario_id?: Scenario;
  team_id?: Team;
  user_id?: User;
}

export interface ScenarioUpdateTagsInput {
  scenario_tags?: string[];
}

export interface ScenarioUpdateTeamsInput {
  scenario_teams?: string[];
}

export interface SearchPaginationInput {
  filterGroup?: FilterGroup;
  /**
   * Page number to get
   * @format int32
   * @min 0
   */
  page: number;
  /**
   * Element number by page
   * @format int32
   * @max 1000
   */
  size: number;
  /** List of sort fields : a field is composed of a property (for instance "label" and an optional direction ("asc" is assumed if no direction is specified) : ("desc", "asc") */
  sorts?: SortField[];
  /** Text to search within searchable attributes */
  textSearch?: string;
}

export interface SearchTerm {
  searchTerm?: string;
}

export interface SecurityPlatform {
  asset_active?: boolean;
  asset_children?: Asset[];
  /** @format date-time */
  asset_cleared_at?: string;
  /** @format date-time */
  asset_created_at: string;
  asset_description?: string;
  asset_executor?: Executor;
  asset_external_reference?: string;
  asset_id: string;
  asset_inject?: Inject;
  /** @format date-time */
  asset_last_seen?: string;
  asset_name: string;
  asset_parent?: Asset;
  asset_process_name?: string;
  /** @uniqueItems true */
  asset_tags?: Tag[];
  asset_type?: string;
  /** @format date-time */
  asset_updated_at: string;
  listened?: boolean;
  security_platform_logo_dark?: Document;
  security_platform_logo_light?: Document;
  security_platform_type: "EDR" | "XDR" | "SIEM" | "SOAR" | "NDR" | "ISPM";
}

export interface SecurityPlatformInput {
  asset_description?: string;
  /** @format date-time */
  asset_last_seen?: string | null;
  asset_name: string;
  asset_tags?: string[];
  security_platform_logo_dark?: string;
  security_platform_logo_light?: string;
  security_platform_type: "EDR" | "XDR" | "SIEM" | "SOAR" | "NDR" | "ISPM";
}

export interface SecurityPlatformUpsertInput {
  asset_description?: string;
  asset_external_reference?: string;
  /** @format date-time */
  asset_last_seen?: string | null;
  asset_name: string;
  asset_tags?: string[];
  security_platform_logo_dark?: string;
  security_platform_logo_light?: string;
  security_platform_type: "EDR" | "XDR" | "SIEM" | "SOAR" | "NDR" | "ISPM";
}

export interface SettingsEnterpriseEditionUpdateInput {
  platform_enterprise_edition: string;
}

export interface SettingsPlatformWhitemarkUpdateInput {
  platform_whitemark: string;
}

export interface SettingsUpdateInput {
  platform_lang: string;
  platform_name: string;
  platform_theme: string;
}

/** List of sort fields : a field is composed of a property (for instance "label" and an optional direction ("asc" is assumed if no direction is specified) : ("desc", "asc") */
export interface SortField {
  direction?: string;
  property?: string;
}

export interface SortObject {
  ascending?: boolean;
  direction?: string;
  ignoreCase?: boolean;
  nullHandling?: string;
  property?: string;
}

export interface StatisticElement {
  /** @format int64 */
  global_count?: number;
  /** @format int64 */
  progression_count?: number;
}

export interface Tag {
  listened?: boolean;
  tag_color?: string;
  tag_id: string;
  tag_name: string;
}

export interface TagCreateInput {
  tag_color: string;
  tag_name: string;
}

export interface TagUpdateInput {
  tag_color: string;
  tag_name: string;
}

export interface Team {
  listened?: boolean;
  team_communications?: Communication[];
  team_contextual?: boolean;
  /** @format date-time */
  team_created_at: string;
  team_description?: string;
  team_exercise_injects?: Inject[];
  /** @format int64 */
  team_exercise_injects_number?: number;
  team_exercises?: Exercise[];
  team_exercises_users?: ExerciseTeamUser[];
  team_id: string;
  team_inject_expectations?: InjectExpectation[];
  /** @format int64 */
  team_injects_expectations_number?: number;
  /** @format double */
  team_injects_expectations_total_expected_score: number;
  team_injects_expectations_total_expected_score_by_exercise: Record<string, number>;
  /** @format double */
  team_injects_expectations_total_score: number;
  team_injects_expectations_total_score_by_exercise: Record<string, number>;
  team_name: string;
  team_organization?: Organization;
  team_scenario_injects?: Inject[];
  /** @format int64 */
  team_scenario_injects_number?: number;
  team_scenarios?: Scenario[];
  /** @uniqueItems true */
  team_tags?: Tag[];
  /** @format date-time */
  team_updated_at: string;
  team_users?: User[];
  /** @format int64 */
  team_users_number?: number;
}

export interface TeamCreateInput {
  team_contextual?: boolean;
  team_description?: string;
  team_exercises?: string[];
  team_name: string;
  team_organization?: string;
  team_scenarios?: string[];
  team_tags?: string[];
}

export interface TeamUpdateInput {
  team_description?: string;
  team_name: string;
  team_organization?: string;
  team_tags?: string[];
}

export interface ThemeInput {
  accent_color?: string;
  background_color?: string;
  logo_login_url?: string;
  logo_url?: string;
  logo_url_collapsed?: string;
  navigation_color?: string;
  paper_color?: string;
  primary_color?: string;
  secondary_color?: string;
}

export interface Token {
  listened?: boolean;
  /** @format date-time */
  token_created_at: string;
  token_id: string;
  token_user?: User;
  token_value: string;
}

export interface UpdateAssetsOnAssetGroupInput {
  asset_group_assets?: string[];
}

export interface UpdateMePasswordInput {
  user_current_password: string;
  user_plain_password: string;
}

export interface UpdateProfileInput {
  user_country?: string;
  user_email?: string;
  user_firstname: string;
  user_lang?: string;
  user_lastname: string;
  user_organization?: string;
  user_theme?: string;
}

export interface UpdateUserInfoInput {
  user_phone2?: string;
  user_pgp_key?: string;
  user_phone?: string;
}

export interface UpdateUserInput {
  /** @pattern ^\+[\d\s\-.()]+$ */
  user_phone2?: string;
  user_admin?: boolean;
  user_email?: string;
  user_firstname?: string;
  user_lastname?: string;
  user_organization?: string;
  user_pgp_key?: string;
  /** @pattern ^\+[\d\s\-.()]+$ */
  user_phone?: string;
  user_tags?: string[];
}

export interface UpdateUsersTeamInput {
  team_users?: string[];
}

export interface User {
  user_phone2?: string;
  injects?: Inject[];
  listened?: boolean;
  user_admin?: boolean;
  user_city?: string;
  user_communications?: Communication[];
  user_country?: string;
  /** @format date-time */
  user_created_at: string;
  user_email: string;
  user_firstname?: string;
  user_gravatar?: string;
  user_groups?: Group[];
  user_id: string;
  user_injects?: Inject[];
  /** @format int64 */
  user_injects_number?: number;
  user_is_external?: boolean;
  user_is_manager?: boolean;
  user_is_observer?: boolean;
  user_is_only_player?: boolean;
  user_is_planner?: boolean;
  user_is_player?: boolean;
  user_lang?: string;
  /** @format date-time */
  user_last_comcheck?: string;
  user_lastname?: string;
  user_organization?: Organization;
  user_pgp_key?: string;
  user_phone?: string;
  /** @format int32 */
  user_status: number;
  /** @uniqueItems true */
  user_tags?: Tag[];
  user_teams?: Team[];
  user_theme?: string;
  /** @format date-time */
  user_updated_at: string;
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
  errors?: ValidationError;
  message?: string;
}

export interface Variable {
  listened?: boolean;
  /** @format date-time */
  variable_created_at: string;
  variable_description?: string;
  variable_exercise?: Exercise;
  variable_id: string;
  /** @pattern ^[a-z_]+$ */
  variable_key: string;
  variable_scenario?: Scenario;
  variable_type: "String" | "Object";
  /** @format date-time */
  variable_updated_at: string;
  variable_value?: string;
}

export interface VariableInput {
  variable_description?: string;
  /** @pattern ^[a-z_]+$ */
  variable_key: string;
  variable_value?: string;
}

export interface ViolationErrorBag {
  error?: string;
  message?: string;
  type?: string;
}
