package io.openbas.rest.inject.service;

import io.openbas.database.model.*;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.injectors.manual.ManualContract;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.form.InjectAssistantInput;
import io.openbas.rest.injector_contract.InjectorContractService;
import io.openbas.service.AssetGroupService;
import io.openbas.service.EndpointService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@RequiredArgsConstructor
@Validated
public class InjectAssistantService {

  private final AssetGroupService assetGroupService;
  private final EndpointService endpointService;
  private final InjectorContractService injectorContractService;
  private final AttackPatternRepository attackPatternRepository;
  private final InjectRepository injectRepository;

  private InjectorContract manualInjectorContract = null;

  @PersistenceContext private EntityManager entityManager;

  public List<Inject> generateInjectsForScenario(Scenario scenario, InjectAssistantInput input) {
    if (input.getInjectByTTPNumber() > 5) {
      throw new UnsupportedOperationException(
          "Number of inject by ttp must be less than or equal to 5");
    }
    List<Endpoint> endpoints = this.endpointService.endpoints(input.getAssetIds());
    List<AssetGroup> assetGroups = this.assetGroupService.assetGroups(input.getAssetGroupIds());

    // Process injects generation for each attack pattern
    List<Inject> injects = new ArrayList<>();
    input
        .getAttackPatternIds()
        .forEach(
            attackPatternId -> {
              List<Inject> injectsToAdd =
                  this.generateInjectsByTTP(
                      attackPatternId, endpoints, assetGroups, input.getInjectByTTPNumber());
              injects.addAll(injectsToAdd);
            });

    for (Inject inject : injects) {
      inject.setScenario(scenario);
    }

    return this.injectRepository.saveAll(injects);
  }

  private Inject buildInject(
      InjectorContract injectorContract, String title, String description, Boolean enabled) {
    Inject inject = new Inject();
    inject.setTitle(title);
    inject.setDescription(description);
    inject.setInjectorContract(injectorContract);
    inject.setDependsDuration(0L);
    inject.setEnabled(enabled);
    inject.setContent(
        this.injectorContractService.getDynamicInjectorContractFieldsForInject(injectorContract));
    return inject;
  }

  private Inject buildTechnicalInjectFromInjectorContract(
      InjectorContract injectorContract, AttackPattern attackPattern) {
    return buildInject(
        injectorContract,
        String.format(
            "[%s] %s - %s",
            attackPattern.getExternalId(),
            attackPattern.getName(),
            injectorContract.getLabels().get("en")),
        null,
        true);
  }

  private Inject buildManualInject(
      AttackPattern attackPattern, String platform, String architecture) {
    if (manualInjectorContract == null) {
      manualInjectorContract =
          this.injectorContractService.injectorContract(ManualContract.MANUAL_DEFAULT);
    }
    return buildInject(
        manualInjectorContract,
        String.format(
            "[%s] Placeholder - %s %s", attackPattern.getExternalId(), platform, architecture),
        String.format(
            "This placeholder is disabled because the TTP %s with platform %s and architecture %s is currently not covered. Please create the payloads for the missing TTP",
            attackPattern.getExternalId(), platform, architecture),
        false);
  }

  private List<InjectorContract> searchInjectorContracts(
      String attackPatternId, List<String> platformArchitecturePairs, Integer limit) {
    StringBuilder sql =
        new StringBuilder(
            "SELECT ic.* FROM injectors_contracts ic "
                + "JOIN payloads p ON ic.injector_contract_payload = p.payload_id "
                + "JOIN injectors_contracts_attack_patterns a ON ic.injector_contract_id = a.injector_contract_id "
                + "WHERE a.attack_pattern_id = :attackPatternId");

    for (String pair : platformArchitecturePairs) {
      String[] parts = pair.split(":");
      String platform = parts[0];
      String architecture = parts.length > 1 ? parts[1] : "";

      sql.append(" AND '").append(platform).append("' = ANY(ic.injector_contract_platforms)");
      if (!architecture.isEmpty()) {
        sql.append(" AND (p.payload_execution_arch = '")
            .append(architecture)
            .append("' OR p.payload_execution_arch = 'ALL_ARCHITECTURES')");
      }
    }

    sql.append(" ORDER BY RANDOM() LIMIT :limit");

    Query query = this.entityManager.createNativeQuery(sql.toString(), InjectorContract.class);
    query.setParameter("attackPatternId", attackPatternId);
    query.setParameter("limit", limit);

    List<InjectorContract> results = query.getResultList();
    return results;
  }

