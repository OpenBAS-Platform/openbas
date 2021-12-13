package io.openex.helper;

import freemarker.template.Configuration;
import freemarker.template.Template;
import io.openex.database.model.*;
import io.openex.database.repository.AudienceRepository;
import io.openex.database.repository.DryInjectRepository;
import io.openex.database.repository.InjectRepository;
import io.openex.database.specification.DryInjectSpecification;
import io.openex.database.specification.InjectSpecification;
import io.openex.model.ExecutableInject;
import io.openex.model.UserInjectContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import javax.transaction.Transactional;
import java.io.StringReader;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static io.openex.model.ExecutableInject.dryRun;
import static io.openex.model.ExecutableInject.prodRun;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Stream.concat;

@Component
public class InjectHelper<T> {

    private AudienceRepository audienceRepository;
    private InjectRepository<T> injectRepository;
    private DryInjectRepository<T> dryInjectRepository;

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
                .flatMap(audience -> audience.getSubAudiences().stream())
                .flatMap(subAudience -> subAudience.getUsers().stream()
                        .map(user -> new UserInjectContext(exercise, user, subAudience.getName())));
        // Create stream from animation group
        Group animationGroup = exercise.getAnimationGroup();
        List<User> animationUsers = animationGroup != null ? animationGroup.getUsers() : new ArrayList<>();
        Stream<UserInjectContext> animationUserStream = animationUsers.stream()
                .map(user -> new UserInjectContext(exercise, user, "Animation Group"));
        // Build result
        Stream<UserInjectContext> usersStream = concat(injectUserStream, animationUserStream);
        return usersStream
                .collect(groupingBy(UserInjectContext::getUser)).entrySet().stream()
                .map(entry -> new UserInjectContext(exercise, entry.getKey(),
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
        Stream<ExecutableInject<T>> injects = injectRepository.findAll(InjectSpecification.executable())
                .stream().filter(this::isInInjectableRange)
                .map(inject -> prodRun(inject, buildUsersFromInject(inject)));
        // endregion
        // region dry injects
        Stream<ExecutableInject<T>> dryInjects = dryInjectRepository.findAll(DryInjectSpecification.executable())
                .stream().filter(this::isInInjectableRange)
                .map(inject -> dryRun(inject, buildUsersFromInject(inject)));
        // endregion
        return concat(injects, dryInjects).collect(Collectors.toList());
    }

    public String buildContextualContent(String content, UserInjectContext context) throws Exception {
        Configuration cfg = new Configuration(Configuration.VERSION_2_3_31);
        cfg.setTemplateExceptionHandler(new TemplateExceptionManager());
        cfg.setLogTemplateExceptions(false);
        Template template = new Template("template", new StringReader(content), cfg);
        return FreeMarkerTemplateUtils.processTemplateIntoString(template, context);
    }
}
