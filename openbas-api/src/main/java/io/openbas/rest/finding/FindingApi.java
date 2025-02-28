package io.openbas.rest.finding;

import io.openbas.database.model.Finding;
import io.openbas.rest.finding.form.FindingInput;
import io.openbas.rest.helper.RestBehavior;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/findings")
@RequiredArgsConstructor
public class FindingApi extends RestBehavior {

  private final FindingService findingService;

  // -- CRUD --

  @GetMapping
  public ResponseEntity<List<Finding>> findings() {
    return ResponseEntity.ok(this.findingService.findings());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Finding> finding(@PathVariable @NotNull final String id) {
    return ResponseEntity.ok(this.findingService.finding(id));
  }

  @GetMapping("/field/{field}")
  public ResponseEntity<Finding> findingByField(@PathVariable @NotBlank final String field) {
    return ResponseEntity.ok(this.findingService.findingByField(field));
  }

  @PostMapping
  public ResponseEntity<Finding> createFinding(
      @RequestBody @Valid @NotNull final FindingInput input) {
    return ResponseEntity.ok(
        this.findingService.createFinding(input.toFinding(new Finding()), input.getInjectId()));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Finding> updateFinding(
      @PathVariable @NotNull final String id,
      @RequestBody @Valid @NotNull final FindingInput input) {
    Finding existingFinding = this.findingService.finding(id);
    Finding updatedFinding = input.toFinding(existingFinding);
    return ResponseEntity.ok(
        this.findingService.updateFinding(updatedFinding, input.getInjectId()));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteFinding(@PathVariable @NotNull final String id) {
    this.findingService.deleteFinding(id);
    return ResponseEntity.noContent().build();
  }
}
