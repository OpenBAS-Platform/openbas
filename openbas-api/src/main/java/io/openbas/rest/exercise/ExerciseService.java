package io.openbas.rest.exercise;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.*;
import io.openbas.database.repository.ArticleRepository;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.database.repository.TeamRepository;
import io.openbas.rest.exercise.form.ExerciseSimple;
import io.openbas.rest.inject.service.InjectDuplicateService;
import io.openbas.service.GrantService;
import io.openbas.service.InjectService;
import io.openbas.service.TeamService;
import io.openbas.service.VariableService;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static io.openbas.database.criteria.GenericCriteria.countQuery;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.AtomicTestingUtils.getExpectationResultByTypes;
import static io.openbas.utils.Constants.ARTICLES;
import static io.openbas.utils.JpaUtils.createJoinArrayAggOnId;
import static io.openbas.utils.ResultUtils.computeTargetResults;
import static io.openbas.utils.StringUtils.duplicateString;
import static io.openbas.utils.pagination.SortUtilsCriteriaBuilder.toSortCriteriaBuilder;
import static java.time.Instant.now;
import static java.util.Optional.ofNullable;
import static org.springframework.util.CollectionUtils.isEmpty;

@RequiredArgsConstructor
@Service
@Validated
public class ExerciseService {

    @PersistenceContext
    private EntityManager entityManager;

    private final GrantService grantService;
    private final InjectService injectService;
    private final InjectDuplicateService injectDuplicateService;
    private final TeamService teamService;
    private final VariableService variableService;

    private final ArticleRepository articleRepository;
    private final ExerciseRepository exerciseRepository;
    private final TeamRepository teamRepository;

    // region properties
    @Value("${openbas.mail.imap.enabled}")
    private boolean imapEnabled;

    @Value("${openbas.mail.imap.username}")
    private String imapUsername;

    @Resource
    private OpenBASConfig openBASConfig;
    // endregion

    public Page<ExerciseSimple> exercises(Specification<Exercise> specification, Pageable pageable) {
        CriteriaBuilder cb = this.entityManager.getCriteriaBuilder();

        CriteriaQuery<Tuple> cq = cb.createTupleQuery();
        Root<Exercise> exerciseRoot = cq.from(Exercise.class);
        select(cb, cq, exerciseRoot);

        // -- Text Search and Filters --
        if (specification != null) {
            Predicate predicate = specification.toPredicate(exerciseRoot, cq, cb);
            if (predicate != null) {
                cq.where(predicate);
            }
        }

        // -- Sorting --
        List<Order> orders = toSortCriteriaBuilder(cb, exerciseRoot, pageable.getSort());
        cq.orderBy(orders);

        // Type Query
        TypedQuery<Tuple> query = entityManager.createQuery(cq);

        // -- Pagination --
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        // -- EXECUTION --
        List<ExerciseSimple> exercises = execution(query);

        // From the list of exercises, we get the list of the injects ids
        List<String> listOfInjectIds = fromIterable(exercises).stream()
                .filter(exercise -> exercise.getInjectIds() != null)
                .flatMap(exercise -> Arrays.stream(exercise.getInjectIds()))
                .distinct()
                .toList();
        // And we create inject from raw
        Map<String, Inject> mapOfInjectsById = this.injectService.mapOfInjects(listOfInjectIds);

        for (ExerciseSimple exercise : exercises) {
            // We make a list out of all the injects that are linked to the exercise
            List<Inject> injects;
            if (exercise.getInjectIds() != null) {
                injects = Arrays.stream(exercise.getInjectIds()).map(mapOfInjectsById::get).collect(Collectors.toList());
                // We set the ExpectationResults
                exercise.setExpectationResultByTypes(
                        getExpectationResultByTypes(injects.stream().flatMap(inject -> inject.getExpectations().stream()).toList())
                );
                if (!isEmpty(injects)) {
                    exercise.setTargets(computeTargetResults(injects));
                } else {
                    exercise.setTargets(new ArrayList<>());
                }
            }
        }

        // -- Count Query --
        Long total = countQuery(cb, this.entityManager, Exercise.class, specification);

        return new PageImpl<>(exercises, pageable, total);
    }

    // -- SELECT --

