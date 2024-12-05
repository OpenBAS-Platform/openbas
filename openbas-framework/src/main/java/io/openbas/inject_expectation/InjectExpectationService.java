package io.openbas.inject_expectation;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.*;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.inject_expectation.InjectExpectationUtils.*;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAsset;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAssetGroup;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAsset;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAssetGroup;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAsset;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAssetGroup;
import static java.time.Instant.now;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.asset.AssetGroupService;
import io.openbas.atomic_testing.TargetType;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.specification.InjectExpectationSpecification;
import io.openbas.execution.ExecutableInject;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.ManualExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class InjectExpectationService {

  private final InjectExpectationRepository injectExpectationRepository;
  private final InjectRepository injectRepository;
  private final AssetGroupService assetGroupService;

  @Resource protected ObjectMapper mapper;

  // -- CRUD --

  public Optional<InjectExpectation> findInjectExpectation(
      @NotBlank final String injectExpectationId) {
    return this.injectExpectationRepository.findById(injectExpectationId);
  }

  public InjectExpectation computeExpectation(
      @NotNull final InjectExpectation expectation,
      @NotBlank final String sourceId,
      @NotBlank final String sourceType,
      @NotBlank final String sourceName,
      @NotBlank final String result,
      @NotBlank final Boolean success,
      final Map<String, String> metadata) {
    double actualScore =
        success
            ? expectation.getExpectedScore()
            : expectation.getScore() == null ? 0.0 : expectation.getScore();
    computeResult(expectation, sourceId, sourceType, sourceName, result, actualScore, metadata);
    expectation.setScore(actualScore);
    return this.update(expectation);
  }

  public void computeExpectationGroup(
      @NotNull final InjectExpectation expectationAssetGroup,
      @NotNull final List<InjectExpectation> expectationAssets,
      @NotBlank final String sourceId,
      @NotBlank final String sourceType,
      @NotBlank final String sourceName) {
    boolean success;
    if (expectationAssetGroup.isExpectationGroup()) {
      success =
          expectationAssets.stream().anyMatch((e) -> e.getExpectedScore().equals(e.getScore()));
    } else {
      success =
          expectationAssets.stream().allMatch((e) -> e.getExpectedScore().equals(e.getScore()));
    }
    computeResult(
        expectationAssetGroup,
        sourceId,
        sourceType,
        sourceName,
        success ? "SUCCESS" : "FAILED",
        success ? expectationAssetGroup.getExpectedScore() : 0,
        null);
    expectationAssetGroup.setScore(success ? expectationAssetGroup.getExpectedScore() : 0.0);
    this.update(expectationAssetGroup);
  }

  public InjectExpectation update(@NotNull InjectExpectation injectExpectation) {
    injectExpectation.setUpdatedAt(now());
    Inject inject = injectExpectation.getInject();
    inject.setUpdatedAt(now());
    this.injectRepository.save(inject);
    return this.injectExpectationRepository.save(injectExpectation);
  }

  // -- ALL --

  public List<InjectExpectation> expectationsNotFill() {
    return fromIterable(this.injectExpectationRepository.findAll()).stream()
        .filter(e -> e.getResults().stream().toList().isEmpty())
        .toList();
  }

  // -- PREVENTION --

  public List<InjectExpectation> preventionExpectationsNotFill(@NotBlank final String source) {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(PREVENTION)))
        .stream()
        .filter(e -> e.getAsset() != null)
        .filter(e -> e.getResults().stream().noneMatch(r -> source.equals(r.getSourceId())))
        .toList();
  }

  public List<InjectExpectation> preventionExpectationsNotFill() {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(PREVENTION)))
        .stream()
        .filter(e -> e.getAsset() != null)
        .filter(e -> e.getResults().stream().toList().isEmpty())
        .toList();
  }

  // -- DETECTION --

  public List<InjectExpectation> expectationsForAssets(
      @NotNull final Inject inject,
      @NotNull final AssetGroup assetGroup,
      @NotNull final InjectExpectation.EXPECTATION_TYPE expectationType) {
    AssetGroup resolvedAssetGroup = assetGroupService.assetGroup(assetGroup.getId());
    List<String> assetIds =
        Stream.concat(
                resolvedAssetGroup.getAssets().stream(),
                resolvedAssetGroup.getDynamicAssets().stream())
            .map(Asset::getId)
            .distinct()
            .toList();
    return this.injectExpectationRepository.findAll(
        Specification.where(InjectExpectationSpecification.type(expectationType))
            .and(InjectExpectationSpecification.fromAssets(inject.getId(), assetIds)));
  }

  public List<InjectExpectation> detectionExpectationsNotFill(@NotBlank final String source) {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(DETECTION)))
        .stream()
        .filter(e -> e.getAsset() != null)
        .filter(e -> e.getResults().stream().noneMatch(r -> source.equals(r.getSourceId())))
        .toList();
  }

  public List<InjectExpectation> detectionExpectationsNotFill() {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(DETECTION)))
        .stream()
        .filter(e -> e.getAsset() != null)
        .filter(e -> e.getResults().stream().toList().isEmpty())
        .toList();
  }

  // -- MANUAL

  public List<InjectExpectation> manualExpectationsNotFill(@NotBlank final String source) {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(MANUAL)))
        .stream()
        .filter(e -> e.getResults().stream().noneMatch(r -> source.equals(r.getSourceId())))
        .toList();
  }

  public List<InjectExpectation> manualExpectationsNotFill() {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(MANUAL)))
        .stream()
        .filter(e -> e.getResults().stream().toList().isEmpty())
        .toList();
  }

  // -- BY TARGET TYPE

  public List<InjectExpectation> findExpectationsByInjectAndTargetAndTargetType(
      @NotBlank final String injectId,
      @NotBlank final String targetId,
      @NotBlank final String parentTargetId,
      @NotBlank final String targetType) {
    try {
      TargetType targetTypeEnum = TargetType.valueOf(targetType);
      return switch (targetTypeEnum) {
        case TEAMS -> injectExpectationRepository.findAllByInjectAndTeam(injectId, targetId);
        case PLAYER ->
            injectExpectationRepository.findAllByInjectAndTeamAndPlayer(
                injectId, parentTargetId, targetId);
        case ASSETS -> injectExpectationRepository.findAllByInjectAndAsset(injectId, targetId);
        case ASSETS_GROUPS ->
            injectExpectationRepository.findAllByInjectAndAssetGroup(injectId, targetId);
      };
    } catch (IllegalArgumentException e) {
      return Collections.emptyList();
    }
  }

  // -- BUILD AND SAVE EXPECTATION AFTER SUCCESSFUL INJECT EXECUTION --

  public void buildAndSaveInjectExpectations(
      ExecutableInject executableInject, List<Expectation> expectations) {
    boolean isAtomicTesting = executableInject.getInjection().getInject().isAtomicTesting();
    boolean isScheduledInject = !executableInject.isDirect();
    // Create the expectations
    List<Team> teams = executableInject.getTeams();
    List<Asset> assets = executableInject.getAssets();
    List<AssetGroup> assetGroups = executableInject.getAssetGroups();
    if ((isScheduledInject || isAtomicTesting) && !expectations.isEmpty()) {
      if (!teams.isEmpty()) {
        List<InjectExpectation> injectExpectationsByTeam;

        List<InjectExpectation> injectExpectationsByUserAndTeam;
        // If atomicTesting, We create expectation for every player and every team
        if (isAtomicTesting) {
          injectExpectationsByTeam =
              teams.stream()
                  .flatMap(
                      team ->
                          expectations.stream()
                              .map(
                                  expectation ->
                                      expectationConverter(team, executableInject, expectation)))
                  .collect(Collectors.toList());

          injectExpectationsByUserAndTeam =
              teams.stream()
                  .flatMap(
                      team ->
                          team.getUsers().stream()
                              .flatMap(
                                  user ->
                                      expectations.stream()
                                          .map(
                                              expectation ->
                                                  expectationConverter(
                                                      team, user, executableInject, expectation))))
                  .toList();
        } else {
          // Create expectations for every enabled player in every team
          injectExpectationsByUserAndTeam =
              teams.stream()
                  .flatMap(
                      team ->
                          team.getExerciseTeamUsers().stream()
                              .filter(
                                  exerciseTeamUser ->
                                      exerciseTeamUser
                                          .getExercise()
                                          .getId()
                                          .equals(
                                              executableInject
                                                  .getInjection()
                                                  .getExercise()
                                                  .getId()))
                              .flatMap(
                                  exerciseTeamUser ->
                                      expectations.stream()
                                          .map(
                                              expectation ->
                                                  expectationConverter(
                                                      team,
                                                      exerciseTeamUser.getUser(),
                                                      executableInject,
                                                      expectation))))
                  .toList();

          // Create a set of teams that have at least one enabled player
          Set<Team> teamsWithEnabledPlayers =
              injectExpectationsByUserAndTeam.stream()
                  .map(InjectExpectation::getTeam)
                  .collect(Collectors.toSet());

          // Add only the expectations where the team has at least one enabled player
          injectExpectationsByTeam =
              teamsWithEnabledPlayers.stream()
                  .flatMap(
                      team ->
                          expectations.stream()
                              .map(
                                  expectation ->
                                      expectationConverter(team, executableInject, expectation)))
                  .collect(Collectors.toList());
        }

        injectExpectationsByTeam.addAll(injectExpectationsByUserAndTeam);
        injectExpectationRepository.saveAll(injectExpectationsByTeam);
      } else if (!assets.isEmpty() || !assetGroups.isEmpty()) {
        List<InjectExpectation> injectExpectations =
            expectations.stream()
                .map(expectation -> expectationConverter(executableInject, expectation))
                .toList();
        injectExpectationRepository.saveAll(injectExpectations);
      }
    }
  }

  // -- GENERATE EXPECTATIONS AFTER EXECUTION WITH OPENBAS AGENT --

  public List<Expectation> generateExpectations(Inject inject) throws Exception {
    Map<Asset, Boolean> assets = assetGroupService.resolveAllAssets(inject);

    // Compute expectations
    OpenBASImplantInjectContent content =
        this.mapper.treeToValue(inject.getContent(), OpenBASImplantInjectContent.class);

    List<Expectation> expectations = new ArrayList<>();
    assets.forEach(
        (asset, isInGroup) -> {
          Optional<InjectorContract> contract = inject.getInjectorContract();
          List<InjectExpectationSignature> injectExpectationSignatures = new ArrayList<>();

          if (contract.isPresent()) {
            Payload payload = contract.get().getPayload();
            if (payload == null) {
              return;
            }
            injectExpectationSignatures = spawnSignatures(inject, payload);
          }
          computeExpectationsForAsset(
              expectations, content, asset, isInGroup, injectExpectationSignatures);
        });

    List<AssetGroup> assetGroups = inject.getAssetGroups();
    assetGroups.forEach(
        (assetGroup ->
            computeExpectationsForAssetGroup(
                expectations, content, assetGroup, new ArrayList<>())));

    return expectations;
  }

  // -- CONVERTER FOR OBAS IMPLANT --

  /** In case of direct asset, we have an individual expectation for the asset */
  public void computeExpectationsForAsset(
      @NotNull final List<Expectation> expectations,
      @NotNull final OpenBASImplantInjectContent content,
      @NotNull final Asset asset,
      final boolean expectationGroup,
      final List<InjectExpectationSignature> injectExpectationSignatures) {
    if (!content.getExpectations().isEmpty()) {
      expectations.addAll(
          content.getExpectations().stream()
              .flatMap(
                  (expectation) ->
                      switch (expectation.getType()) {
                        case PREVENTION ->
                            Stream.of(
                                preventionExpectationForAsset(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    asset,
                                    expectationGroup,
                                    expectation.getExpirationTime(),
                                    injectExpectationSignatures)); // expectationGroup usefully in
                        // front-end
                        case DETECTION ->
                            Stream.of(
                                detectionExpectationForAsset(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    asset,
                                    expectationGroup,
                                    expectation.getExpirationTime(),
                                    injectExpectationSignatures));
                        case MANUAL ->
                            Stream.of(
                                manualExpectationForAsset(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    asset,
                                    expectation.getExpirationTime(),
                                    expectationGroup));
                        default -> Stream.of();
                      })
              .toList());
    }
  }

  /**
   * In case of asset group if expectation group -> we have an expectation for the group and one for
   * each asset if not expectation group -> we have an individual expectation for each asset
   */
  public void computeExpectationsForAssetGroup(
      @NotNull final List<Expectation> expectations,
      @NotNull final OpenBASImplantInjectContent content,
      @NotNull final AssetGroup assetGroup,
      final List<InjectExpectationSignature> injectExpectationSignatures) {
    if (!content.getExpectations().isEmpty()) {
      expectations.addAll(
          content.getExpectations().stream()
              .flatMap(
                  (expectation) ->
                      switch (expectation.getType()) {
                        case PREVENTION -> {
                          // Verify that at least one asset in the group has been executed
                          List<Asset> assets =
                              this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                          if (assets.stream()
                              .anyMatch(
                                  (asset) ->
                                      expectations.stream()
                                          .filter(
                                              e ->
                                                  InjectExpectation.EXPECTATION_TYPE.PREVENTION
                                                      == e.type())
                                          .anyMatch(
                                              (e) ->
                                                  ((PreventionExpectation) e).getAsset() != null
                                                      && ((PreventionExpectation) e)
                                                          .getAsset()
                                                          .getId()
                                                          .equals(asset.getId())))) {
                            yield Stream.of(
                                preventionExpectationForAssetGroup(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    assetGroup,
                                    expectation.isExpectationGroup(),
                                    expectation.getExpirationTime(),
                                    injectExpectationSignatures));
                          }
                          yield Stream.of();
                        }
                        case DETECTION -> {
                          // Verify that at least one asset in the group has been executed
                          List<Asset> assets =
                              this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                          if (assets.stream()
                              .anyMatch(
                                  (asset) ->
                                      expectations.stream()
                                          .filter(
                                              e ->
                                                  InjectExpectation.EXPECTATION_TYPE.DETECTION
                                                      == e.type())
                                          .anyMatch(
                                              (e) ->
                                                  ((DetectionExpectation) e).getAsset() != null
                                                      && ((DetectionExpectation) e)
                                                          .getAsset()
                                                          .getId()
                                                          .equals(asset.getId())))) {
                            yield Stream.of(
                                detectionExpectationForAssetGroup(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    assetGroup,
                                    expectation.isExpectationGroup(),
                                    expectation.getExpirationTime(),
                                    injectExpectationSignatures));
                          }
                          yield Stream.of();
                        }
                        case MANUAL -> {
                          // Verify that at least one asset in the group has been executed
                          List<Asset> assets =
                              this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                          if (assets.stream()
                              .anyMatch(
                                  (asset) ->
                                      expectations.stream()
                                          .filter(
                                              e ->
                                                  InjectExpectation.EXPECTATION_TYPE.MANUAL
                                                      == e.type())
                                          .anyMatch(
                                              (e) ->
                                                  ((ManualExpectation) e).getAsset() != null
                                                      && ((ManualExpectation) e)
                                                          .getAsset()
                                                          .getId()
                                                          .equals(asset.getId())))) {
                            yield Stream.of(
                                manualExpectationForAssetGroup(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    assetGroup,
                                    expectation.getExpirationTime(),
                                    expectation.isExpectationGroup()));
                          }
                          yield Stream.of();
                        }
                        default -> Stream.of();
                      })
              .toList());
    }
  }
}
