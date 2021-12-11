package io.openex.player.helper;

import freemarker.template.Configuration;
import freemarker.template.Template;
import io.openex.player.model.database.*;
import io.openex.player.model.execution.ExecutableInject;
import io.openex.player.model.execution.UserInjectContext;
import io.openex.player.repository.AudienceRepository;
import io.openex.player.repository.DryInjectRepository;
import io.openex.player.repository.InjectRepository;
import io.openex.player.specification.DryInjectSpecification;
import io.openex.player.specification.InjectSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import javax.transaction.Transactional;
import java.io.StringReader;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static io.openex.player.model.execution.ExecutableInject.dryRun;
import static io.openex.player.model.execution.ExecutableInject.prodRun;
import static java.util.stream.Collectors.groupingBy;

@Component
public class InjectHelper {

    private AudienceRepository audienceRepository;
    private InjectRepository injectRepository;
    private DryInjectRepository dryInjectRepository;

    @Autowired
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setDryInjectRepository(DryInjectRepository dryInjectRepository) {
        this.dryInjectRepository = dryInjectRepository;
    }

    public List<UserInjectContext> buildUsersFromInject(Injection<?> inject) {
        Exercise exercise = inject.getExercise();
        // Create stream from inject audiences
        Iterable<Audience> audiences = inject.isGlobalInject() ? audienceRepository.findAll() : inject.getAudiences();
        Stream<UserInjectContext> injectUserStream = StreamSupport.stream(audiences.spliterator(), false)
                .flatMap(audience -> audience.getSubAudiences().stream())
                .flatMap(subAudience -> subAudience.getUsers().stream().map(user -> new UserInjectContext(exercise, user, subAudience.getName())));
        // Create stream from animation group
        Stream<UserInjectContext> animationUserStream = exercise.getAnimationGroup().getUsers().stream()
                .map(user -> new UserInjectContext(exercise, user, "Animation Group"));
        // Build result
        Stream<UserInjectContext> usersStream = Stream.concat(injectUserStream, animationUserStream);
        return usersStream
                .collect(groupingBy(UserInjectContext::getUser)).entrySet().stream()
                .map(entry -> new UserInjectContext(exercise, entry.getKey(),
                        entry.getValue().stream().flatMap(ua -> ua.getAudiences().stream()).toList()))
                .toList();
    }

    @Transactional
    public List<ExecutableInject<?>> getInjectsToRun() {
        // region injects
        Specification<Inject<?>> injectFilters = InjectSpecification.notManual()
                .and(InjectSpecification.fromActiveExercise())
                .and(InjectSpecification.inLastHour())
                .and(InjectSpecification.isEnable())
                .and(InjectSpecification.notExecuted());
        Stream<ExecutableInject<?>> injects = injectRepository.findAll(injectFilters)
                .stream().map(inject -> prodRun(inject, buildUsersFromInject(inject)));
        // endregion
        // region dry injects
        Specification<DryInject<?>> dryFilters = DryInjectSpecification.notManual()
                .and(DryInjectSpecification.inLastHour())
                .and(DryInjectSpecification.notExecuted());
        Stream<ExecutableInject<?>> dryInjects = dryInjectRepository.findAll(dryFilters)
                .stream().map(inject -> dryRun(inject, buildUsersFromInject(inject)));
        // endregion
        return Stream.concat(injects, dryInjects).collect(Collectors.toList());
    }

    public String buildContextualContent(String content, UserInjectContext context) throws Exception {
        Configuration cfg = new Configuration(Configuration.VERSION_2_3_31);
        cfg.setTemplateExceptionHandler(new TemplateExceptionManager());
        cfg.setLogTemplateExceptions(false);
        Template template = new Template("template", new StringReader(content), cfg);
        return FreeMarkerTemplateUtils.processTemplateIntoString(template, context);
    }
}
