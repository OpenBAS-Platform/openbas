package io.openex.helper;

import io.openex.database.model.Audience;
import io.openex.database.model.Exercise;
import io.openex.database.model.Injection;
import io.openex.database.model.User;
import io.openex.database.repository.*;
import io.openex.database.specification.DryInjectSpecification;
import io.openex.database.specification.InjectSpecification;
import io.openex.model.ExecutableInject;
import io.openex.model.UserInjectContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Stream.concat;

@Component
public class InjectHelper<T> {

    private InjectRepository<T> injectRepository;
    private DryInjectRepository<T> dryInjectRepository;
    private AudienceRepository audienceRepository;
    private InjectReportingRepository<T> injectReportingRepository;
    private DryInjectReportingRepository<T> dryInjectReportingRepository;

    @Autowired
    public void setInjectReportingRepository(InjectReportingRepository<T> injectReportingRepository) {
        this.injectReportingRepository = injectReportingRepository;
    }

    @Autowired
    public void setDryInjectReportingRepository(DryInjectReportingRepository<T> dryInjectReportingRepository) {
        this.dryInjectReportingRepository = dryInjectReportingRepository;
    }

    @Autowired
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    @Autowired
    public void setInjectRepository(InjectRepository<T> injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setDryInjectRepository(DryInjectRepository<T> dryInjectRepository) {
        this.dryInjectRepository = dryInjectRepository;
    }

    public List<UserInjectContext> buildUsersFromInject(Injection<T> inject) {
        Exercise exercise = inject.getExercise();
        // Create stream from inject audiences
        Iterable<Audience> audiences = inject.isGlobalInject() ? audienceRepository.findAll() : inject.getAudiences();
        Stream<UserInjectContext> injectUserStream = StreamSupport.stream(audiences.spliterator(), false)
                .flatMap(audience -> audience.getUsers().stream()
                        .map(user -> new UserInjectContext(user, exercise, audience.getName())));
        // Create stream from animation group
        List<User> animationUsers = exercise.getObservers();
        Stream<UserInjectContext> animationUserStream = animationUsers.stream()
                .map(user -> new UserInjectContext(user, exercise, "Animation Group"));
        // Build result
        Stream<UserInjectContext> usersStream = concat(injectUserStream, animationUserStream);
        return usersStream
                .collect(groupingBy(UserInjectContext::getUser)).entrySet().stream()
                .map(entry -> new UserInjectContext(entry.getKey(), exercise,
                        entry.getValue().stream().flatMap(ua -> ua.getAudiences().stream()).toList()))
                .toList();
    }

    private boolean isInInjectableRange(Injection<?> injection) {
        Instant now = Instant.now();
        Instant start = now.minus(Duration.parse("PT1H"));
        Instant injectWhen = injection.getDate().toInstant();
        return injectWhen.isAfter(start) && injectWhen.isBefore(now);
    }

    @Transactional
    public List<ExecutableInject<T>> getInjectsToRun() {
        // region injects
        Stream<ExecutableInject<T>> injects = injectRepository.findAll(InjectSpecification.executable()).stream()
                .map(i -> i.setStatusRepository(injectReportingRepository))
                .filter(this::isInInjectableRange)
                .map(inject -> new ExecutableInject<>(inject, buildUsersFromInject(inject)));
        // endregion
        // region dry injects
        Stream<ExecutableInject<T>> dryInjects = dryInjectRepository.findAll(DryInjectSpecification.executable()).stream()
                .map(i -> i.setStatusRepository(dryInjectReportingRepository))
                .filter(this::isInInjectableRange)
                .map(inject -> new ExecutableInject<>(inject, buildUsersFromInject(inject)));
        // endregion
        return concat(injects, dryInjects).collect(Collectors.toList());
    }


}
