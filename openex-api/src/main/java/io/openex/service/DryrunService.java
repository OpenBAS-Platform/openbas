package io.openex.service;

import io.openex.database.model.*;
import io.openex.database.repository.DryInjectRepository;
import io.openex.database.repository.DryRunRepository;
import io.openex.database.repository.InjectRepository;
import io.openex.database.specification.InjectSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import javax.transaction.Transactional;
import java.util.List;

import static java.time.Instant.now;

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
        return injects.stream()
                .map(inject -> inject.toDryInject(dryrun))
                .toList();
    }

    private Dryrun createDryRun(Exercise exercise, List<User> users) {
        Dryrun run = new Dryrun();
        run.setSpeed(SPEED_DRYRUN);
        run.setExercise(exercise);
        run.setDate(now());
        run.setUsers(users);
        return dryRunRepository.save(run);
    }

    @Transactional(rollbackOn = Exception.class)
    public Dryrun provisionDryrun(Exercise exercise, List<User> users) {
        Specification<Inject> injectFilters = InjectSpecification.forDryrun(exercise.getId());
        List<Inject> injects = injectRepository.findAll(injectFilters);
        Assert.isTrue(injects.size() > 0, "Cant create dryrun without injects");
        Dryrun dryrun = createDryRun(exercise, users);
        List<? extends DryInject> dryInjects = toDryInjects(injects, dryrun);
        dryInjectRepository.saveAll(dryInjects);
        return dryrun;
    }
    // endregion
}
