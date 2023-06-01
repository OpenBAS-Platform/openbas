package io.openex.rest.system;

import io.openex.database.model.System;
import io.openex.database.model.System.OS_TYPE;
import io.openex.database.model.System.SYSTEM_TYPE;
import io.openex.database.repository.SystemRepository;
import io.openex.rest.system.form.SystemInput;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import java.time.Instant;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.StreamHelper.fromIterable;

@RestController
@RequiredArgsConstructor
public class SystemApi {
    public static final String SYSTEM_URI = "/api/systems";

    private final SystemRepository systemRepository;

    // -- CRUD --

    @PostMapping(SYSTEM_URI)
    @Transactional(rollbackOn = Exception.class)
    @RolesAllowed(ROLE_ADMIN)
    public System createSystem(@Valid @RequestBody final SystemInput input) {
        System system = new System();
        system.setUpdateAttributes(input);
        // Handle enum
        system.setType(SYSTEM_TYPE.valueOf(input.getType()));
        system.setOs(OS_TYPE.valueOf(input.getOs()));
        return this.systemRepository.save(system);
    }

    @GetMapping(SYSTEM_URI)
    @PreAuthorize("isObserver()")
    public Iterable<System> systems() {
        return fromIterable(this.systemRepository.findAll());
    }

    @PutMapping(SYSTEM_URI + "/{systemId}")
    @Transactional(rollbackOn = Exception.class)
    @RolesAllowed(ROLE_ADMIN)
    public System updateSystem(@PathVariable @NotBlank final String systemId,
                               @Valid @RequestBody final SystemInput input) {
        System system = this.systemRepository.findById(systemId).orElseThrow();
        system.setUpdateAttributes(input);
        system.setUpdatedAt(Instant.now());
        return this.systemRepository.save(system);
    }

    @DeleteMapping(SYSTEM_URI + "/{systemId}")
    @Transactional(rollbackOn = Exception.class)
    @RolesAllowed(ROLE_ADMIN)
    public void deleteSystem(@PathVariable @NotBlank final String systemId) {
        this.systemRepository.deleteById(systemId);
    }
}
