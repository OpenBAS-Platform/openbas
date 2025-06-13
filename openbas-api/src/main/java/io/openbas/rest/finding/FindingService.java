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
import io.openbas.rest.inject.service.InjectService;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
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
  // This structrued output is generated based on injectorcontract where we can find the node
  // Outputs and with that the injector generate this structure output--

  public List<SimpleFinding> extractFindingsFromInjectorContract(
      String injectId, InjectorContract injectorContract, ObjectNode structuredOutput) {
    // NOTE: do it in every call to callback ? (reflexion on implant mechanism)
    List<SimpleFinding> findings = new ArrayList<>();
    // Get the contract
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
                    SimpleFinding finding = new SimpleFinding();
                    finding.setType(contractOutput.getType().toString());
                    finding.setField(contractOutput.getField());
                    finding.setLabels(contractOutput.getLabels());
                    finding.setValue(contractOutput.getType().toFindingValue.apply(jsonNode));
                    linkFindings(contractOutput, jsonNode, finding);
                    findings.add(finding);
                  }
                }
              } else {
                JsonNode jsonNode = structuredOutput.get(contractOutput.getField());
                if (!contractOutput.getType().validate.apply(jsonNode)) {
                  throw new IllegalArgumentException("Finding not correctly formatted");
                }
                SimpleFinding finding = new SimpleFinding();
                finding.setType(contractOutput.getType().toString());
                finding.setField(contractOutput.getField());
                finding.setLabels(contractOutput.getLabels());
                finding.setValue(contractOutput.getType().toFindingValue.apply(jsonNode));
                linkFindings(contractOutput, jsonNode, finding);
                findings.add(finding);
              }
            }
          });
    }
    findings.forEach((finding) -> finding.setInjectId(injectId));
    return findings;
  }

  private void linkFindings(
      ContractOutputElement contractOutput, JsonNode jsonNode, SimpleFinding finding) {
    // Create links with assets
    if (contractOutput.getType().toFindingAssets != null) {
      List<String> assetsIds = contractOutput.getType().toFindingAssets.apply(jsonNode);
      finding.setAssets(assetsIds);
    }
    // Create links with teams
    if (contractOutput.getType().toFindingTeams != null) {
      List<String> teamsIds = contractOutput.getType().toFindingTeams.apply(jsonNode);
      finding.setTeams(teamsIds);
    }
    // Create links with users
    if (contractOutput.getType().toFindingUsers != null) {
      List<String> usersIds = contractOutput.getType().toFindingUsers.apply(jsonNode);
      finding.setUsers(usersIds);
    }
  }

  /** Extracts findings from structured output that was generated using output parsers. */
  public List<SimpleFinding> extractFindingsFromOutputParsers(
      String injectId, String assetId, Set<OutputParser> outputParsers, JsonNode structuredOutput) {

    List<SimpleFinding> results = new ArrayList<>();

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
                          results.add(
                              findingUtils.buildSimplerFinding(
                                  injectId,
                                  assetId,
                                  contractOutputElement,
                                  contractOutputElement.getType().toFindingValue.apply(jsonNode)));
                        }
                      }
                    }
                  });
        });
    return results;
  }
}
