package io.openex.service;

import io.openex.config.OpenExConfig;
import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.database.specification.InjectSpecification;
import io.openex.model.ExecutableInject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import javax.annotation.Nullable;
import javax.transaction.Transactional;
import java.time.Duration;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Component
public class DryrunService {

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

    private List<? extends DryInject<?>> toDryInjects(List<Inject<?>> injects, Dryrun dryrun, int speed) {
        Date now = new Date();
        return injects.stream().map(inject -> inject.toDryInject(dryrun, now, speed)).toList();
    }

    private Dryrun createDryRun(Exercise exercise, int speed) {
        Dryrun run = new Dryrun();
        run.setSpeed(speed);
        run.setExercise(exercise);
        run.setDate(new Date());
        return dryRunRepository.save(run);
    }

    @Transactional
    public Dryrun provisionDryrun(Exercise exercise, int speed) {
        Specification<Inject<?>> injectFilters = InjectSpecification.notManual()
                .and(InjectSpecification.fromExercise(exercise.getId()))
                .and(InjectSpecification.isEnable());
        List<Inject<?>> injects = injectRepository.findAll(injectFilters);
        Assert.isTrue(injects.size() > 0, "Cant create dryrun without injects");
        Dryrun dryrun = createDryRun(exercise, speed);
        List<? extends DryInject<?>> dryInjects = toDryInjects(injects, dryrun, speed);
        // Create the dryrun and associated injects
        dryInjectRepository.saveAll(dryInjects);
        return dryrun;
    }
    // endregion
}
