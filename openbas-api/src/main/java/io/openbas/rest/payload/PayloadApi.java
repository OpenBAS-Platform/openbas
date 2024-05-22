package io.openbas.rest.payload;

import io.openbas.database.model.Payload;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.payload.form.PayloadCreateInput;
import io.openbas.rest.payload.form.PayloadUpdateInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RestController
@Secured(ROLE_USER)
public class PayloadApi extends RestBehavior {

    private PayloadRepository payloadRepository;
    private TagRepository tagRepository;

    @Autowired
    public void setPayloadRepository(PayloadRepository payloadRepository) {
        this.payloadRepository = payloadRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @GetMapping("/api/payloads")
    public Iterable<Payload> payloads() {
        return payloadRepository.findAll();
    }

    @PostMapping("/api/payloads/search")
    public Page<Payload> payloads(@RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
        return buildPaginationJPA(
                (Specification<Payload> specification, Pageable pageable) -> this.payloadRepository.findAll(
                        specification, pageable),
                searchPaginationInput,
                Payload.class
        );
    }

    @GetMapping("/api/payloads/{payloadId}")
    public Payload payload(@PathVariable String payloadId) {
        return payloadRepository.findById(payloadId).orElseThrow(ElementNotFoundException::new);
    }

    @PostMapping("/api/payloads")
    @PreAuthorize("isPlanner()")
    public Payload createPayload(@Valid @RequestBody PayloadCreateInput input) {
        Payload payload = new Payload();
        payload.setUpdateAttributes(input);
        payload.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return payloadRepository.save(payload);
    }

    @PutMapping("/api/payloads/{payloadId}")
    @PreAuthorize("isPlanner()")
    public Payload updatePayload(
            @NotBlank @PathVariable final String payloadId,
            @Valid @RequestBody PayloadUpdateInput input) {
        Payload payload = this.payloadRepository.findById(payloadId).orElseThrow(ElementNotFoundException::new);
        payload.setUpdateAttributes(input);
        payload.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        payload.setUpdatedAt(Instant.now());
        return payloadRepository.save(payload);
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/payloads/{payloadId}")
    public void deletePayload(@PathVariable String payloadId) {
        payloadRepository.deleteById(payloadId);
    }
}
