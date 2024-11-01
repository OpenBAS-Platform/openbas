package io.openbas.service;

import static java.time.Instant.now;

import io.openbas.database.model.*;
import io.openbas.database.repository.DryInjectRepository;
import io.openbas.database.repository.DryRunRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.specification.InjectSpecification;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

@Service
public class DryrunService {

  private static final int SPEED_DRYRUN = 100; // 100x faster.

  private DryRunRepository dryRunRepository;
  private InjectRepository injectRepository;
  private DryInjectRepository dryInjectRepository;

  @Autowired
  public void setInjectRepository(InjectRepository injectRepository) {
    this.injectRepository = injectRepository;
  }

  @Autowired
  public void setDryRunRepository(DryRunRepository dryRunRepository) {
    this.dryRunRepository = dryRunRepository;
  }

  @Autowired
  public void setDryInjectRepository(DryInjectRepository dryInjectRepository) {
    this.dryInjectRepository = dryInjectRepository;
  }

  private List<? extends DryInject> toDryInjects(List<Inject> injects, Dryrun dryrun) {
    return injects.stream().map(inject -> inject.toDryInject(dryrun)).toList();
  }

  private Dryrun createDryRun(Exercise exercise, List<User> users, String name) {
    Dryrun run = new Dryrun();
    run.setName(name);
    run.setSpeed(SPEED_DRYRUN);
    run.setExercise(exercise);
    run.setDate(now());
    run.setUsers(users);
    return dryRunRepository.save(run);
  }

  @Transactional(rollbackOn = Exception.class)
  public Dryrun provisionDryrun(Exercise exercise, List<User> users, String name) {
    Specification<Inject> injectFilters = InjectSpecification.forDryrun(exercise.getId());
    List<Inject> injects = injectRepository.findAll(injectFilters);
    Assert.isTrue(!injects.isEmpty(), "Cant create dryrun without injects");
    Dryrun dryrun = createDryRun(exercise, users, name);
    List<? extends DryInject> dryInjects = toDryInjects(injects, dryrun);
    dryInjectRepository.saveAll(dryInjects);
    return dryrun;
  }
  // endregion
}
