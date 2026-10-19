package io.openaev.search;

import static io.openaev.utils.FilterUtilsJpa.computeFilterGroupJpa;
import static io.openaev.utils.pagination.PaginationUtils.buildPageable;
import static io.openaev.utils.pagination.SortUtilsCriteriaBuilder.toSortCriteriaBuilder;
import static io.openaev.utils.pagination.SortUtilsRuntime.toSortRuntime;
import static org.springframework.util.StringUtils.hasText;

import io.openaev.context.TenantContext;
import io.openaev.database.model.*;
import io.openaev.database.repository.*;
import io.openaev.database.specification.SpecificationUtils;
import io.openaev.database.specification.TenantSpecification;
import io.openaev.service.UserService;
import io.openaev.utils.pagination.SearchPaginationInput;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.hibernate.query.criteria.HibernateCriteriaBuilder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Component;

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
  private final UserService userService;
  private final EntityManager entityManager;

  private Map<Class<T>, JpaSpecificationExecutor<T>> repositoryMap;

  private Map<Class<T>, List<String>> searchListByClassMap;
  private Map<Class<T>, Optional<Capability>> capaByClassMap;

  @PostConstruct
  @SuppressWarnings("unchecked")
  public void init() {
    this.repositoryMap =
        Map.of(
            (Class<T>) Asset.class, (JpaSpecificationExecutor<T>) this.assetRepository,
            (Class<T>) AssetGroup.class, (JpaSpecificationExecutor<T>) this.assetGroupRepository,
            (Class<T>) User.class, (JpaSpecificationExecutor<T>) this.userRepository,
            (Class<T>) Team.class, (JpaSpecificationExecutor<T>) this.teamRepository,
            (Class<T>) Organization.class,
                (JpaSpecificationExecutor<T>) this.organizationRepository,
            (Class<T>) Scenario.class, (JpaSpecificationExecutor<T>) this.scenarioRepository,
            (Class<T>) Exercise.class, (JpaSpecificationExecutor<T>) this.exerciseRepository);

    this.searchListByClassMap =
        Map.of(
            (Class<T>) Asset.class,
            List.of("name", "id"),
            (Class<T>) AssetGroup.class,
            List.of("name", "id"),
            (Class<T>) User.class,
            List.of("email", "id"),
            (Class<T>) Team.class,
            List.of("name", "id"),
            (Class<T>) Organization.class,
            List.of("name", "id"),
            (Class<T>) Scenario.class,
            List.of("name", "id"),
            (Class<T>) Exercise.class,
            List.of("name", "id"));

    this.capaByClassMap =
        Map.of(
            (Class<T>) Asset.class,
            Capability.of(ResourceType.ASSET, Action.SEARCH),
            (Class<T>) AssetGroup.class,
            Capability.of(ResourceType.ASSET_GROUP, Action.SEARCH),
            (Class<T>) User.class,
            Capability.of(ResourceType.USER, Action.SEARCH),
            (Class<T>) Team.class,
            Capability.of(ResourceType.TEAM, Action.SEARCH),
            (Class<T>) Organization.class,
            Capability.of(ResourceType.ORGANIZATION, Action.SEARCH),
            (Class<T>) Scenario.class,
            Capability.of(ResourceType.SCENARIO, Action.SEARCH),
            (Class<T>) Exercise.class,
            Capability.of(ResourceType.SIMULATION, Action.SEARCH));

    validateMapKeys();
  }

  /** Ensure that the map have all the same classes, in case we forget when adding a new class. */
  private void validateMapKeys() {
    Set<Class<T>> keys1 = repositoryMap.keySet();
    Set<Class<T>> keys2 = searchListByClassMap.keySet();
    Set<Class<T>> keys3 = capaByClassMap.keySet();

    if (!keys1.equals(keys2) || !keys1.equals(keys3)) {
      throw new IllegalStateException("All maps must have the same keys");
    }
  }

  private PageImpl<FullTextSearchResult> generateEmptyResult(
      final SearchPaginationInput searchPaginationInput) {
    Pageable pageable =
        PageRequest.of(
            searchPaginationInput.getPage(),
            searchPaginationInput.getSize(),
            toSortRuntime(searchPaginationInput.getSorts()));
    return new PageImpl<>(Collections.emptyList(), pageable, 0);
  }

  public Page<FullTextSearchResult> fullTextSearch(
      @NotBlank final Class<?> clazz, @NotNull final SearchPaginationInput searchPaginationInput) {
    if (!hasText(searchPaginationInput.getTextSearch())) {
      return generateEmptyResult(searchPaginationInput);
    }

    Class<T> clazzT =
        this.repositoryMap.keySet().stream()
            .filter(k -> k.isAssignableFrom(clazz))
            .findFirst()
            .orElseThrow(
                () -> new IllegalArgumentException(clazz + " is not handle by full text search"));

    User currentUser = userService.currentUser();
    // Check if the principal has the right to search this class
    Capability capaForClass = capaByClassMap.get(clazzT).orElse(Capability.BYPASS);
    boolean isGrantable = clazzT.getAnnotation(Grantable.class) != null;

    if (!currentUser.isAdminOrBypass() && capaForClass != Capability.BYPASS && !isGrantable) {
      // We can't really use the PermissionService.hasPermission method here because it would
      // require a mapping between classes and resourceType
      if (!currentUser.getCapabilities().contains(Capability.BYPASS)
          && !currentUser.getCapabilities().contains(capaForClass)) {
        return generateEmptyResult(searchPaginationInput);
      }
    }

    String finalSearchTerm = getFinalSearchTerm(searchPaginationInput.getTextSearch());

    // Specification building
    Specification<T> specs =
        SpecificationUtils.<T>fullTextSearch(finalSearchTerm, searchListByClassMap.get(clazzT))
            .and(
                SpecificationUtils.hasGrantAccess(
                    currentUser.getId(),
                    currentUser.isAdminOrBypass(),
                    currentUser.getCapabilities().contains(capaForClass),
                    Grant.GRANT_TYPE.OBSERVER))
            .and(TenantSpecification.fromTenant(TenantContext.getCurrentTenant()))
            .and(computeFilterGroupJpa(searchPaginationInput.getFilterGroup()));

    return findResults(clazzT, specs, buildPageable(searchPaginationInput, clazzT));
  }

  // Projection: entities are never loaded, so their eager associations and graphs are skipped.
  private Page<FullTextSearchResult> findResults(
      Class<T> clazz, Specification<T> specification, Pageable pageable) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    CriteriaQuery<Tuple> cq = cb.createTupleQuery();
    Root<T> root = cq.from(clazz);

    HibernateCriteriaBuilder hcb = (HibernateCriteriaBuilder) cb;
    Join<T, Tag> tagsJoin = root.join("tags", JoinType.LEFT);
    Expression<String[]> tagIdsWithNulls = hcb.arrayAgg(null, tagsJoin.get("id"));
    Expression<String> nullString = cb.nullLiteral(String.class);
    Expression<String[]> tagIds = hcb.arrayRemove(tagIdsWithNulls, nullString);
    boolean isUser = User.class.equals(clazz);
    boolean isAsset = Asset.class.equals(clazz);

    List<Selection<?>> selections = new ArrayList<>();
    selections.add(root.get("id").alias("id"));
    selections.add(root.get(isUser ? "email" : "name").alias("name"));
    selections.add(
        (isUser ? cb.nullLiteral(String.class) : root.<String>get("description"))
            .alias("description"));
    selections.add(tagIds.alias("tags"));
    if (isAsset) {
      selections.add(root.type().alias("type"));
    }
    cq.multiselect(selections).groupBy(root.get("id"));

    Predicate predicate = specification.toPredicate(root, cq, cb);
    if (predicate != null) {
      cq.where(predicate);
    }
    // Keep the rank order set by the full text specification unless a sort is requested
    if (pageable.getSort().isSorted()) {
      cq.orderBy(toSortCriteriaBuilder(cb, root, pageable.getSort()));
    }

    List<FullTextSearchResult> results =
        entityManager
            .createQuery(cq)
            .setFirstResult((int) pageable.getOffset())
            .setMaxResults(pageable.getPageSize())
            .getResultList()
            .stream()
            .map(
                tuple ->
                    new FullTextSearchResult(
                        tuple.get("id", String.class),
                        tuple.get("name", String.class),
                        tuple.get("description", String.class),
                        Set.copyOf(Arrays.asList(tuple.get("tags", String[].class))),
                        isAsset && SecurityPlatform.class.equals(tuple.get("type"))
                            ? SecurityPlatform.class.getSimpleName()
                            : clazz.getSimpleName()))
            .toList();

    return new PageImpl<>(results, pageable, count(clazz, specification));
  }

  private long count(Class<T> clazz, Specification<T> specification) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    CriteriaQuery<Long> cq = cb.createQuery(Long.class);
    Root<T> root = cq.from(clazz);
    cq.select(cb.countDistinct(root));
    Predicate predicate = specification.toPredicate(root, cq, cb);
    if (predicate != null) {
      cq.where(predicate);
    }
    // The full text specification adds a rank order, invalid in a count
    cq.orderBy(List.of());
    return entityManager.createQuery(cq).getSingleResult();
  }

  /**
   * Perform a full text search on all classes and only return the counts for each class. To get the
   * results, use the {@link #fullTextSearch(Class, SearchPaginationInput)}
   *
   * @param searchTerm the search term to use
   * @return a map of class type to the count of results for that class
   */
  @SuppressWarnings("unchecked")
  public Map<Class<T>, FullTextSearchCountResult> fullTextSearch(
      @Nullable final String searchTerm) {
    if (!hasText(searchTerm)) {
      return Map.of(
          (Class<T>) Asset.class, new FullTextSearchCountResult(Asset.class.getSimpleName(), 0L),
          (Class<T>) AssetGroup.class,
              new FullTextSearchCountResult(AssetGroup.class.getSimpleName(), 0L),
          (Class<T>) User.class, new FullTextSearchCountResult(User.class.getSimpleName(), 0L),
          (Class<T>) Team.class, new FullTextSearchCountResult(Team.class.getSimpleName(), 0L),
          (Class<T>) Organization.class,
              new FullTextSearchCountResult(Organization.class.getSimpleName(), 0L),
          (Class<T>) Scenario.class,
              new FullTextSearchCountResult(Scenario.class.getSimpleName(), 0L),
          (Class<T>) Exercise.class,
              new FullTextSearchCountResult(Exercise.class.getSimpleName(), 0L));
    }

    Map<Class<T>, FullTextSearchCountResult> results = new HashMap<>();
    String finalSearchTerm = getFinalSearchTerm(searchTerm);

    User currentUser = userService.currentUser();
    // Only search classes that the user has access to
    Set<Class<T>> classesToSearch;
    if (currentUser.isAdminOrBypass()) {
      classesToSearch = new HashSet<>(repositoryMap.keySet());
    } else {

      classesToSearch = new HashSet<>();
      for (Map.Entry<Class<T>, Optional<Capability>> entry : capaByClassMap.entrySet()) {
        Capability capaForClass = entry.getValue().orElse(Capability.BYPASS);
        if (currentUser.getCapabilities().contains(capaForClass)
            || Capability.BYPASS.equals(capaForClass)) {
          classesToSearch.add(entry.getKey());
        }
      }
    }

    classesToSearch.forEach(
        tClass -> {
          JpaSpecificationExecutor<T> repository = repositoryMap.get(tClass);
          // Specification building
          Specification<T> specs =
              SpecificationUtils.<T>fullTextSearch(
                      finalSearchTerm, searchListByClassMap.get(tClass))
                  .and(
                      SpecificationUtils.hasGrantAccess(
                          currentUser.getId(),
                          currentUser.isAdminOrBypass(),
                          currentUser
                              .getCapabilities()
                              .contains(capaByClassMap.get(tClass).orElse(Capability.BYPASS)),
                          Grant.GRANT_TYPE.OBSERVER))
                  .and(TenantSpecification.fromTenant(TenantContext.getCurrentTenant()));
          long count = repository.count(specs);
          results.put(tClass, new FullTextSearchCountResult(tClass.getSimpleName(), count));
        });

    return results;
  }

  private static String getFinalSearchTerm(String searchTerm) {
    return Arrays.stream(searchTerm.split(" "))
        .map(s -> "(" + s + ":*)")
        .collect(Collectors.joining(" & "));
  }

  public List<String> getAllowedClass() {
    return this.repositoryMap.keySet().stream().map(Class::getName).toList();
  }

  @AllArgsConstructor
  @Data
  public static class FullTextSearchCountResult {

    @NotBlank private String clazz;
    @NotBlank private long count;
  }

  public record FullTextSearchResult(
      @NotBlank String id,
      @NotBlank String name,
      String description,
      Set<String> tags,
      @NotBlank String clazz) {}
}
