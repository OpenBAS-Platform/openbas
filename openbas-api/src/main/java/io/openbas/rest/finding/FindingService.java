package io.openbas.rest.finding;

import io.openbas.database.model.Inject;
import io.openbas.database.model.Finding;
import io.openbas.database.repository.FindingRepository;
import io.openbas.rest.inject.service.InjectService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static io.openbas.helper.StreamHelper.fromIterable;

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
    return this.findingRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Finding not found with id: " + id));
  }

  public Finding findingByField(@NotNull final String field) {
    return this.findingRepository.findByField(field)
        .orElseThrow(() -> new EntityNotFoundException("Finding not found with field: " + field));
  }

  public Finding createFinding(@NotNull final Finding finding, @NotBlank final String injectId) {
    Inject inject = this.injectService.inject(injectId);
    finding.setInject(inject);
    return this.findingRepository.save(finding);
  }

  public Iterable<Finding> createFindings(@NotNull final List<Finding> findings, @NotBlank final String injectId) {
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

}
