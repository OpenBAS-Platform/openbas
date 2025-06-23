package io.openbas.rest.payload;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.utils.ArchitectureFilterUtils.handleArchitectureFilter;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exception.UnprocessableContentException;
import io.openbas.rest.exercise.exports.ExportOptions;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.InjectExportRequestInput;
import io.openbas.rest.inject.form.InjectImportInput;
import io.openbas.rest.inject.form.InjectImportTargetType;
import io.openbas.rest.payload.form.*;
import io.openbas.rest.payload.service.*;
import io.openbas.rest.security.SecurityExpression;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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
  private final io.openbas.rest.payload.service.PayloadExportService payloadExportService;

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

  @PostMapping(PAYLOAD_URI + "/export")
  public void payloadsExport(
          @RequestBody @Valid final PayloadExportRequestInput payloadExportRequestInput,
          HttpServletResponse response)
          throws IOException {
    List<String> targetIds = payloadExportRequestInput.getTargetsIds();
    List<Payload> payloads = StreamSupport.stream(payloadRepository.findAllById(targetIds).spliterator(), false).toList();
    runPayloadExport(payloads, response);
  }

  private void runPayloadExport(List<Payload> payloads, HttpServletResponse response) throws IOException {
    byte[] zippedExport = payloadExportService.exportPayloadsToZip(payloads);
    String zipName = payloadExportService.getZipFileName();

    response.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + zipName);
    response.addHeader(HttpHeaders.CONTENT_TYPE, "application/zip");
    response.setStatus(HttpServletResponse.SC_OK);
    ServletOutputStream outputStream = response.getOutputStream();
    outputStream.write(zippedExport);
    outputStream.close();
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