    private void select(CriteriaBuilder cb, CriteriaQuery<Tuple> cq, Root<Exercise> exerciseRoot) {
        // Array aggregations
        Expression<String[]> tagIdsExpression = createJoinArrayAggOnId(cb, exerciseRoot, "tags");
        Expression<String[]> injectIdsExpression = createJoinArrayAggOnId(cb, exerciseRoot, "injects");

        // SELECT
        cq.multiselect(
                exerciseRoot.get("id").alias("exercise_id"),
                exerciseRoot.get("name").alias("exercise_name"),
                exerciseRoot.get("status").alias("exercise_status"),
                exerciseRoot.get("subtitle").alias("exercise_subtitle"),
                exerciseRoot.get("category").alias("exercise_category"),
                exerciseRoot.get("start").alias("exercise_start_date"),
                exerciseRoot.get("updatedAt").alias("exercise_updated_at"),
                tagIdsExpression.alias("exercise_tags"),
                injectIdsExpression.alias("exercise_injects")
        ).distinct(true);

        // GROUP BY
        cq.groupBy(Collections.singletonList(
                exerciseRoot.get("id")
        ));
    }

    // -- EXECUTION --

    private List<ExerciseSimple> execution(TypedQuery<Tuple> query) {
        return query.getResultList()
                .stream()
                .map(tuple -> {
                    ExerciseSimple exerciseSimple = new ExerciseSimple();
                    exerciseSimple.setId(tuple.get("exercise_id", String.class));
                    exerciseSimple.setName(tuple.get("exercise_name", String.class));
                    exerciseSimple.setStatus(tuple.get("exercise_status", ExerciseStatus.class));
                    exerciseSimple.setSubtitle(tuple.get("exercise_subtitle", String.class));
                    exerciseSimple.setCategory(tuple.get("exercise_category", String.class));
                    exerciseSimple.setStart(tuple.get("exercise_start_date", Instant.class));
                    exerciseSimple.setUpdatedAt(tuple.get("exercise_updated_at", Instant.class));
                    exerciseSimple.setTags(
                            Arrays.stream(tuple.get("exercise_tags", String[].class))
                                    .map(t -> {
                                        Tag tag = new Tag();
                                        tag.setId(t);
                                        return tag;
                                    })
                                    .collect(Collectors.toSet())
                    );
                    exerciseSimple.setInjectIds(tuple.get("exercise_injects", String[].class));
                    return exerciseSimple;
                })
                .toList();
    }

    // -- CREATION --

    @Transactional(rollbackOn = Exception.class)
    public Exercise createExercise(@NotNull final Exercise exercise){
            if (imapEnabled) {
                exercise.setFrom(imapUsername);
                exercise.setReplyTos(List.of(imapUsername));
            } else {
                exercise.setFrom(openBASConfig.getDefaultMailer());
                exercise.setReplyTos(List.of(openBASConfig.getDefaultReplyTo()));
            }
            this.grantService.computeGrant(exercise);
            return exerciseRepository.save(exercise);
    }

    // -- READ --

    public Exercise exercise(@NotBlank final String exerciseId) {
        return this.exerciseRepository.findById(exerciseId)
            .orElseThrow(() -> new ElementNotFoundException("Exercise not found"));
    }

    // -- UPDATE --

    public Exercise updateExercise(@NotNull final Exercise exercise) {
        exercise.setUpdatedAt(now());
        return this.exerciseRepository.save(exercise);
    }

    // -- DUPLICATION --

    @Transactional
    public Exercise getDuplicateExercise(@NotBlank String exerciseId) {
        Exercise exerciseOrigin = exerciseRepository.findById(exerciseId).orElseThrow();
        Exercise exercise = copyExercice(exerciseOrigin);
        Exercise exerciseDuplicate = exerciseRepository.save(exercise);
        getListOfDuplicatedInjects(exerciseDuplicate, exerciseOrigin);
        getListOfExerciseTeams(exerciseDuplicate, exerciseOrigin);
        getListOfArticles(exerciseDuplicate, exerciseOrigin);
        getListOfVariables(exerciseDuplicate, exerciseOrigin);
        getObjectives(exerciseDuplicate, exerciseOrigin);
        getLessonsCategories(exerciseDuplicate, exerciseOrigin);
        return exerciseRepository.save(exercise);
    }

