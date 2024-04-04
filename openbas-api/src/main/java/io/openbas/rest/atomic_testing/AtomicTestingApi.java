package io.openbas.rest.atomic_testing;

import io.openbas.database.model.InjectStatus;
import io.openbas.rest.atomic_testing.form.AtomicTestingMapper;
import io.openbas.rest.atomic_testing.form.AtomicTestingOutput;
import io.openbas.rest.atomic_testing.form.AtomicTestingSimpleInput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.InjectService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/atomic_testings")
public class AtomicTestingApi extends RestBehavior {

  private InjectService injectService;

  @Autowired
  public void setInjectService(InjectService injectService) {
    this.injectService = injectService;
  }

  @GetMapping()
  public List<AtomicTestingOutput> findAllAtomicTestings() {
    return AtomicTestingMapper.toDto(injectService.findAllAtomicTestings());
  }

  @GetMapping("/{injectId}")
  public AtomicTestingOutput findAtomicTesting(@PathVariable String injectId) {
    return injectService.findById(injectId).map(AtomicTestingMapper::toDto).orElseThrow();
  }

  @GetMapping("/try/{injectId}")
  public InjectStatus tryAtomicTesting(@PathVariable String injectId) {
    return injectService.tryAtomicTesting(injectId);
  }

  @PutMapping("/{injectId}")
  public AtomicTestingOutput updateScenario(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingSimpleInput input) {
    return null;
  }

}
