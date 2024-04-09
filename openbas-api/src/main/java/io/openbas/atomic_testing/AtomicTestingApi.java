package io.openbas.atomic_testing;

import io.openbas.atomic_testing.form.AtomicTestingDetailOutput;
import io.openbas.atomic_testing.form.AtomicTestingInput;
import io.openbas.atomic_testing.form.AtomicTestingMapper;
import io.openbas.atomic_testing.form.AtomicTestingOutput;
import io.openbas.atomic_testing.form.SimpleExpectationResultOutput;
import io.openbas.database.model.InjectStatus;
import io.openbas.injectExpectation.InjectExpectationService;
import io.openbas.rest.helper.RestBehavior;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/atomic_testings")
public class AtomicTestingApi extends RestBehavior {

  private AtomicTestingService atomicTestingService;
  private InjectExpectationService injectExpectationService;

  @Autowired
  public void setAtomicTestingService(AtomicTestingService atomicTestingService) {
    this.atomicTestingService = atomicTestingService;
  }

  @Autowired
  public void setInjectExpectationService(InjectExpectationService injectExpectationService) {
    this.injectExpectationService = injectExpectationService;
  }

  @GetMapping()
  public List<AtomicTestingOutput> findAllAtomicTestings() {
    return AtomicTestingMapper.toDto(atomicTestingService.findAllAtomicTestings());
  }

  @GetMapping("/{injectId}")
  public AtomicTestingOutput findAtomicTesting(@PathVariable String injectId) {
    return atomicTestingService.findById(injectId).map(AtomicTestingMapper::toDto).orElseThrow();
  }

  @GetMapping("/{injectId}/detail")
  public AtomicTestingDetailOutput findAtomicTestingWithDetail(@PathVariable String injectId) {
    return atomicTestingService.findById(injectId).map(AtomicTestingMapper::toDetailDto).orElseThrow();
  }

  @PostMapping()
  public AtomicTestingOutput createAtomicTesting(@Valid @RequestBody AtomicTestingInput input) {
    return AtomicTestingMapper.toDto(atomicTestingService.createOrUpdate(input));
  }

  @PutMapping("/{injectId}")
  public AtomicTestingOutput updateAtomicTesting(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingInput input) {
    return null; //todo
  }

  @DeleteMapping("/{injectId}")
  public void deleteAtomicTesting(
      @PathVariable @NotBlank final String injectId) {
    atomicTestingService.deleteAtomicTesting(injectId);
  }

  @GetMapping("/try/{injectId}")
  public InjectStatus tryAtomicTesting(@PathVariable String injectId) {
    return atomicTestingService.tryInject(injectId);
  }

  @GetMapping("/target_results/{targetId}")
  public List<SimpleExpectationResultOutput> findTargetResult(@PathVariable String targetId,
      @RequestParam String injectId, @RequestParam String targetType) {
    return AtomicTestingMapper.toTargetResultDto(
        injectExpectationService.findExpectationsByInjectAndTarget(injectId, targetId, targetType), targetId);
  }

}
