package io.openbas.rest.finding;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.rest.finding.FindingUtils.extractRawOutputByMode;

import io.openbas.database.model.*;
import io.openbas.database.repository.FindingRepository;
import io.openbas.rest.inject.service.InjectService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
                                    Pattern pattern =
                                        Pattern.compile(contractOutputElement.getRule());
                                    Matcher matcher = pattern.matcher(rawOutputByMode);

                                    while (matcher.find()) {
                                      Finding finding = new Finding();
                                      finding.setInject(inject); // Find by inject and value
                                      finding.getAssets().add(asset);
                                      finding.setField(contractOutputElement.getKey());
                                      finding.setType(contractOutputElement.getType());
                                      finding.setValue(matcher.group());

                                      finding.setLabels(
                                          new String[] {contractOutputElement.getName()});

                                      findings.add(finding);
                                    }
                                  });
                          break;
                      }
                    }));

    findingRepository.saveAll(findings);
  }
}