    private Exercise copyExercice(Exercise exerciseOrigin) {
        Exercise exerciseDuplicate = new Exercise();
        exerciseDuplicate.setName(duplicateString(exerciseOrigin.getName()));
        exerciseDuplicate.setCategory(exerciseOrigin.getCategory());
        exerciseDuplicate.setDescription(exerciseOrigin.getDescription());
        exerciseDuplicate.setFrom(exerciseOrigin.getFrom());
        exerciseDuplicate.setFooter(exerciseOrigin.getFooter());
        exerciseDuplicate.setScenario(exerciseOrigin.getScenario());
        exerciseDuplicate.setHeader(exerciseOrigin.getHeader());
        exerciseDuplicate.setMainFocus(exerciseOrigin.getMainFocus());
        exerciseDuplicate.setSeverity(exerciseOrigin.getSeverity());
        exerciseDuplicate.setSubtitle(exerciseOrigin.getSubtitle());
        exerciseDuplicate.setLogoDark(exerciseOrigin.getLogoDark());
        exerciseDuplicate.setLogoLight(exerciseOrigin.getLogoLight());
        exerciseDuplicate.setGrants(new ArrayList<>(exerciseOrigin.getGrants()));
        exerciseDuplicate.setTags(new HashSet<>(exerciseOrigin.getTags()));
        exerciseDuplicate.setTeamUsers(new ArrayList<>(exerciseOrigin.getTeamUsers()));
        exerciseDuplicate.setReplyTos(new ArrayList<>(exerciseOrigin.getReplyTos()));
        exerciseDuplicate.setDocuments(new ArrayList<>(exerciseOrigin.getDocuments()));
        exerciseDuplicate.setLessonsAnonymized(exerciseOrigin.isLessonsAnonymized());
        return exerciseDuplicate;
    }

    private void getListOfExerciseTeams(@NotNull Exercise exercise,@NotNull Exercise exerciseOrigin){
        Map<String, Team> contextualTeams = new HashMap<>();
        List<Team> exerciseTeams = new ArrayList<>();
        exerciseOrigin.getTeams().forEach(scenarioTeam -> {
            if (scenarioTeam.getContextual()) {
                Team team = teamService.copyContextualTeam(scenarioTeam);
                Team teamSaved = this.teamRepository.save(team);
                exerciseTeams.add(teamSaved);
                contextualTeams.put(scenarioTeam.getId(), teamSaved);
            } else {
                exerciseTeams.add(scenarioTeam);
            }
        });
        exercise.setTeams(new ArrayList<>(exerciseTeams));

        exercise.getInjects().forEach(inject -> {
            List<Team> teams = new ArrayList<>();
            inject.getTeams().forEach(team -> {
                if (team.getContextual()) {
                    teams.add(contextualTeams.get(team.getId()));
                } else {
                    teams.add(team);
                }
            });
            inject.setTeams(teams);
        });
    }

    private void getListOfDuplicatedInjects(Exercise exercise, Exercise exerciseOrigin) {
        List<Inject> injectListForExercise = exerciseOrigin.getInjects()
                .stream().map(inject -> injectDuplicateService.createInjectForExercise(exercise.getId(), inject.getId(), false))
                .toList();
        exercise.setInjects(new ArrayList<>(injectListForExercise));
    }

    private void getListOfArticles(Exercise exercise, Exercise exerciseOrigin) {
        List<Article> articleList = new ArrayList<>();
        Map<String, String> mapIdArticleOriginNew = new HashMap<>();
        exerciseOrigin.getArticles().forEach(article -> {
            Article exerciceArticle = new Article();
            exerciceArticle.setName(article.getName());
            exerciceArticle.setContent(article.getContent());
            exerciceArticle.setAuthor(article.getAuthor());
            exerciceArticle.setShares(article.getShares());
            exerciceArticle.setLikes(article.getLikes());
            exerciceArticle.setComments(article.getComments());
            exerciceArticle.setChannel(article.getChannel());
            exerciceArticle.setDocuments(new ArrayList<>(article.getDocuments()));
            exerciceArticle.setExercise(exercise);
            Article save = articleRepository.save(exerciceArticle);
            articleList.add(save);
            mapIdArticleOriginNew.put(article.getId(), save.getId());
        });
        exercise.setArticles(articleList);
        for (Inject inject : exercise.getInjects()) {
            if (ofNullable(inject.getContent()).map(c -> c.has(ARTICLES)).orElse(Boolean.FALSE)) {
                List<String> articleNode = new ArrayList<>();
                JsonNode articles = inject.getContent().findValue(ARTICLES);
                if (articles.isArray()) {
                    for (final JsonNode node : articles) {
                        if (mapIdArticleOriginNew.containsKey(node.textValue())) {
                            articleNode.add(mapIdArticleOriginNew.get(node.textValue()));
                        }
                    }
                }
                inject.getContent().remove(ARTICLES);
                ArrayNode arrayNode = inject.getContent().putArray(ARTICLES);
                articleNode.forEach(arrayNode::add);
            }
        }
    }

