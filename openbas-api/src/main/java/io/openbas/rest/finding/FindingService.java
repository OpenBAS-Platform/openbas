package io.openbas.rest.finding;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.rest.finding.FindingUtils.extractRawOutputByMode;

import io.openbas.database.model.*;
import io.openbas.database.repository.FindingRepository;
import io.openbas.rest.inject.service.InjectService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotBlank;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class FindingService {

  private final FindingRepository findingRepository;
  private final InjectService injectService;

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

  public void extractFindings(Inject inject, Asset asset, ExecutionTraces trace) {
    List<Finding> findings = new ArrayList<>();
    Map<String, Pattern> patternCache = new HashMap<>(); // Cache for compiled patterns

    Optional.ofNullable(inject.getPayload())
        .map(p -> p.get().getOutputParsers())
        .ifPresent(
            outputParsers ->
                outputParsers.forEach(
                    outputParser -> {
                      String rawOutputByMode =
                          extractRawOutputByMode(trace.getMessage(), outputParser.getMode());
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
}
