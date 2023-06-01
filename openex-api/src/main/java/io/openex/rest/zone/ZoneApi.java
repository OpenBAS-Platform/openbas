package io.openex.rest.zone;

import io.openex.database.model.System;
import io.openex.database.model.Zone;
import io.openex.database.repository.SystemRepository;
import io.openex.database.repository.ZoneRepository;
import io.openex.rest.zone.form.UpdateSystemsZoneInput;
import io.openex.rest.zone.form.ZoneInput;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.StreamHelper.fromIterable;

@RestController
@RequiredArgsConstructor
public class ZoneApi {
    public static final String ZONE_URI = "/api/zones";

    private final ZoneRepository zoneRepository;
    private final SystemRepository systemRepository;

    // -- CRUD --

    @PostMapping(ZONE_URI)
    @Transactional(rollbackOn = Exception.class)
    @RolesAllowed(ROLE_ADMIN)
    public Zone createZone(@Valid @RequestBody final ZoneInput input) {
        Zone zone = new Zone();
        zone.setUpdateAttributes(input);
        return this.zoneRepository.save(zone);
    }

    @GetMapping(ZONE_URI)
    @PreAuthorize("isObserver()")
    public Iterable<Zone> zones() {
        return fromIterable(this.zoneRepository.findAll());
    }

    @PutMapping(ZONE_URI + "/{zoneId}")
    @Transactional(rollbackOn = Exception.class)
    @RolesAllowed(ROLE_ADMIN)
    public Zone updateZone(@PathVariable @NotBlank final String zoneId,
                           @Valid @RequestBody final ZoneInput input) {
        Zone zone = this.zoneRepository.findById(zoneId).orElseThrow();
        zone.setUpdateAttributes(input);
        zone.setUpdatedAt(Instant.now());
        return this.zoneRepository.save(zone);
    }

    @DeleteMapping(ZONE_URI + "/{zoneId}")
    @Transactional(rollbackOn = Exception.class)
    @RolesAllowed(ROLE_ADMIN)
    public void deleteZone(@PathVariable @NotBlank final String zoneId) {
        this.zoneRepository.deleteById(zoneId);
    }

    // -- SYSTEM --

    @GetMapping(ZONE_URI + "/{zoneId}/systems")
    @Transactional(rollbackOn = Exception.class)
    @PreAuthorize("isObserver()")
    public List<System> zoneSystems(@PathVariable @NotBlank final String zoneId) {
        return this.zoneRepository.findById(zoneId).orElseThrow().getSystems();
    }

    @PutMapping(ZONE_URI + "/{zoneId}/systems")
    @Transactional(rollbackOn = Exception.class)
    @RolesAllowed(ROLE_ADMIN)
    public Zone addSystemToZone(@PathVariable @NotBlank final String zoneId,
                                @Valid @RequestBody final UpdateSystemsZoneInput input) {
        Zone zone = this.zoneRepository.findById(zoneId).orElseThrow();
        Iterable<System> systems = this.systemRepository.findAllById(input.getSystemIds());
        zone.setSystems(fromIterable(systems));
        return this.zoneRepository.save(zone);
    }
}
