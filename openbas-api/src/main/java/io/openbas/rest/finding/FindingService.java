package io.openbas.rest.finding;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injector_contract.outputs.ContractOutputUtils.getContractOutputs;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.AssetRepository;
import io.openbas.database.repository.FindingRepository;
import io.openbas.database.repository.TeamRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.injector_contract.outputs.ContractOutputElement;
import io.openbas.injector_contract.outputs.ContractOutputUtils;
import io.openbas.rest.inject.service.InjectService;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FindingService {

  private final FindingUtils findingUtils;
  private final InjectService injectService;

  private final FindingRepository findingRepository;
  private final AssetRepository assetRepository;
  private final TeamRepository teamRepository;
  private final UserRepository userRepository;

  @Resource private ObjectMapper mapper;

  // -- CRUD --

  public List<Finding> findings() {
    return fromIterable(this.findingRepository.findAll());
  }

  public Finding finding(@NotNull final String id) {
    return this.findingRepository
        .findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Finding not found with id: " + id));
  }

  public Finding createFinding(@NotNull final Finding finding, @NotBlank final String injectId) {
    Inject inject = this.injectService.inject(injectId);
    finding.setInject(inject);
    return this.findingRepository.save(finding);
  }

  public Iterable<Finding> createFindings(
      @NotNull final List<Finding> findings, @NotBlank final String injectId) {
    Inject inject = this.injectService.inject(injectId);
    findings.forEach((finding) -> finding.setInject(inject));
    return this.findingRepository.saveAll(findings);
  }

  public Finding updateFinding(@NotNull final Finding finding, @NotNull final String injectId) {
    if (!finding.getInject().getId().equals(injectId)) {
      throw new IllegalArgumentException("Inject id cannot be changed: " + injectId);
    }
    return this.findingRepository.save(finding);
  }

  public void deleteFinding(@NotNull final String id) {
    if (!this.findingRepository.existsById(id)) {
      throw new EntityNotFoundException("Finding not found with id: " + id);
    }
    this.findingRepository.deleteById(id);
  }

  // -- Extract findings from strctured output : Here we compute the findings from structured output
  // from ExecutionInjectInput sent by injectors
  // This structured output is generated based on injectorcontract where we can find the node
  // Outputs and with that the injector generate this structure output--

  public void extractFindingsFromInjectorContract(Inject inject, ObjectNode structuredOutput) {
    // NOTE: do it in every call to callback ? (reflexion on implant mechanism)
    List<Finding> findings = new ArrayList<>();
    // Get the contract
    InjectorContract injectorContract = inject.getInjectorContract().orElseThrow();
    List<ContractOutputElement> contractOutputs =
        getContractOutputs(injectorContract.getConvertedContent(), mapper);
    if (!contractOutputs.isEmpty()) {
      contractOutputs.forEach(
          contractOutput -> {
            if (contractOutput.isFindingCompatible()) {
              if (contractOutput.isMultiple()) {
                JsonNode jsonNodes = structuredOutput.get(contractOutput.getField());
                if (jsonNodes != null && jsonNodes.isArray()) {
                  for (JsonNode jsonNode : jsonNodes) {
                    if (!contractOutput.getType().validate.apply(jsonNode)) {
                      throw new IllegalArgumentException("Finding not correctly formatted");
                    }
                    Finding finding = ContractOutputUtils.createFinding(contractOutput);
                    finding.setValue(contractOutput.getType().toFindingValue.apply(jsonNode));
                    Finding linkedFinding = linkFindings(contractOutput, jsonNode, finding);
                    findings.add(linkedFinding);
                  }
                }
              } else {
                JsonNode jsonNode = structuredOutput.get(contractOutput.getField());
                if (!contractOutput.getType().validate.apply(jsonNode)) {
                  throw new IllegalArgumentException("Finding not correctly formatted");
                }
                Finding finding = ContractOutputUtils.createFinding(contractOutput);
                finding.setValue(contractOutput.getType().toFindingValue.apply(jsonNode));
                Finding linkedFinding = linkFindings(contractOutput, jsonNode, finding);
                findings.add(linkedFinding);
              }
            }
          });
    }
    this.createFindings(findings, inject.getId());
  }

  private Finding linkFindings(
      ContractOutputElement contractOutput, JsonNode jsonNode, Finding finding) {
    // Create links with assets
    if (contractOutput.getType().toFindingAssets != null) {
      List<String> assetsIds = contractOutput.getType().toFindingAssets.apply(jsonNode);
      List<Optional<Asset>> assets =
          assetsIds.stream().map(this.assetRepository::findById).toList();
      if (!assets.isEmpty()) {
        finding.setAssets(assets.stream().filter(Optional::isPresent).map(Optional::get).toList());
      }
    }
    // Create links with teams
    if (contractOutput.getType().toFindingTeams != null) {
      List<String> teamsIds = contractOutput.getType().toFindingTeams.apply(jsonNode);
      List<Optional<Team>> teams = teamsIds.stream().map(this.teamRepository::findById).toList();
      if (!teams.isEmpty()) {
        finding.setTeams(teams.stream().filter(Optional::isPresent).map(Optional::get).toList());
      }
    }
    // Create links with users
    if (contractOutput.getType().toFindingUsers != null) {
      List<String> usersIds = contractOutput.getType().toFindingUsers.apply(jsonNode);
      List<Optional<User>> users = usersIds.stream().map(this.userRepository::findById).toList();
      if (!users.isEmpty()) {
        finding.setUsers(users.stream().filter(Optional::isPresent).map(Optional::get).toList());
      }
    }
    return finding;
  }

  /** Extracts findings from structured output that was generated using output parsers. */
  public void extractFindingsFromOutputParsers(
      Inject inject, Agent agent, Set<OutputParser> outputParsers, JsonNode structuredOutput) {

    outputParsers.forEach(
        outputParser -> {
          outputParser
              .getContractOutputElements()
              .forEach(
                  contractOutputElement -> {
                    if (contractOutputElement.isFinding()) {
                      JsonNode jsonNodes = structuredOutput.get(contractOutputElement.getKey());
                      if (jsonNodes != null && jsonNodes.isArray()) {
                        for (JsonNode jsonNode : jsonNodes) {
                          // Validate finding format
                          if (!contractOutputElement.getType().validate.apply(jsonNode)) {
                            throw new IllegalArgumentException("Finding not correctly formatted");
                          }
                          // Build and save the finding
                          findingUtils.buildFinding(
                              inject,
                              agent.getAsset(),
                              contractOutputElement,
                              contractOutputElement.getType().toFindingValue.apply(jsonNode));
                        }
                      }
                    }
                  });
        });
  }
}
