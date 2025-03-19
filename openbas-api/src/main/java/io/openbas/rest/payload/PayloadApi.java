package io.openbas.rest.payload;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.utils.ArchitectureFilterUtils.handleArchitectureFilter;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.payload.form.PayloadCreateInput;
import io.openbas.rest.payload.form.PayloadUpdateInput;
import io.openbas.rest.payload.form.PayloadUpsertInput;
import io.openbas.rest.payload.form.PayloadsDeprecateInput;
import io.openbas.rest.payload.service.PayloadCreationService;
import io.openbas.rest.payload.service.PayloadService;
import io.openbas.rest.payload.service.PayloadUpdateService;
import io.openbas.rest.payload.service.PayloadUpsertService;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class PayloadApi extends RestBehavior {

  public static final String PAYLOAD_URI = "/api/payloads";

  private final PayloadRepository payloadRepository;
  private final PayloadService payloadService;
  private final PayloadCreationService payloadCreationService;
  private final PayloadUpdateService payloadUpdateService;
  private final PayloadUpsertService payloadUpsertService;

  @PostMapping(PAYLOAD_URI + "/search")
  public Page<Payload> payloads(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        this.payloadRepository::findAll,
        handleArchitectureFilter(searchPaginationInput),
        Payload.class);
  }

  @GetMapping(PAYLOAD_URI + "/{payloadId}")
  public Payload payload(@PathVariable String payloadId) {
    return payloadRepository.findById(payloadId).orElseThrow(ElementNotFoundException::new);
  }

  @PostMapping(PAYLOAD_URI)
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public Payload createPayload(@Valid @RequestBody PayloadCreateInput input) {
    return this.payloadCreationService.createPayload(input);
  }

  @PutMapping(PAYLOAD_URI + "/{payloadId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public Payload updatePayload(
      @NotBlank @PathVariable final String payloadId,
      @Valid @RequestBody PayloadUpdateInput input) {
    return this.payloadUpdateService.updatePayload(payloadId, input);
  }

  @PostMapping(PAYLOAD_URI + "/{payloadId}/duplicate")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public Payload duplicatePayload(@NotBlank @PathVariable final String payloadId) {
    return this.payloadService.duplicate(payloadId);
  }

  @PostMapping(PAYLOAD_URI + "/upsert")
  @PreAuthorize("isPlanner()")
  @org.springframework.transaction.annotation.Transactional(rollbackFor = Exception.class)
  public Payload upsertPayload(@Valid @RequestBody PayloadUpsertInput input) {
    return this.payloadUpsertService.upsertPayload(input);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping(PAYLOAD_URI + "/{payloadId}")
  public void deletePayload(@PathVariable String payloadId) {
    payloadRepository.deleteById(payloadId);
  }

  @PostMapping(PAYLOAD_URI + "/deprecate")
  @Secured(ROLE_ADMIN)
  @Transactional(rollbackOn = Exception.class)
  public void deprecateNonProcessedPayloadsByCollector(
      @Valid @RequestBody PayloadsDeprecateInput input) {
    this.payloadService.deprecateNonProcessedPayloadsByCollector(
        input.collectorId(), input.processedPayloadExternalIds());
  }
}
