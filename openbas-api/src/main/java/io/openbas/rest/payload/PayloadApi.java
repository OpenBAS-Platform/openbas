package io.openbas.rest.payload;

import io.openbas.database.model.*;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.payload.form.PayloadCreateInput;
import io.openbas.rest.payload.form.PayloadUpdateInput;
import io.openbas.integrations.PayloadService;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.Hibernate;
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
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RestController
@Secured(ROLE_USER)
public class PayloadApi extends RestBehavior {

    private PayloadRepository payloadRepository;
    private TagRepository tagRepository;
    private PayloadService payloadService;
    private AttackPatternRepository attackPatternRepository;
    private DocumentRepository documentRepository;

    @Autowired
    public void setPayloadRepository(PayloadRepository payloadRepository) {
        this.payloadRepository = payloadRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Autowired
    public void setPayloadService(PayloadService payloadService) {
        this.payloadService = payloadService;
    }

    @Autowired
    public void setAttackPatternRepository(AttackPatternRepository attackPatternRepository) {
        this.attackPatternRepository = attackPatternRepository;
    }

    @Autowired
    public void setDocumentRepository(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
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
    @Transactional(rollbackOn = Exception.class)
    public Payload createPayload(@Valid @RequestBody PayloadCreateInput input) {
        switch (input.getType()) {
            case "Command":
                Command commandPayload = new Command();
                commandPayload.setUpdateAttributes(input);
                commandPayload.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
                commandPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
                commandPayload = payloadRepository.save(commandPayload);
                this.payloadService.updateInjectorContractsForPayload(commandPayload);
                return commandPayload;
            case "Executable":
                Executable executablePayload = new Executable();
                executablePayload.setUpdateAttributes(input);
                executablePayload.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
                executablePayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
                executablePayload.setExecutableFile(documentRepository.findById(input.getExecutableFile()).orElseThrow());
                executablePayload = payloadRepository.save(executablePayload);
                this.payloadService.updateInjectorContractsForPayload(executablePayload);
                return executablePayload;
            case "FileDrop":
                FileDrop fileDropPayload = new FileDrop();
                fileDropPayload.setUpdateAttributes(input);
                fileDropPayload.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
                fileDropPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
                fileDropPayload.setFileDropFile(documentRepository.findById(input.getExecutableFile()).orElseThrow());
                fileDropPayload = payloadRepository.save(fileDropPayload);
                this.payloadService.updateInjectorContractsForPayload(fileDropPayload);
                return fileDropPayload;
            case "DnsResolution":
                DnsResolution dnsResolutionPayload = new DnsResolution();
                dnsResolutionPayload.setUpdateAttributes(input);
                dnsResolutionPayload.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
                dnsResolutionPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
                dnsResolutionPayload = payloadRepository.save(dnsResolutionPayload);
                this.payloadService.updateInjectorContractsForPayload(dnsResolutionPayload);
                return dnsResolutionPayload;
            case "NetworkTraffic":
                NetworkTraffic networkTrafficPayload = new NetworkTraffic();
                networkTrafficPayload.setUpdateAttributes(input);
                networkTrafficPayload.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
                networkTrafficPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
                networkTrafficPayload = payloadRepository.save(networkTrafficPayload);
                this.payloadService.updateInjectorContractsForPayload(networkTrafficPayload);
                return networkTrafficPayload;
            default:
                throw new UnsupportedOperationException("Payload type " + input.getType() + " is not supported");
        }
    }

    @PutMapping("/api/payloads/{payloadId}")
    @PreAuthorize("isPlanner()")
    @Transactional(rollbackOn = Exception.class)
    public Payload updatePayload(
            @NotBlank @PathVariable final String payloadId,
            @Valid @RequestBody PayloadUpdateInput input) {
        Payload payload = this.payloadRepository.findById(payloadId).orElseThrow(ElementNotFoundException::new);
        payload.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        payload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        payload.setUpdatedAt(Instant.now());
        switch( payload.getType() ) {
            case "Command":
                Command payloadCommand = (Command) Hibernate.unproxy(payload);
                payloadCommand.setUpdateAttributes(input);
                payloadCommand = payloadRepository.save(payloadCommand);
                this.payloadService.updateInjectorContractsForPayload(payloadCommand);
                return payloadCommand;
            case "Executable":
                Executable payloadExecutable = (Executable) Hibernate.unproxy(payload);
                payloadExecutable.setUpdateAttributes(input);
                payloadExecutable = payloadRepository.save(payloadExecutable);
                this.payloadService.updateInjectorContractsForPayload(payloadExecutable);
                return payloadExecutable;
            case "FileDrop":
                FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(payload);
                payloadFileDrop.setUpdateAttributes(input);
                payloadFileDrop = payloadRepository.save(payloadFileDrop);
                this.payloadService.updateInjectorContractsForPayload(payloadFileDrop);
                return payloadFileDrop;
            case "DnsResolution":
                DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(payload);
                payloadDnsResolution.setUpdateAttributes(input);
                payloadDnsResolution = payloadRepository.save(payloadDnsResolution);
                this.payloadService.updateInjectorContractsForPayload(payloadDnsResolution);
                return payloadDnsResolution;
            case "NetworkTraffic":
                NetworkTraffic payloadNetworkTraffic = (NetworkTraffic) Hibernate.unproxy(payload);
                payloadNetworkTraffic.setUpdateAttributes(input);
                payloadNetworkTraffic = payloadRepository.save(payloadNetworkTraffic);
                this.payloadService.updateInjectorContractsForPayload(payloadNetworkTraffic);
                return payloadNetworkTraffic;
            default:
                throw new UnsupportedOperationException("Payload type " + payload.getType() + " is not supported");
        }
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/payloads/{payloadId}")
    public void deletePayload(@PathVariable String payloadId) {
        payloadRepository.deleteById(payloadId);
    }
}