  @NotNull
  private List<String> getAllPlatform() {
    List<String> allPlatformArchitecturePairs = new ArrayList<>();
    allPlatformArchitecturePairs.add(Endpoint.PLATFORM_TYPE.Linux.name());
    allPlatformArchitecturePairs.add(Endpoint.PLATFORM_TYPE.MacOS.name());
    allPlatformArchitecturePairs.add(Endpoint.PLATFORM_TYPE.Windows.name());
    return allPlatformArchitecturePairs;
  }

  private List<Inject> findMatchingInjects(
      Map<List<String>, List<Inject>> injectsCreatedByPlatformArch,
      List<String> platformArchitecturePairs) {
    return injectsCreatedByPlatformArch.entrySet().stream()
        .filter(entry -> new HashSet<>(entry.getKey()).containsAll(platformArchitecturePairs))
        .flatMap(entry -> entry.getValue().stream())
        .toList();
  }

  private Map<String, List<Endpoint>> groupEndpointsByPlatformAndArchitecture(
      List<Endpoint> endpoints) {
    return endpoints.stream()
        .collect(
            Collectors.groupingBy(endpoint -> endpoint.getPlatform() + ":" + endpoint.getArch()));
  }

  /**
   * This method checks if an inject for the given platform-architecture pairs already exists and
   * returns it. If not, it tries to create one using a matching injector contract. If neither is
   * possible, it returns an empty list.
   */
  private List<Inject> getOrCreateInjectsByTTPAndPlatformArchitecturePairs(
      AttackPattern attackPattern,
      List<String> plarformArchitecturePairs,
      Map<List<String>, List<Inject>> injectsCreatedByPlatformArch,
      Integer injectNumberByTTP) {
    List<Inject> injectsMatched =
        findMatchingInjects(injectsCreatedByPlatformArch, plarformArchitecturePairs);
    if (!injectsMatched.isEmpty()) {
      return injectsMatched;
    }

    List<InjectorContract> injectorContracts =
        this.searchInjectorContracts(
            attackPattern.getId(), plarformArchitecturePairs, injectNumberByTTP);
    if (injectorContracts.isEmpty()) {
      return new ArrayList<>();
    }

    List<Inject> injects =
        injectorContracts.stream()
            .map(i -> buildTechnicalInjectFromInjectorContract(i, attackPattern))
            .toList();
    injectsCreatedByPlatformArch.put(plarformArchitecturePairs, injects);
    return injects;
  }

  /**
   * This method calls getOrCreateInjectsByTTPAndPlatformArchitecturePairs; if it returns an empty
   * list, it creates and returns a manual inject.
   */
  private List<Inject> getOrCreateInjectsByTTPAndPlatformArchitecturePairWithManualFallback(
      Map<List<String>, List<Inject>> injectsCreatedByPlatformArch,
      AttackPattern attackPattern,
      String platformArchitecture,
      Integer injectNumberByTTP) {

    List<Inject> injects =
        getOrCreateInjectsByTTPAndPlatformArchitecturePairs(
            attackPattern,
            List.of(platformArchitecture),
            injectsCreatedByPlatformArch,
            injectNumberByTTP);

    if (injects.isEmpty()) {
      String[] parts = platformArchitecture.split(":");
      String platform = parts[0];
      String architecture = parts[1];
      Inject manualInject = buildManualInject(attackPattern, platform, architecture);
      injectsCreatedByPlatformArch.put(List.of(platformArchitecture), List.of(manualInject));
      injects.add(manualInject);
    }

    return injects;
  }

  /**
   * Processes a set of endpoints by grouping them by platform-architecture pairs, then finds or
   * creates corresponding injects.
   */
  private void processInjectsByAsset(
      Map<List<String>, List<Inject>> injectsCreatedByPlatformArch,
      AttackPattern attackPattern,
      Integer injectNumberByTTP,
      List<Endpoint> endpoints) {
    if (endpoints.isEmpty()) {
      return;
    }
    // Group endpoints by platform:architecture
    Map<String, List<Endpoint>> groupedAssets =
        this.groupEndpointsByPlatformAndArchitecture(endpoints);

    // Try to find or create a single inject covering all platform-architecture pairs
    List<Inject> injects =
        getOrCreateInjectsByTTPAndPlatformArchitecturePairs(
            attackPattern,
            groupedAssets.keySet().stream().toList(),
            injectsCreatedByPlatformArch,
            injectNumberByTTP);

    if (injects.isEmpty()) {
      // For each platform architecture pairs try to create an inject or else create manual inject
      groupedAssets.forEach(
          (platformArchitecture, endpointValue) -> {
            List<Inject> injectsForGroup =
                getOrCreateInjectsByTTPAndPlatformArchitecturePairWithManualFallback(
                    injectsCreatedByPlatformArch,
                    attackPattern,
                    platformArchitecture,
                    injectNumberByTTP);
            injectsForGroup.forEach(
                inject -> inject.setAssets(endpointValue.stream().map(Asset.class::cast).toList()));
            injects.addAll(injectsForGroup);
          });
    } else {
      injects.forEach(
          inject -> inject.setAssets(endpoints.stream().map(Asset.class::cast).toList()));
    }
  }