    private void getListOfVariables(Exercise exercise, Exercise exerciseOrigin) {
        List<Variable> variables = variableService.variablesFromExercise(exerciseOrigin.getId());
        List<Variable> variableList = variables.stream().map(variable -> {
            Variable variable1 = new Variable();
            variable1.setKey(variable.getKey());
            variable1.setDescription(variable.getDescription());
            variable1.setValue(variable.getValue());
            variable1.setType(variable.getType());
            variable1.setExercise(exercise);
            return variable1;
        }).toList();
        variableService.createVariables(variableList);
    }

    private void getLessonsCategories(Exercise duplicatedExercise, Exercise originalExercise){
        List<LessonsCategory> duplicatedCategories = new ArrayList<>();
        for (LessonsCategory originalCategory : originalExercise.getLessonsCategories()) {
            LessonsCategory duplicatedCategory = new LessonsCategory();
            duplicatedCategory.setName(originalCategory.getName());
            duplicatedCategory.setDescription(originalCategory.getDescription());
            duplicatedCategory.setOrder(originalCategory.getOrder());
            duplicatedCategory.setExercise(duplicatedExercise);
            duplicatedCategory.setTeams(new ArrayList<>(originalCategory.getTeams()));

            List<LessonsQuestion> duplicatedQuestions = new ArrayList<>();
            for (LessonsQuestion originalQuestion : originalCategory.getQuestions()) {
                LessonsQuestion duplicatedQuestion = new LessonsQuestion();
                duplicatedQuestion.setCategory(originalQuestion.getCategory());
                duplicatedQuestion.setContent(originalQuestion.getContent());
                duplicatedQuestion.setExplanation(originalQuestion.getExplanation());
                duplicatedQuestion.setOrder(originalQuestion.getOrder());
                duplicatedQuestion.setCategory(duplicatedCategory);

                List<LessonsAnswer> duplicatedAnswers = new ArrayList<>();
                for (LessonsAnswer originalAnswer : originalQuestion.getAnswers()) {
                    LessonsAnswer duplicatedAnswer = new LessonsAnswer();
                    duplicatedAnswer.setUser(originalAnswer.getUser());
                    duplicatedAnswer.setScore(originalAnswer.getScore());
                    duplicatedAnswer.setPositive(originalAnswer.getPositive());
                    duplicatedAnswer.setNegative(originalAnswer.getNegative());
                    duplicatedAnswer.setQuestion(duplicatedQuestion);
                    duplicatedAnswers.add(duplicatedAnswer);
                }
                duplicatedQuestion.setAnswers(duplicatedAnswers);
                duplicatedQuestions.add(duplicatedQuestion);
            }
            duplicatedCategory.setQuestions(duplicatedQuestions);
            duplicatedCategories.add(duplicatedCategory);
        }
        duplicatedExercise.setLessonsCategories(duplicatedCategories);
    }

    private void getObjectives(Exercise duplicatedExercise, Exercise originalExercise){
        List<Objective> duplicatedObjectives = new ArrayList<>();
        for (Objective originalObjective : originalExercise.getObjectives()) {
            Objective duplicatedObjective = new Objective();
            duplicatedObjective.setTitle(originalObjective.getTitle());
            duplicatedObjective.setDescription(originalObjective.getDescription());
            duplicatedObjective.setPriority(originalObjective.getPriority());
            List<Evaluation> duplicatedEvaluations = new ArrayList<>();
            for (Evaluation originalEvaluation : originalObjective.getEvaluations()) {
                Evaluation duplicatedEvaluation = new Evaluation();
                duplicatedEvaluation.setScore(originalEvaluation.getScore());
                duplicatedEvaluation.setUser(originalEvaluation.getUser());
                duplicatedEvaluation.setObjective(duplicatedObjective);
                duplicatedEvaluations.add(duplicatedEvaluation);
            }
            duplicatedObjective.setEvaluations(duplicatedEvaluations);
            duplicatedObjective.setExercise(duplicatedExercise);
            duplicatedObjectives.add(duplicatedObjective);
        }
        duplicatedExercise.setObjectives(duplicatedObjectives);
    }

}
