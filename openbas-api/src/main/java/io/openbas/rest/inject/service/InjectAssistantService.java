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
import java.util.stream.Stream;
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
            "This placeholder is disabled because the TTP %s with platform %s and architecture %s is currently not covered. Please create the payloads for the missing TTP.",
            attackPattern.getExternalId(), platform, architecture),
        false);
  }

  /**
   * Searches InjectorContract from database based on the attack pattern and a list of
   * platform-architecture pairs (e.g., Linux:x86_64, macOS:arm64), with a result limit.
   */
  private List<InjectorContract> searchInjectorContracts(
      String attackPatternExternalId, List<String> platformArchitecturePairs, Integer limit) {
    StringBuilder sql =
        new StringBuilder(
            "SELECT ic.* FROM injectors_contracts ic "
                + "JOIN payloads p ON ic.injector_contract_payload = p.payload_id "
                + "JOIN injectors_contracts_attack_patterns injectorAttack ON ic.injector_contract_id = injectorAttack.injector_contract_id "
                + "JOIN attack_patterns a ON  injectorAttack.attack_pattern_id = a.attack_pattern_id "
                + "WHERE a.attack_pattern_external_id LIKE :attackPatternExternalId");

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
    query.setParameter("attackPatternExternalId", attackPatternExternalId + "%");
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

  private Map<String, List<Endpoint>> groupEndpointsByPlatformAndArchitecture(
      List<Endpoint> endpoints) {
    return endpoints.stream()
        .collect(
            Collectors.groupingBy(endpoint -> endpoint.getPlatform() + ":" + endpoint.getArch()));
  }

  private record ContractResultForEndpoints(
      Map<InjectorContract, List<Endpoint>> contractEndpointsMap,
      Map<String, List<Endpoint>> manualEndpoints) {}

  private ContractResultForEndpoints getInjectorContractForAssetsAndTTP(
      AttackPattern attackPattern, Integer injectNumberByTTP, List<Endpoint> endpoints) {
    Map<InjectorContract, List<Endpoint>> contractEndpointsMap = new HashMap<>();
    Map<String, List<Endpoint>> manualEndpoints = new HashMap<>();

    // Group endpoints by platform:architecture
    Map<String, List<Endpoint>> groupedAssets =
        this.groupEndpointsByPlatformAndArchitecture(endpoints);

    // Try to find injectors contract covering all platform-architecture pairs at once
    List<InjectorContract> injectorContracts =
        this.searchInjectorContracts(
            attackPattern.getExternalId(),
            groupedAssets.keySet().stream().toList(),
            injectNumberByTTP);

    if (!injectorContracts.isEmpty()) {
      injectorContracts.forEach(ic -> contractEndpointsMap.put(ic, endpoints));
    } else {
      // Or else
      groupedAssets.forEach(
          (platformArchitecture, endpointValue) -> {
            // For each platform architecture pairs try to find injectorContracts
            List<InjectorContract> injectorContractsForGroup =
                this.searchInjectorContracts(
                    attackPattern.getExternalId(),
                    List.of(platformArchitecture),
                    injectNumberByTTP);

            // Else take the manual injectorContract
            if (injectorContractsForGroup.isEmpty()) {
              manualEndpoints.put(platformArchitecture, endpointValue);
            } else {
              injectorContractsForGroup.forEach(ic -> contractEndpointsMap.put(ic, endpointValue));
            }
          });
    }
    return new ContractResultForEndpoints(contractEndpointsMap, manualEndpoints);
  }

  private List<InjectorContract> findInjectorContracts(
      List<InjectorContract> alreadyFoundInjectorContracts,
      List<String> platformArchitecturePairs,
      Integer injectNumberByTTP) {
    if (alreadyFoundInjectorContracts == null
        || platformArchitecturePairs == null
        || platformArchitecturePairs.isEmpty()) {
      return Collections.emptyList();
    }

    Set<Endpoint.PLATFORM_TYPE> platforms = new HashSet<>();
    Set<String> architectures = new HashSet<>();
    for (String pair : platformArchitecturePairs) {
      String[] parts = pair.split(":");
      if (parts.length == 2) {
        platforms.add(Endpoint.PLATFORM_TYPE.valueOf(parts[0]));
        architectures.add(parts[1]);
      }
    }
    String architecture =
        architectures.size() > 1
            ? Payload.PAYLOAD_EXECUTION_ARCH.ALL_ARCHITECTURES.name()
            : architectures.iterator().next();

    return alreadyFoundInjectorContracts.stream()
        .filter(
            ic -> {
              Set<Endpoint.PLATFORM_TYPE> icPlatformsSet =
                  Arrays.stream(ic.getPlatforms()).collect(Collectors.toSet());
              boolean hasPlatforms = icPlatformsSet.containsAll(platforms);
              boolean hasArchitecture =
                  architecture.equals(ic.getPayload().getExecutionArch().name());
              return hasPlatforms && hasArchitecture;
            })
        .limit(injectNumberByTTP)
        .toList();
  }

  private List<InjectorContract> findOrSearchInjectorContract(
      List<InjectorContract> knownInjectorContracts,
      AttackPattern attackPattern,
      List<String> platformArchitecturePairs,
      Integer injectNumberByTTP) {
    // Find in existing list of InjectorContracts
    List<InjectorContract> existingInjectorContract =
        findInjectorContracts(knownInjectorContracts, platformArchitecturePairs, injectNumberByTTP);
    if (!existingInjectorContract.isEmpty()) {
      return existingInjectorContract;
    }

    // Else find from DB
    return this.searchInjectorContracts(
        attackPattern.getExternalId(), platformArchitecturePairs, injectNumberByTTP);
  }

  private record ContractResultForAssetGroup(
      List<InjectorContract> injectorContracts, String unmatchedPlatformArchitecture) {}

  private ContractResultForAssetGroup getInjectorContractsForAssetGroupAndTTP(
      AssetGroup assetGroup,
      AttackPattern attackPattern,
      Integer injectNumberByTTP,
      List<InjectorContract> alreadyFoundContracts) {
    String unmatchedPlatformArchitecture = "";

    // Retrieve and group all endpoints in the asset group by platform:architecture
    List<Endpoint> assetsFromGroup =
        this.assetGroupService.assetsFromAssetGroup(assetGroup.getId()).stream()
            .map(Endpoint.class::cast)
            .toList();
    Map<String, List<Endpoint>> groupedAssets =
        this.groupEndpointsByPlatformAndArchitecture(assetsFromGroup);

    // Try to find an existing injectorsContract that cover all platform:architecture pairs from
    // this group at once
    List<InjectorContract> injectorContracts =
        findOrSearchInjectorContract(
            alreadyFoundContracts,
            attackPattern,
            groupedAssets.keySet().stream().toList(),
            injectNumberByTTP);
    if (!injectorContracts.isEmpty()) {
      return new ContractResultForAssetGroup(injectorContracts, unmatchedPlatformArchitecture);
    }

    // Otherwise, select the most common platform-architecture group
    String mostCommonPlatformArch =
        groupedAssets.entrySet().stream()
            .max(Comparator.comparingInt(entry -> entry.getValue().size()))
            .map(Map.Entry::getKey)
            .orElse("");

    // Try to find injectors contract for the most common group
    List<InjectorContract> injectorContractsForGroup =
        findOrSearchInjectorContract(
            alreadyFoundContracts,
            attackPattern,
            List.of(mostCommonPlatformArch),
            injectNumberByTTP);
    if (injectorContractsForGroup.isEmpty()) {
      unmatchedPlatformArchitecture = mostCommonPlatformArch;
    }
    return new ContractResultForAssetGroup(injectorContracts, unmatchedPlatformArchitecture);
  }

  private void handleEndpoints(
      List<Endpoint> endpoints,
      AttackPattern attackPattern,
      Integer injectNumberByTTP,
      Map<InjectorContract, Inject> contractInjectMap,
      Map<String, Inject> manualInjectMap,
      List<InjectorContract> knownInjectorContracts) {
    ContractResultForEndpoints endpointResults =
        getInjectorContractForAssetsAndTTP(attackPattern, injectNumberByTTP, endpoints);

    // Add matched contracts
    endpointResults.contractEndpointsMap.forEach(
        (contract, value) -> {
          Inject inject =
              contractInjectMap.computeIfAbsent(
                  contract, k -> buildTechnicalInjectFromInjectorContract(k, attackPattern));
          inject.setAssets(value.stream().map(Asset.class::cast).toList());
        });

    // Add manual injects
    endpointResults.manualEndpoints.forEach(
        (platformArchitecture, value) -> {
          Inject inject =
              manualInjectMap.computeIfAbsent(
                  platformArchitecture,
                  key -> {
                    String[] parts = key.split(":");
                    return buildManualInject(attackPattern, parts[0], parts[1]);
                  });
          inject.setAssets(value.stream().map(Asset.class::cast).toList());
        });

    knownInjectorContracts.addAll(endpointResults.contractEndpointsMap.keySet());
  }

  private void handleAssetGroups(
      List<AssetGroup> assetGroups,
      AttackPattern attackPattern,
      Integer injectNumberByTTP,
      Map<InjectorContract, Inject> contractInjectMap,
      Map<String, Inject> manualInjectMap,
      List<InjectorContract> knownInjectorContracts) {
    for (AssetGroup group : assetGroups) {
      ContractResultForAssetGroup result =
          getInjectorContractsForAssetGroupAndTTP(
              group, attackPattern, injectNumberByTTP, knownInjectorContracts);

      result.injectorContracts.forEach(
          contract -> {
            Inject inject =
                contractInjectMap.computeIfAbsent(
                    contract, k -> buildTechnicalInjectFromInjectorContract(k, attackPattern));
            inject.getAssetGroups().add(group);
          });

      if (!result.unmatchedPlatformArchitecture.isEmpty()) {
        Inject inject =
            manualInjectMap.computeIfAbsent(
                result.unmatchedPlatformArchitecture,
                k -> {
                  String[] parts = k.split(":");
                  return buildManualInject(attackPattern, parts[0], parts[1]);
                });
        inject.getAssetGroups().add(group);
      }

      knownInjectorContracts.addAll(result.injectorContracts);
    }
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

    // Try to find injector contract covering all platform-architecture pairs at once
    List<String> allPlatformArchitecturePairs = getAllPlatform();
    List<InjectorContract> injectorContracts =
        this.searchInjectorContracts(
            attackPattern.getExternalId(), allPlatformArchitecturePairs, injectNumberByTTP);

    if (!injectorContracts.isEmpty()) {
      return injectorContracts.stream()
          .map(
              ic -> {
                Inject inject = buildTechnicalInjectFromInjectorContract(ic, attackPattern);
                inject.setAssetGroups(assetGroups);
                inject.setAssets(endpoints.stream().map(Asset.class::cast).toList());
                return inject;
              })
          .toList();
    }

    // Otherwise, process for all endpoints and all assetgroups to find injector contract that match
    // with TTP and platforms/architectures
    Map<InjectorContract, Inject> contractInjectMap = new HashMap<>();
    Map<String, Inject> manualInjectMap = new HashMap<>();
    List<InjectorContract> knownInjectorContracts = new ArrayList<>();

    handleEndpoints(
        endpoints,
        attackPattern,
        injectNumberByTTP,
        contractInjectMap,
        manualInjectMap,
        knownInjectorContracts);
    handleAssetGroups(
        assetGroups,
        attackPattern,
        injectNumberByTTP,
        contractInjectMap,
        manualInjectMap,
        knownInjectorContracts);

    return Stream.concat(contractInjectMap.values().stream(), manualInjectMap.values().stream())
        .toList();
  }
}
