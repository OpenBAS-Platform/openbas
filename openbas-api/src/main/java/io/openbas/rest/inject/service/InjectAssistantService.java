package io.openbas.rest.inject.service;

import io.openbas.database.helper.InjectorContractRepositoryHelper;
import io.openbas.database.model.*;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.injectors.manual.ManualContract;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exception.UnprocessableContentException;
import io.openbas.rest.inject.form.InjectAssistantInput;
import io.openbas.rest.injector_contract.InjectorContractContentUtils;
import io.openbas.rest.injector_contract.InjectorContractService;
import io.openbas.service.AssetGroupService;
import io.openbas.service.EndpointService;
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
  private final InjectorContractRepositoryHelper injectorContractRepositoryHelper;

  private InjectorContract manualInjectorContract = null;

  /**
   * Generate injects for a given scenario based on the provided input.
   *
   * @param scenario the scenario for which injects are generated
   * @param input the input containing details for inject generation, such as attack pattern IDs,
   *     asset IDs, asset group IDs, and the number of injects per TTP
   * @return a list of generated injects
   */
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
              try {
                List<Inject> injectsToAdd =
                    this.generateInjectsByTTP(
                        attackPatternId, endpoints, assetGroups, input.getInjectByTTPNumber());
                injects.addAll(injectsToAdd);
              } catch (UnprocessableContentException e) {
                throw new UnsupportedOperationException(e);
              }
            });

    for (Inject inject : injects) {
      inject.setScenario(scenario);
    }

    return this.injectRepository.saveAll(injects);
  }

  /**
   * Builds an Inject object based on the provided InjectorContract, title, description and enabled
   *
   * @param injectorContract the InjectorContract associated with the Inject
   * @param title the title of the Inject
   * @param description the description of the Inject
   * @param enabled indicates whether the Inject is enabled or not
   * @return the inject object built
   */
  private Inject buildInject(
      InjectorContract injectorContract, String title, String description, Boolean enabled) {
    Inject inject = new Inject();
    inject.setTitle(title);
    inject.setDescription(description);
    inject.setInjectorContract(injectorContract);
    inject.setDependsDuration(0L);
    inject.setEnabled(enabled);
    inject.setContent(
        InjectorContractContentUtils.getDynamicInjectorContractFieldsForInject(injectorContract));
    return inject;
  }

  /**
   * Builds a technical Inject object from the provided InjectorContract and AttackPattern.
   *
   * @param injectorContract the InjectorContract to build the Inject from
   * @param attackPattern the AttackPattern associated with the Inject
   * @return the built Inject object
   */
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

  /**
   * Builds a manual Inject object - also called Placeholder.
   *
   * @param attackPattern the AttackPattern to specify in the title and description of the Inject
   * @param platform the platform to specify in the title and description of the Inject
   * @param architecture the architecture to specify in the title and description of the Inject
   * @return the built manual Inject object
   */
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
   * Get all platform-architecture pairs that are supported by the system.
   *
   * @return a list of all platform-architecture pairs
   */
  @NotNull
  private List<String> getAllPlatform() {
    List<String> allPlatformArchitecturePairs = new ArrayList<>();
    allPlatformArchitecturePairs.add(Endpoint.PLATFORM_TYPE.Linux.name());
    allPlatformArchitecturePairs.add(Endpoint.PLATFORM_TYPE.MacOS.name());
    allPlatformArchitecturePairs.add(Endpoint.PLATFORM_TYPE.Windows.name());
    return allPlatformArchitecturePairs;
  }

  /**
   * Groups endpoints by their platform and architecture.
   *
   * @param endpoints the list of endpoints to group
   * @return a map where the key is a string combining platform and architecture, and the value is a
   *     list of endpoints that match that platform-architecture pair
   */
  private Map<String, List<Endpoint>> groupEndpointsByPlatformAndArchitecture(
      List<Endpoint> endpoints) {
    if(endpoints.isEmpty()) return Map.of("Windows:x86_64", Collections.emptyList(), "Linux:x86_64", Collections.emptyList());

    return endpoints.stream()
        .collect(
            Collectors.groupingBy(endpoint -> endpoint.getPlatform() + ":" + endpoint.getArch()));
  }

  private record ContractResultForEndpoints(
      Map<InjectorContract, List<Endpoint>> contractEndpointsMap,
      Map<String, List<Endpoint>> manualEndpoints) {}

  /**
   * Get the injector contract for assets and TTP.
   *
   * @param attackPattern the attack pattern for which the injector contract need to match
   * @param injectNumberByTTP the maximum number of injector contracts to return
   * @param endpoints the list of endpoints to consider for the injector contract
   * @return a ContractResultForEndpoints containing the matched injector contracts with their
   *     endpoints, and the map of platform architecture pairs with the endpoints for those that
   *     didn't find injectorContract
   */
  private ContractResultForEndpoints getInjectorContractForAssetsAndTTP(
      AttackPattern attackPattern, Integer injectNumberByTTP, List<Endpoint> endpoints) {
    Map<InjectorContract, List<Endpoint>> contractEndpointsMap = new HashMap<>();
    Map<String, List<Endpoint>> manualEndpoints = new HashMap<>();

    // Group endpoints by platform:architecture
    Map<String, List<Endpoint>> groupedAssets =
        this.groupEndpointsByPlatformAndArchitecture(endpoints);

    // Try to find injectors contract covering all platform-architecture pairs at once
    List<InjectorContract> injectorContracts =
        this.injectorContractRepositoryHelper.searchInjectorContractsByAttackPatternAndEnvironment(
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
                this.injectorContractRepositoryHelper
                    .searchInjectorContractsByAttackPatternAndEnvironment(
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

  /**
   * Finds injector contracts based on the provided list of already found injector contracts,
   *
   * @param knownInjectorContracts the list of known injector contracts to search from
   * @param platformArchitecturePairs the list of platform-architecture pairs to filter the
   *     contracts
   * @param injectNumberByTTP the maximum number of injector contracts to return
   * @return a list of InjectorContract objects that match the search criteria
   */
  private List<InjectorContract> findInjectorContracts(
      List<InjectorContract> knownInjectorContracts,
      List<String> platformArchitecturePairs,
      Integer injectNumberByTTP) {
    if (knownInjectorContracts == null
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
        architectures.size() == 1
            ? architectures.iterator().next()
            : Payload.PAYLOAD_EXECUTION_ARCH.ALL_ARCHITECTURES.name();

    return knownInjectorContracts.stream()
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

  /**
   * Finds or searches in Database for injector contracts based on the provided parameters.
   *
   * @param knownInjectorContracts the list of known injector contracts to search from
   * @param attackPattern the attack pattern to match against the injector contracts
   * @param platformArchitecturePairs the list of platform-architecture pairs to filter the
   *     contracts
   * @param injectNumberByTTP the maximum number of injector contracts to return
   * @return a list of InjectorContract objects that match the search criteria
   */
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
    return this.injectorContractRepositoryHelper
        .searchInjectorContractsByAttackPatternAndEnvironment(
            attackPattern.getExternalId(), platformArchitecturePairs, injectNumberByTTP);
  }

  private record ContractResultForAssetGroup(
      List<InjectorContract> injectorContracts, String unmatchedPlatformArchitecture) {}

  /**
   * Get the injector contracts for a specific asset group and TTP
   *
   * @param assetGroup the asset group for which the injector contracts need to be found
   * @param attackPattern the attack pattern for which the injector contracts need to match
   * @param injectNumberByTTP the maximum number of injector contracts to return
   * @param knownInjectorContracts the list of already found injector contracts to search from
   * @return a ContractResultForAssetGroup containing the injector contracts that successfully
   *     matched for the asset group. and the most common platform-architecture pairs within the
   *     asset group for which no matching injector contract was found.
   */
  private ContractResultForAssetGroup getInjectorContractsForAssetGroupAndTTP(
      AssetGroup assetGroup,
      AttackPattern attackPattern,
      Integer injectNumberByTTP,
      List<InjectorContract> knownInjectorContracts) {
    String unmatchedPlatformArchitecture = "";

    // Retrieve and group all endpoints in the asset group by platform:architecture
    List<Endpoint> assetsFromGroup =
        this.assetGroupService.assetsFromAssetGroup(assetGroup.getId()).stream()
            .map(Endpoint.class::cast)
            .toList();
    if (assetsFromGroup.isEmpty()) {
      // No endpoints in the asset group, return empty result
      return new ContractResultForAssetGroup(Collections.emptyList(), "");
    }
    Map<String, List<Endpoint>> groupedAssets =
        this.groupEndpointsByPlatformAndArchitecture(assetsFromGroup);

    // Try to find an existing injectorsContract that cover all platform:architecture pairs from
    // this group at once
    List<InjectorContract> injectorContracts =
        findOrSearchInjectorContract(
            knownInjectorContracts,
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
            knownInjectorContracts,
            attackPattern,
            List.of(mostCommonPlatformArch),
            injectNumberByTTP);
    if (injectorContractsForGroup.isEmpty()) {
      unmatchedPlatformArchitecture = mostCommonPlatformArch;
    }
    return new ContractResultForAssetGroup(injectorContracts, unmatchedPlatformArchitecture);
  }

  /**
   * Handles the endpoints, search injector contract then create or update injects
   *
   * @param endpoints the list of endpoints to process
   * @param attackPattern the attack pattern for which the injects are created
   * @param injectNumberByTTP the maximum number of injects to create for each TTP
   * @param contractInjectMap a map to store the injector contracts and their corresponding injects
   * @param manualInjectMap a map to store manual injects based on platform-architecture pairs
   * @param knownInjectorContracts the list of already known injector contracts
   */
  private void handleEndpoints(
      List<Endpoint> endpoints,
      AttackPattern attackPattern,
      Integer injectNumberByTTP,
      Map<InjectorContract, Inject> contractInjectMap,
      Map<String, Inject> manualInjectMap,
      List<InjectorContract> knownInjectorContracts) {
//    if (endpoints.isEmpty()) {
//      return;
//    }
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

  /**
   * Handles the asset groups, search injector contract then create or update injects
   *
   * @param assetGroups the list of asset groups to process
   * @param attackPattern the attack pattern for which the injects are created
   * @param injectNumberByTTP the maximum number of injects to create for each TTP
   * @param contractInjectMap a map to store the injector contracts and their corresponding injects
   * @param manualInjectMap a map to store manual injects based on platform-architecture pairs
   * @param knownInjectorContracts the list of already known injector contracts
   */
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

  /**
   * Generates injects based on the provided attack pattern ID, endpoints, asset groups, and the
   * number of injects to create for each TTP.
   *
   * @param attackPatternId the ID of the attack pattern to generate injects for
   * @param endpoints the list of endpoints to consider for the injects
   * @param assetGroups the list of asset groups to consider for the injects
   * @param injectNumberByTTP the maximum number of injects to create for each TTP
   * @return a list of generated injects
   */
  private List<Inject> generateInjectsByTTP(
      String attackPatternId,
      List<Endpoint> endpoints,
      List<AssetGroup> assetGroups,
      Integer injectNumberByTTP)
      throws UnprocessableContentException {
    // Check if attack pattern exist
    AttackPattern attackPattern =
        this.attackPatternRepository
            .findById(attackPatternId)
            .orElseThrow(() -> new ElementNotFoundException("Attack pattern not found"));

    // Try to find injector contract covering all platform-architecture pairs at once
    List<String> allPlatformArchitecturePairs = getAllPlatform();
    List<InjectorContract> injectorContracts =
        this.injectorContractRepositoryHelper.searchInjectorContractsByAttackPatternAndEnvironment(
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

    List<Inject> injects =
        Stream.concat(contractInjectMap.values().stream(), manualInjectMap.values().stream())
            .toList();
    if (injects.isEmpty()) {
      throw new UnprocessableContentException("No target found");
    }
    return injects;
  }
}
