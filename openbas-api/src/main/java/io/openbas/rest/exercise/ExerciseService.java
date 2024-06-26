package io.openbas.rest.exercise;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.ExerciseStatus;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exercise.form.ExerciseCreateInput;
import io.openbas.rest.exercise.form.ExerciseSimple;
import io.openbas.service.InjectService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static io.openbas.database.criteria.ExerciseCriteria.countQuery;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.AtomicTestingUtils.getExpectationResultByTypes;
import static io.openbas.utils.JpaUtils.createJoinArrayAggOnId;
import static io.openbas.utils.ResultUtils.computeTargetResults;
import static io.openbas.utils.pagination.SortUtilsCriteriaBuilder.toSortCriteriaBuilder;
import static org.springframework.util.CollectionUtils.isEmpty;

@RequiredArgsConstructor
@Service
public class ExerciseService {

  @PersistenceContext
  private EntityManager entityManager;

  private final InjectService injectService;
  private final ExerciseRepository exerciseRepository;

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
    Long total = countQuery(cb, this.entityManager);

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
    cq.groupBy(Arrays.asList(
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

  @Transactional
  public Exercise getDuplicateExercise(ExerciseCreateInput input) {
      if (StringUtils.isNotBlank(input.getId())) {
          Exercise exerciseOrigin = exerciseRepository.findById(input.getId()).orElseThrow();
          Exercise exercise = copyExercice(exerciseOrigin);
          return exerciseRepository.save(exercise);
      }
      throw new ElementNotFoundException();
  }

    private Exercise copyExercice(Exercise exerciseOrigin) {
        Exercise exerciseDuplicate = new Exercise();
        if (exerciseOrigin.getEnd().isPresent())
            exerciseDuplicate.setEnd(exerciseOrigin.getEnd().get());
        exerciseDuplicate.setDocuments(exerciseOrigin.getDocuments().stream().toList());
        exerciseDuplicate.setCategory(exerciseOrigin.getCategory());
        exerciseDuplicate.setDescription(exerciseOrigin.getDescription());
        exerciseDuplicate.setName(exerciseOrigin.getName());
        exerciseDuplicate.setInjects(exerciseOrigin.getInjects().stream().toList());
        exerciseDuplicate.setArticles(exerciseOrigin.getArticles().stream().toList());
        if (exerciseOrigin.getCurrentPause().isPresent())
            exerciseDuplicate.setCurrentPause(exerciseOrigin.getCurrentPause().get());
        exerciseDuplicate.setFrom(exerciseOrigin.getFrom());
        exerciseDuplicate.setCategory(exerciseOrigin.getCategory());
        exerciseDuplicate.setFooter(exerciseOrigin.getFooter());
        exerciseDuplicate.setGrants(exerciseOrigin.getGrants().stream().toList());
        exerciseDuplicate.setTags(new HashSet<>(exerciseOrigin.getTags()));
        exerciseDuplicate.setTeams((exerciseOrigin.getTeams().stream().toList()));
        exerciseDuplicate.setTeamUsers((exerciseOrigin.getTeamUsers().stream().toList()));
        exerciseDuplicate.setReplyTos(exerciseOrigin.getReplyTos().stream().toList());
        exerciseDuplicate.setScenario(exerciseOrigin.getScenario());
        exerciseDuplicate.setHeader(exerciseOrigin.getHeader());
        exerciseDuplicate.setSubtitle(exerciseOrigin.getSubtitle());
        if (exerciseOrigin.getStart().isPresent())
            exerciseDuplicate.setStart(exerciseOrigin.getStart().get());
        exerciseDuplicate.setStatus(exerciseOrigin.getStatus());
        exerciseDuplicate.setLogoDark(exerciseOrigin.getLogoDark());
        exerciseDuplicate.setLogoLight(exerciseOrigin.getLogoLight());
        exerciseDuplicate.setPauses(exerciseOrigin.getPauses().stream().toList());
        exerciseDuplicate.setObjectives(exerciseOrigin.getObjectives().stream().toList());
        return exerciseDuplicate;
    }

}
