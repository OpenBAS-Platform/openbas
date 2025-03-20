package io.openbas.rest.finding;

import static io.openbas.helper.StreamHelper.fromIterable;

import io.openbas.database.model.Finding;
import io.openbas.database.model.Inject;
import io.openbas.database.repository.FindingRepository;
import io.openbas.rest.inject.service.InjectService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
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

  public void extractFindings(final Inject inject) {
    OutputParser outputParser = inject.getPayload().get().getOutputParser();
    String rawOutput =
        inject.getStatus().get().getTraces().stream()
            .filter(trace -> trace.getStatus().equals(ExecutionTraceStatus.SUCCESS))
            .map(trace -> trace.getMessage())
            .toString(); // Extract stdout

    // Executor parser
    switch (outputParser.getMode()) {
      case "REGEX":
        Pattern pattern = Pattern.compile(outputParser.getRule());
        Matcher matcher = pattern.matcher(rawOutput);
        /** group 1 -> outputContractElement group 1 */
        break;
      default:
        break;
    }

    // findingRepository.saveAll();
  }
}
