package io.openbas.rest.finding;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injector_contract.outputs.ContractOutputUtils.getContractOutputs;
import static io.openbas.rest.finding.FindingUtils.extractRawOutputByMode;
import static io.openbas.utils.StatusUtils.convertExecutionAction;

import com.fasterxml.jackson.core.JsonProcessingException;
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
import io.openbas.rest.inject.form.InjectExecutionInput;
import io.openbas.rest.inject.service.InjectService;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotBlank;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Log
@Service
@RequiredArgsConstructor
@Transactional
public class FindingService {

  private final FindingRepository findingRepository;
  private final InjectService injectService;
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

  // -- EXTRACTION FINDINGS --
  public void extractFindingsFromRawOutput(InjectExecutionInput input, Inject inject, Agent agent) {
    if (ExecutionTraceAction.EXECUTION.equals(convertExecutionAction(input.getAction()))) {
      inject
          .getPayload()
          .ifPresent(
              payload -> {
                if (payload.getOutputParsers() != null && !payload.getOutputParsers().isEmpty()) {
                  extractFindings(inject, agent.getAsset(), input.getMessage());
                } else {
                  log.info(
                      "No output parsers available for payload used in inject:" + inject.getId());
                }
              });
    }
  }

  public void extractFindingsFromStructuredOutput(InjectExecutionInput input, Inject inject) {
    // NOTE: do it in every call to callback ? (reflexion on implant mechanism)
    if (input.getOutputStructured() != null) {
      try {
        List<Finding> findings = new ArrayList<>();
        // Get the contract
        InjectorContract injectorContract = inject.getInjectorContract().orElseThrow();
        List<ContractOutputElement> contractOutputs =
            getContractOutputs(injectorContract.getConvertedContent(), mapper);
        ObjectNode values = mapper.readValue(input.getOutputStructured(), ObjectNode.class);
        if (!contractOutputs.isEmpty()) {
          contractOutputs.forEach(
              contractOutput -> {
                if (contractOutput.isFindingCompatible()) {
                  if (contractOutput.isMultiple()) {
                    JsonNode jsonNodes = values.get(contractOutput.getField());
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
                    JsonNode jsonNode = values.get(contractOutput.getField());
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
      } catch (JsonProcessingException e) {
        throw new RuntimeException(e);
      }
    }
  }

  private void extractFindings(Inject inject, Asset asset, String trace) {
    List<Finding> findings = new ArrayList<>();
    Map<String, Pattern> patternCache = new HashMap<>(); // Cache for compiled patterns

    Optional.ofNullable(inject.getPayload())
        .map(p -> p.get().getOutputParsers())
        .ifPresent(
            outputParsers ->
                outputParsers.forEach(
                    outputParser -> {
                      String rawOutputByMode =
                          extractRawOutputByMode(trace, outputParser.getMode());
                      if (rawOutputByMode == null) {
                        return;
                      }
                      switch (outputParser.getType()) {
                        case REGEX:
                        default:
                          outputParser
                              .getContractOutputElements()
                              .forEach(
                                  contractOutputElement -> {
                                    String regex = contractOutputElement.getRule();
                                    Pattern pattern =
                                        patternCache.computeIfAbsent(regex, Pattern::compile);
                                    Matcher matcher = pattern.matcher(rawOutputByMode);

                                    while (matcher.find()) {
                                      StringBuilder value = new StringBuilder();

                                      for (ContractOutputField field :
                                          contractOutputElement.getType().fields) {
                                        String[] indexes =
                                            contractOutputElement.getRegexGroups().stream()
                                                .filter(
                                                    regexGroup ->
                                                        field
                                                            .getKey()
                                                            .equals(regexGroup.getField()))
                                                .map(RegexGroup::getIndexValues)
                                                .map(values -> values.split("\\$"))
                                                .flatMap(Arrays::stream)
                                                .filter(s -> !s.isEmpty())
                                                .toArray(String[]::new);

                                        for (String index : indexes) {
                                          try {
                                            int groupIndex = Integer.parseInt(index);
                                            value.append(matcher.group(groupIndex)).append(" ");
                                          } catch (NumberFormatException
                                              | IllegalStateException e) {
                                            System.err.println(
                                                "Invalid regex group index: " + index);
                                          }
                                        }
                                      }

                                      String finalValue = value.toString().trim();

                                      Optional<Finding> optionalFinding =
                                          findingRepository.findByInjectIdAndValue(
                                              inject.getId(), finalValue);

                                      Finding finding =
                                          optionalFinding.orElseGet(
                                              () -> {
                                                Finding newFinding = new Finding();
                                                newFinding.setInject(inject);
                                                newFinding.setField(contractOutputElement.getKey());
                                                newFinding.setType(contractOutputElement.getType());
                                                newFinding.setValue(finalValue);
                                                newFinding.setTags(
                                                    new HashSet<>(contractOutputElement.getTags()));
                                                return newFinding;
                                              });

                                      finding.getAssets().add(asset);

                                      if (!optionalFinding.isPresent()) {
                                        findings.add(finding);
                                      }
                                    }
                                  });
                          break;
                      }
                    }));

    findingRepository.saveAll(findings);
  }

  public Finding linkFindings(
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
}
