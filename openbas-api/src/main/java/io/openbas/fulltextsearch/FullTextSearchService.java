package io.openbas.fulltextsearch;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.database.specification.SpecificationUtils;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Component;

import javax.annotation.Nullable;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;
import static org.springframework.util.StringUtils.hasText;

@Component
@RequiredArgsConstructor
public class FullTextSearchService<T extends Base> {

  private final AssetRepository assetRepository;
  private final AssetGroupRepository assetGroupRepository;
  private final UserRepository userRepository;
  private final TeamRepository teamRepository;
  private final OrganizationRepository organizationRepository;
  private final ScenarioRepository scenarioRepository;
  private final ExerciseRepository exerciseRepository;

  private Map<Class<T>, JpaSpecificationExecutor<T>> repositoryMap;

  @PostConstruct
  @SuppressWarnings("unchecked")
  public void init() {
    this.repositoryMap = Map.of(
        (Class<T>) Asset.class, (JpaSpecificationExecutor<T>) this.assetRepository,
        (Class<T>) AssetGroup.class, (JpaSpecificationExecutor<T>) this.assetGroupRepository,
        (Class<T>) User.class, (JpaSpecificationExecutor<T>) this.userRepository,
        (Class<T>) Team.class, (JpaSpecificationExecutor<T>) this.teamRepository,
        (Class<T>) Organization.class, (JpaSpecificationExecutor<T>) this.organizationRepository,
        (Class<T>) Scenario.class, (JpaSpecificationExecutor<T>) this.scenarioRepository,
        (Class<T>) Exercise.class, (JpaSpecificationExecutor<T>) this.exerciseRepository
    );
  }

  public Page<FullTextSearchResult> fullTextSearch(
      @NotBlank final String clazz,
      @Nullable final SearchPaginationInput searchPaginationInput) throws ClassNotFoundException {
    if (searchPaginationInput == null) {
      return Page.empty();
    }

    Class<?> clazzUnknown = Class.forName(clazz);
    Class<T> clazzT = this.repositoryMap.keySet().stream()
        .filter((k) -> k.isAssignableFrom(clazzUnknown))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException(clazz + " is not handle by full text search"));

    JpaSpecificationExecutor<T> repository = repositoryMap.get(clazzT);

    return buildPaginationJPA(
        repository::findAll,
        searchPaginationInput,
        clazzT
    ).map(this::transform);
  }

  private FullTextSearchResult transform(T element) {
    switch (element) {
      case Asset asset -> {
        FullTextSearchResult result = new FullTextSearchResult();
        result.setId(asset.getId());
        result.setName(asset.getName());
        result.setClazz(Asset.class.getSimpleName());
        return result;
      }
      case AssetGroup assetGroup -> {
        FullTextSearchResult result = new FullTextSearchResult();
        result.setId(assetGroup.getId());
        result.setName(assetGroup.getName());
        result.setClazz(AssetGroup.class.getSimpleName());
        return result;
      }
      case User user -> {
        FullTextSearchResult result = new FullTextSearchResult();
        result.setId(user.getId());
        result.setName(user.getEmail());
        result.setClazz(User.class.getSimpleName());
        return result;
      }
      case Team team -> {
        FullTextSearchResult result = new FullTextSearchResult();
        result.setId(team.getId());
        result.setName(team.getName());
        result.setClazz(Team.class.getSimpleName());
        return result;
      }
      case Organization organization -> {
        FullTextSearchResult result = new FullTextSearchResult();
        result.setId(organization.getId());
        result.setName(organization.getName());
        result.setClazz(Organization.class.getSimpleName());
        return result;
      }
      case Scenario scenario -> {
        FullTextSearchResult result = new FullTextSearchResult();
        result.setId(scenario.getId());
        result.setName(scenario.getName());
        result.setClazz(Scenario.class.getSimpleName());
        return result;
      }
      case Exercise exercise -> {
        FullTextSearchResult result = new FullTextSearchResult();
        result.setId(exercise.getId());
        result.setName(exercise.getName());
        result.setClazz(Exercise.class.getSimpleName());
        return result;
      }
      default -> {
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  public Map<Class<T>, FullTextSearchCountResult> fullTextSearch(@Nullable final String searchTerm) {
    if (!hasText(searchTerm)) {
      return Map.of(
          (Class<T>) Asset.class, new FullTextSearchCountResult(Asset.class.getSimpleName(), 0L),
          (Class<T>) AssetGroup.class, new FullTextSearchCountResult(AssetGroup.class.getSimpleName(), 0L),
          (Class<T>) User.class, new FullTextSearchCountResult(User.class.getSimpleName(), 0L),
          (Class<T>) Team.class, new FullTextSearchCountResult(Team.class.getSimpleName(), 0L),
          (Class<T>) Organization.class, new FullTextSearchCountResult(Organization.class.getSimpleName(), 0L),
          (Class<T>) Scenario.class, new FullTextSearchCountResult(Scenario.class.getSimpleName(), 0L),
          (Class<T>) Exercise.class, new FullTextSearchCountResult(Exercise.class.getSimpleName(), 0L)
      );
    }

    Map<Class<T>, FullTextSearchCountResult> results = new HashMap<>();
    String finalSearchTerm = Arrays.stream(searchTerm.split(" "))
        .map((s) -> "(" + s + ":*)")
        .collect(Collectors.joining(" & "));

    // Search on assets
    long assets = this.assetRepository.count(SpecificationUtils.fullTextSearch(finalSearchTerm, "name"));
    results.put((Class<T>) Asset.class, new FullTextSearchCountResult(Asset.class.getSimpleName(), assets));

    // Search on asset groups
    long assetGroups = this.assetGroupRepository.count(
        SpecificationUtils.fullTextSearch(finalSearchTerm, "name"));
    results.put((Class<T>) AssetGroup.class, new FullTextSearchCountResult(AssetGroup.class.getSimpleName(), assetGroups));

    // Search on users
    long users = this.userRepository.count(SpecificationUtils.fullTextSearch(finalSearchTerm, "email"));
    results.put((Class<T>) User.class, new FullTextSearchCountResult(User.class.getSimpleName(), users));

    // Search on teams
    long teams = this.teamRepository.count(SpecificationUtils.fullTextSearch(finalSearchTerm, "name"));
    results.put((Class<T>) Team.class, new FullTextSearchCountResult(Team.class.getSimpleName(), teams));

    // Search on organizations
    long organizations = this.organizationRepository.count(
        SpecificationUtils.fullTextSearch(finalSearchTerm, "name"));
    results.put((Class<T>) Organization.class, new FullTextSearchCountResult(Organization.class.getSimpleName(), organizations));

    // Search on scenarios
    long scenarios = this.scenarioRepository.count(
        SpecificationUtils.fullTextSearch(finalSearchTerm, "name"));
    results.put((Class<T>) Scenario.class, new FullTextSearchCountResult(Scenario.class.getSimpleName(), scenarios));

    // Search on simulations
    long exercises = this.exerciseRepository.count(
        SpecificationUtils.fullTextSearch(finalSearchTerm, "name"));
    results.put((Class<T>) Exercise.class, new FullTextSearchCountResult(Exercise.class.getSimpleName(), exercises));

    return results;
  }

  @AllArgsConstructor
  @Data
  public static class FullTextSearchCountResult {

    @NotBlank
    private String clazz;
    @NotBlank
    private long count;

  }

  @Data
  public static class FullTextSearchResult {

    @NotBlank
    private String id;
    @NotBlank
    private String name;
    @NotBlank
    private String clazz;

  }

}
