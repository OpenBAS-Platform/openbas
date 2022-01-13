package io.openex.service;

import io.openex.database.model.DryInject;
import io.openex.database.model.Dryrun;
import io.openex.database.model.Exercise;
import io.openex.database.model.Inject;
import io.openex.database.repository.DryInjectRepository;
import io.openex.database.repository.DryRunRepository;
import io.openex.database.repository.InjectRepository;
import io.openex.database.specification.InjectSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import javax.transaction.Transactional;
import java.util.List;

import static java.time.Instant.now;

@Component
public class DryrunService<T> {

    private static final int SPEED_DRYRUN = 100; // 100x faster.

    private DryRunRepository dryRunRepository;
    private InjectRepository<T> injectRepository;
    private DryInjectRepository<T> dryInjectRepository;

    @Autowired
    public void setInjectRepository(InjectRepository<T> injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setDryRunRepository(DryRunRepository dryRunRepository) {
        this.dryRunRepository = dryRunRepository;
    }

    @Autowired
    public void setDryInjectRepository(DryInjectRepository<T> dryInjectRepository) {
        this.dryInjectRepository = dryInjectRepository;
    }

    private List<? extends DryInject<T>> toDryInjects(List<Inject<T>> injects, Dryrun dryrun) {
        return injects.stream()
                .map(inject -> inject.toDryInject(dryrun))
                .toList();
    }

    private Dryrun createDryRun(Exercise exercise) {
        Dryrun run = new Dryrun();
        run.setSpeed(SPEED_DRYRUN);
        run.setExercise(exercise);
        run.setDate(now());
        return dryRunRepository.save(run);
    }

    @Transactional
    public Dryrun provisionDryrun(Exercise exercise) {
        Specification<Inject<T>> injectFilters = InjectSpecification.forDryrun(exercise.getId());
        List<Inject<T>> injects = injectRepository.findAll(injectFilters);
        Assert.isTrue(injects.size() > 0, "Cant create dryrun without injects");
        Dryrun dryrun = createDryRun(exercise);
        List<? extends DryInject<T>> dryInjects = toDryInjects(injects, dryrun);
        dryInjectRepository.saveAll(dryInjects);
        return dryrun;
    }
    // endregion
}
