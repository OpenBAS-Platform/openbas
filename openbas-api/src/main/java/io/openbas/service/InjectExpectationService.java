package io.openbas.service;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.*;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.service.InjectExpectationUtils.*;
import static java.time.Instant.now;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.atomic_testing.TargetType;
import io.openbas.database.model.*;
import io.openbas.database.repository.CollectorRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.specification.InjectExpectationSpecification;
import io.openbas.execution.ExecutableInject;
import io.openbas.model.Expectation;
import io.openbas.rest.inject.form.InjectExpectationUpdateInput;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.beanutils.BeanUtils;
import org.hibernate.Hibernate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class InjectExpectationService {

  private final InjectExpectationRepository injectExpectationRepository;
  private final InjectRepository injectRepository;
  private final AssetGroupService assetGroupService;
  private final EndpointService endpointService;
  private final CollectorRepository collectorRepository;

  @Resource protected ObjectMapper mapper;

  // -- CRUD --

  public Optional<InjectExpectation> findInjectExpectation(
      @NotBlank final String injectExpectationId) {
    return this.injectExpectationRepository.findById(injectExpectationId);
  }

  // Update from collectors
  public InjectExpectation updateInjectExpectation(
      @NotBlank String expectationId, @Valid @NotNull InjectExpectationUpdateInput input) {
    InjectExpectation injectExpectation = this.findInjectExpectation(expectationId).orElseThrow();
    Collector collector = this.collectorRepository.findById(input.getCollectorId()).orElseThrow();
    injectExpectation =
        this.computeExpectation(
            injectExpectation,
            collector.getId(),
            "collector",
            collector.getName(),
            input.getResult(),
            input.getIsSuccess(),
            input.getMetadata());

    Inject inject = injectExpectation.getInject();

    // Compute potential expectations for asset
    InjectExpectation finalInjectExpectation = injectExpectation;
    List<InjectExpectation> expectationAssets =
        inject.getExpectations().stream()
            .filter(
                e ->
                    e.getAsset() != null
                        && e.getAgent() == null
                        && e.getAsset().getId().equals(finalInjectExpectation.getAsset().getId()))
            .toList();
    expectationAssets.forEach(
        (expectationAsset -> {
          List<InjectExpectation> expectationAgents =
              this.expectationsForAgents(
                  expectationAsset.getInject(),
                  expectationAsset.getAsset(),
                  expectationAsset.getType());
          // Every expectation assets are filled
          if (expectationAgents.stream().noneMatch(e -> e.getResults().isEmpty())) {
            this.computeExpectationGroup(
                expectationAsset,
                expectationAgents,
                collector.getId(),
                "collector",
                collector.getName());
          }
        }));

    // Compute potential expectations for asset groups
    List<InjectExpectation> expectationAssetGroups =
        inject.getExpectations().stream().filter(e -> e.getAssetGroup() != null).toList();
    expectationAssetGroups.forEach(
        (expectationAssetGroup -> {
          List<InjectExpectation> expectationAssetsByAssetGroup =
              this.expectationsForAssets(
                  expectationAssetGroup.getInject(),
                  expectationAssetGroup.getAssetGroup(),
                  expectationAssetGroup.getType());
          // Every expectation assets are filled
          if (expectationAssetsByAssetGroup.stream().noneMatch(e -> e.getResults().isEmpty())) {
            this.computeExpectationGroup(
                expectationAssetGroup,
                expectationAssetsByAssetGroup,
                collector.getId(),
                "collector",
                collector.getName());
          }
        }));
    // end of computing

    return injectExpectation;
  }

  // Compute results for expectations
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

  public void computeExpectationAsset(
      InjectExpectation expectationAsset,
      List<InjectExpectation> expectationAgents,
      String sourceId,
      String sourceType,
      String sourceName) {
    boolean success =
        expectationAgents.stream().allMatch((e) -> e.getExpectedScore().equals(e.getScore()));
    computeResult(
        expectationAsset,
        sourceId,
        sourceType,
        sourceName,
        success ? "SUCCESS" : "FAILED",
        success ? expectationAsset.getExpectedScore() : 0.0,
        null);
    expectationAsset.setScore(success ? expectationAsset.getExpectedScore() : 0.0);
    this.update(expectationAsset);
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
        success ? expectationAssetGroup.getExpectedScore() : 0.0,
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

  public List<InjectExpectation> expectationsForAgents(
      @NotNull final Inject inject,
      @NotNull final Asset asset,
      @NotNull final InjectExpectation.EXPECTATION_TYPE expectationType) {
    Endpoint resolvedEndpoint = endpointService.endpoint(asset.getId());
    List<String> agentIds =
        resolvedEndpoint.getAgents().stream()
            .map(Agent::getId)
            .distinct()
            .toList(); // fixme agents could de empty/null
    return this.injectExpectationRepository.findAll(
        Specification.where(InjectExpectationSpecification.type(expectationType))
            .and(InjectExpectationSpecification.fromAgents(inject.getId(), agentIds)));
  }

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

  // -- PREVENTION --

  public List<InjectExpectation> preventionExpectationsNotFill(@NotBlank final String source) {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(PREVENTION)))
        .stream()
        .filter(e -> e.getAsset() != null && e.getAgent() != null)
        .filter(e -> e.getResults().stream().noneMatch(r -> source.equals(r.getSourceId())))
        .toList();
  }

  public List<InjectExpectation> preventionExpectationsNotFill() {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(PREVENTION)))
        .stream()
        .filter(e -> e.getAsset() != null && e.getAsset() != null)
        .filter(e -> e.getResults().stream().toList().isEmpty())
        .toList();
  }

  // -- DETECTION --

  public List<InjectExpectation> detectionExpectationsNotFill(@NotBlank final String source) {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(DETECTION)))
        .stream()
        .filter(e -> e.getAsset() != null && e.getAgent() != null)
        .filter(e -> e.getResults().stream().noneMatch(r -> source.equals(r.getSourceId())))
        .toList();
  }

  public List<InjectExpectation> detectionExpectationsNotFill() {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(DETECTION)))
        .stream()
        .filter(e -> e.getAsset() != null && e.getAgent() != null)
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
        case AGENT -> injectExpectationRepository.findAllByInjectAndAgent(injectId, targetId);
        case ASSETS -> injectExpectationRepository.findAllByInjectAndAsset(injectId, targetId);
        case ASSETS_GROUPS ->
            injectExpectationRepository.findAllByInjectAndAssetGroup(injectId, targetId);
      };
    } catch (IllegalArgumentException e) {
      return Collections.emptyList();
    }
  }

  // -- BUILD AND SAVE INJECT EXPECTATION --

  @Transactional
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
                .collect(Collectors.toList());

        if (!assets.isEmpty()) {
          // Generate injectExpectations for Agents
          List<InjectExpectation> injectExpectationsAgent =
              assets.stream()
                  .filter(asset -> asset instanceof Endpoint)
                  .map(asset -> (Endpoint) Hibernate.unproxy(asset))
                  .flatMap(
                      endpoint ->
                          endpoint.getAgents().stream()
                              .filter(Agent::isActive)
                              .flatMap(
                                  agent ->
                                      injectExpectations.stream()
                                          .filter(
                                              injectExpectation ->
                                                  injectExpectation
                                                      .getAsset()
                                                      .getId()
                                                      .equals(endpoint.getId()))
                                          .map(
                                              injectExpectation ->
                                                  cloneInjectExpectationForAgent(
                                                      agent, injectExpectation))))
                  .toList();
          injectExpectations.addAll(injectExpectationsAgent);
        }

        injectExpectationRepository.saveAll(injectExpectations);
      }
    }
  }

  private InjectExpectation cloneInjectExpectationForAgent(
      Agent agent, InjectExpectation injectExpectation) {
    InjectExpectation clone = new InjectExpectation();
    try {
      BeanUtils.copyProperties(clone, injectExpectation);
      clone.setAgent(agent);
      clone.setSignatures(injectExpectation.getSignatures());
      return clone;
    } catch (IllegalAccessException | InvocationTargetException e) {
      throw new RuntimeException("Failed to copy object", e);
    }
  }
}