  /**
   * Processes an asset group by grouping its assets according to platform-architecture pairs, then
   * finds or creates the most appropriate inject(s) for these groups.
   */
  private void processInjectsByAssetGroup(
      Map<List<String>, List<Inject>> injectsCreatedByPlatformArch,
      AttackPattern attackPattern,
      Integer injectNumberByTTP,
      AssetGroup assetGroup) {
    // Retrieve and group all endpoints in the asset group by platform:architecture
    List<Endpoint> assetsFromGroup =
        this.assetGroupService.assetsFromAssetGroup(assetGroup.getId()).stream()
            .map(Endpoint.class::cast)
            .toList();
    Map<String, List<Endpoint>> groupedAssets =
        this.groupEndpointsByPlatformAndArchitecture(assetsFromGroup);

    // Try to find or create a single inject covering all platform-architecture pairs
    List<Inject> injects =
        getOrCreateInjectsByTTPAndPlatformArchitecturePairs(
            attackPattern,
            groupedAssets.keySet().stream().toList(),
            injectsCreatedByPlatformArch,
            injectNumberByTTP);

    if (injects.isEmpty()) {
      // Otherwise, select the most common platform-architecture group
      String mostCommonPlatformArch =
          groupedAssets.entrySet().stream()
              .max(Comparator.comparingInt(entry -> entry.getValue().size()))
              .map(Map.Entry::getKey)
              .orElse("");

      // Try to create an inject for the most common group or else create manual inject
      List<Inject> injectsForGroup =
          getOrCreateInjectsByTTPAndPlatformArchitecturePairWithManualFallback(
              injectsCreatedByPlatformArch,
              attackPattern,
              mostCommonPlatformArch,
              injectNumberByTTP);
      injects.addAll(injectsForGroup);
    }

    injects.forEach(
        inject -> {
          List<AssetGroup> existing = inject.getAssetGroups();
          if (!existing.isEmpty()) {
            existing.add(assetGroup);
            inject.setAssetGroups(existing);
          } else {
            inject.setAssetGroups(new ArrayList<>(List.of(assetGroup)));
          }
        });
  }

  private List<Inject> generateInjectsByTTP(
      String attackPatternId,
      List<Endpoint> endpoints,
      List<AssetGroup> assetGroups,
      Integer injectNumberByTTP) {
    // Check if attack pattern exist
    AttackPattern attackPattern =
        this.attackPatternRepository
            .findById(attackPatternId)
            .orElseThrow(() -> new ElementNotFoundException("Attack pattern not found"));
    Map<List<String>, List<Inject>> injectsCreatedByPlatformArch = new HashMap<>();

    // Try to find or create a single inject covering all platform-architecture pairs
    List<String> allPlatformArchitecturePairs = getAllPlatform();
    List<Inject> injects =
        getOrCreateInjectsByTTPAndPlatformArchitecturePairs(
            attackPattern,
            allPlatformArchitecturePairs,
            injectsCreatedByPlatformArch,
            injectNumberByTTP);

    if (!injects.isEmpty()) {
      return injects.stream()
          .map(
              inject -> {
                inject.setAssets(endpoints.stream().map(Asset.class::cast).toList());
                inject.setAssetGroups(assetGroups);
                return inject;
              })
          .toList();
    }

    // Otherwise, check for asset and for asset-group
    processInjectsByAsset(
        injectsCreatedByPlatformArch, attackPattern, injectNumberByTTP, endpoints);
    assetGroups.forEach(
        assetGroup ->
            processInjectsByAssetGroup(
                injectsCreatedByPlatformArch, attackPattern, injectNumberByTTP, assetGroup));

    return injectsCreatedByPlatformArch.values().stream().flatMap(List::stream).toList();
  }
}
