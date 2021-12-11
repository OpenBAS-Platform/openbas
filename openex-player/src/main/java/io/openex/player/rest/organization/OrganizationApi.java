package io.openex.player.rest.organization;

import io.openex.player.helper.InjectHelper;
import io.openex.player.model.ContentBase;
import io.openex.player.model.Contract;
import io.openex.player.model.Executor;
import io.openex.player.model.database.InjectTypes;
import io.openex.player.model.database.Organization;
import io.openex.player.model.execution.ExecutableInject;
import io.openex.player.model.execution.Execution;
import io.openex.player.repository.InjectRepository;
import io.openex.player.repository.OrganizationRepository;
import io.openex.player.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.security.RolesAllowed;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static io.openex.player.model.database.User.ROLE_PLANIFICATEUR;
import static io.openex.player.model.execution.ExecutableInject.prodRun;
import static io.openex.player.model.execution.ExecutionStatus.ERROR;
import static java.util.List.of;

@RestController
public class OrganizationApi extends RestBehavior {

    private OrganizationRepository organizationRepository;

    @Autowired
    public void setOrganizationRepository(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @GetMapping("/api/organizations")
    public Iterable<Organization> organizations() {
        return organizationRepository.findAll();
    }
}
