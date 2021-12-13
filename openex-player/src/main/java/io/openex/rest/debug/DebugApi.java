package io.openex.rest.debug;

import io.openex.database.repository.InjectRepository;
import io.openex.helper.InjectHelper;
import io.openex.model.ExecutableInject;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Stream;

import static io.openex.model.ExecutableInject.prodRun;
import static java.util.stream.StreamSupport.stream;

@RestController
public class DebugApi<T> extends RestBehavior {

    private InjectHelper<T> injectHelper;
    private InjectRepository<T> injectRepository;

    @Autowired
    public void setInjectHelper(InjectHelper<T> injectHelper) {
        this.injectHelper = injectHelper;
    }

    @Autowired
    public void setInjectRepository(InjectRepository<T> injectRepository) {
        this.injectRepository = injectRepository;
    }

    @GetMapping("/injects")
    public List<ExecutableInject<T>> injects() {
        Stream<ExecutableInject<T>> injects = stream(injectRepository.findAll().spliterator(), false)
                .map(inject -> prodRun(inject, injectHelper.buildUsersFromInject(inject)));
        return injects.toList();
    }
}
