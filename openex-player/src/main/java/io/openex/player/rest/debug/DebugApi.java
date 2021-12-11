package io.openex.player.rest.debug;

import io.openex.player.helper.InjectHelper;
import io.openex.player.model.execution.ExecutableInject;
import io.openex.player.repository.InjectRepository;
import io.openex.player.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static io.openex.player.model.execution.ExecutableInject.prodRun;

@RestController
public class DebugApi extends RestBehavior {

    private InjectHelper injectHelper;
    private InjectRepository injectRepository;

    @Autowired
    public void setInjectHelper(InjectHelper injectHelper) {
        this.injectHelper = injectHelper;
    }

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    @GetMapping("/injects")
    public List<ExecutableInject<?>> injects() {
        Stream<ExecutableInject<?>> injects = StreamSupport.stream(injectRepository.findAll().spliterator(), false)
                .map(inject -> prodRun(inject, injectHelper.buildUsersFromInject(inject)));
        return injects.toList();
    }
}
