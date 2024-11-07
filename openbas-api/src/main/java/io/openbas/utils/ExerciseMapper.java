package io.openbas.utils;

import static java.util.Collections.emptyList;

import io.openbas.database.model.ExerciseStatus;
import io.openbas.database.model.Tag;
import io.openbas.database.raw.RawExerciseSimple;
import io.openbas.atomic_testing.TargetType;
import io.openbas.database.repository.*;
import io.openbas.rest.atomic_testing.form.TargetSimple;
import io.openbas.rest.exercise.form.ExerciseSimple;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class ExerciseMapper {

  private final AssetRepository assetRepository;
  private final AssetGroupRepository assetGroupRepository;
  private final TeamRepository teamRepository;

  private final ResultUtils resultUtils;
  private final InjectMapper injectMapper;

  public ExerciseSimple getExerciseSimple(RawExerciseSimple rawExercise) {

    ExerciseSimple simple = fromRawExerciseSimple(rawExercise);

    if (rawExercise.getInject_ids() != null) {
      // -- GLOBAL SCORE ---
      simple.setExpectationResultByTypes(
          resultUtils.getResultsByTypes(rawExercise.getInject_ids()));

      // -- TARGETS --
      List<Object[]> teams =
          teamRepository.teamsByExerciseIds(List.of(rawExercise.getExercise_id()));
      List<Object[]> assets =
          assetRepository.assetsByExerciseIds(List.of(rawExercise.getExercise_id()));
      List<Object[]> assetGroups =
          assetGroupRepository.assetGroupsByExerciseIds(List.of(rawExercise.getExercise_id()));

      List<TargetSimple> allTargets =
          Stream.concat(
                  injectMapper.toTargetSimple(teams, TargetType.TEAMS).stream(),
                  Stream.concat(
                      injectMapper.toTargetSimple(assets, TargetType.ASSETS).stream(),
                      injectMapper.toTargetSimple(assetGroups, TargetType.ASSETS_GROUPS).stream()))
              .collect(Collectors.toList());

      simple.getTargets().addAll(allTargets);
    }

    return simple;
  }

  public List<ExerciseSimple> getExerciseSimples(List<RawExerciseSimple> exercises) {
    // -- MAP TO GENERATE TARGETSIMPLEs
    List<String> exerciseIds =
        exercises.stream().map(exercise -> exercise.getExercise_id()).toList();

    Map<String, List<Object[]>> teamMap =
        teamRepository.teamsByExerciseIds(exerciseIds).stream()
            .collect(Collectors.groupingBy(row -> (String) row[0]));

    Map<String, List<Object[]>> assetMap =
        assetRepository.assetsByExerciseIds(exerciseIds).stream()
            .collect(Collectors.groupingBy(row -> (String) row[0]));

    Map<String, List<Object[]>> assetGroupMap =
        assetGroupRepository.assetGroupsByExerciseIds(exerciseIds).stream()
            .collect(Collectors.groupingBy(row -> (String) row[0]));

    List<ExerciseSimple> exerciseSimples = new ArrayList<>();

    for (RawExerciseSimple exercise : exercises) {
      ExerciseSimple simple =
          getExerciseSimple(
              exercise,
              teamMap.getOrDefault(exercise.getExercise_id(), emptyList()),
              assetMap.getOrDefault(exercise.getExercise_id(), emptyList()),
              assetGroupMap.getOrDefault(exercise.getExercise_id(), emptyList()));
      exerciseSimples.add(simple);
    }

    return exerciseSimples;
  }

  private ExerciseSimple getExerciseSimple(
      RawExerciseSimple rawExercise,
      List<Object[]> teams,
      List<Object[]> assets,
      List<Object[]> assetGroups) {

    ExerciseSimple simple = fromRawExerciseSimple(rawExercise);

    if (rawExercise.getInject_ids() != null) {
      // -- GLOBAL SCORE ---
      simple.setExpectationResultByTypes(
          resultUtils.getResultsByTypes(rawExercise.getInject_ids()));

      // -- TARGETS --
      List<TargetSimple> allTargets =
          Stream.concat(
                  injectMapper.toTargetSimple(teams, TargetType.TEAMS).stream(),
                  Stream.concat(
                      injectMapper.toTargetSimple(assets, TargetType.ASSETS).stream(),
                      injectMapper.toTargetSimple(assetGroups, TargetType.ASSETS_GROUPS).stream()))
              .collect(Collectors.toList());

      simple.getTargets().addAll(allTargets);
    }

    return simple;
  }

  private ExerciseSimple fromRawExerciseSimple(RawExerciseSimple rawExercise) {
    ExerciseSimple simple = new ExerciseSimple();
    simple.setId(rawExercise.getExercise_id());
    simple.setName(rawExercise.getExercise_name());
    if (rawExercise.getExercise_tags() != null) {
      simple.setTags(
          rawExercise.getExercise_tags().stream()
              .map(
                  (tagId) -> {
                    Tag tag = new Tag();
                    tag.setId(tagId);
                    return tag;
                  })
              .collect(Collectors.toSet()));
    } else {
      simple.setTags(new HashSet<>());
    }
    simple.setCategory(rawExercise.getExercise_category());
    simple.setSubtitle(rawExercise.getExercise_subtitle());
    simple.setStatus(ExerciseStatus.valueOf(rawExercise.getExercise_status()));
    simple.setStart(rawExercise.getExercise_start_date());
    simple.setUpdatedAt(rawExercise.getExercise_updated_at());

    return simple;
  }
}
