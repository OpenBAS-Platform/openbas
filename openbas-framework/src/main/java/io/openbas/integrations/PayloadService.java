package io.openbas.integrations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.helper.SupportedLanguage;
import io.openbas.injector_contract.Contract;
import io.openbas.injector_contract.ContractConfig;
import io.openbas.injector_contract.ContractDef;
import io.openbas.injector_contract.fields.ContractAsset;
import io.openbas.injector_contract.fields.ContractAssetGroup;
import io.openbas.injector_contract.fields.ContractExpectations;
import io.openbas.model.inject.form.Expectation;
import io.openbas.utils.StringUtils;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.*;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.DETECTION;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.PREVENTION;
import static io.openbas.database.model.Payload.PAYLOAD_SOURCE.MANUAL;
import static io.openbas.database.model.Payload.PAYLOAD_STATUS.VERIFIED;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.SupportedLanguage.en;
import static io.openbas.helper.SupportedLanguage.fr;
import static io.openbas.injector_contract.Contract.executableContract;
import static io.openbas.injector_contract.ContractCardinality.Multiple;
import static io.openbas.injector_contract.ContractDef.contractBuilder;
import static io.openbas.injector_contract.fields.ContractAsset.assetField;
import static io.openbas.injector_contract.fields.ContractAssetGroup.assetGroupField;
import static io.openbas.injector_contract.fields.ContractExpectations.expectationsField;
import static io.openbas.injector_contract.fields.ContractText.textField;

@RequiredArgsConstructor
@Service
public class PayloadService {

    @Resource
    protected ObjectMapper mapper;

    private final PayloadRepository payloadRepository;
    private final InjectorRepository injectorRepository;
    private final InjectorContractRepository injectorContractRepository;
    private final AttackPatternRepository attackPatternRepository;

    public void updateInjectorContractsForPayload(Payload payload) {
        List<Injector> injectors = this.injectorRepository.findAllByPayloads(true);
        injectors.forEach(injector -> updateInjectorContract(injector, payload));
    }

    private void updateInjectorContract(Injector injector, Payload payload) {
        Optional<InjectorContract> injectorContract = injectorContractRepository.findInjectorContractByInjectorAndPayload(injector, payload);
        if (injectorContract.isPresent()) {
            InjectorContract existingInjectorContract = injectorContract.get();
            Contract contract = buildContract(existingInjectorContract.getId(), injector, payload);
            Map<String, String> labels = Map.of("en", payload.getName(), "fr", payload.getName());
            existingInjectorContract.setLabels(labels);
            existingInjectorContract.setNeedsExecutor(true);
            existingInjectorContract.setManual(false);
            existingInjectorContract.setInjector(injector);
            existingInjectorContract.setPayload(payload);
            existingInjectorContract.setPlatforms(payload.getPlatforms());
            existingInjectorContract.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(payload.getAttackPatterns().stream().map(AttackPattern::getId).toList())));
            existingInjectorContract.setAtomicTesting(true);
            try {
                existingInjectorContract.setContent(mapper.writeValueAsString(contract));
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
            injectorContractRepository.save(existingInjectorContract);
        } else {
            String contractId = String.valueOf(UUID.randomUUID());
            Map<String, String> labels = Map.of("en", payload.getName(), "fr", payload.getName());
            Contract contract = buildContract(contractId, injector, payload);
            InjectorContract newInjectorContract = new InjectorContract();
            newInjectorContract.setId(contractId);
            newInjectorContract.setLabels(labels);
            newInjectorContract.setNeedsExecutor(true);
            newInjectorContract.setManual(false);
            newInjectorContract.setInjector(injector);
            newInjectorContract.setPayload(payload);
            newInjectorContract.setPlatforms(payload.getPlatforms());
            newInjectorContract.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(payload.getAttackPatterns().stream().map(AttackPattern::getId).toList())));
            newInjectorContract.setAtomicTesting(true);
            try {
                newInjectorContract.setContent(mapper.writeValueAsString(contract));
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
            injectorContractRepository.save(newInjectorContract);
        }
    }

    private Contract buildContract(@NotNull final String contractId, @NotNull final Injector injector, @NotNull final Payload payload) {
        Map<SupportedLanguage, String> labels = Map.of(en, injector.getName(), fr, injector.getName());
        ContractConfig contractConfig = new ContractConfig(injector.getType(), labels, "#000000", "#000000", "/img/icon-" + injector.getType() + ".png", true);
        ContractAsset assetField = assetField("assets", "Assets", Multiple);
        ContractAssetGroup assetGroupField = assetGroupField("assetgroups", "Asset groups", Multiple);
        ContractExpectations expectationsField = expectations();
        ContractDef builder = contractBuilder();
        builder.mandatoryGroup(assetField, assetGroupField);
        builder.optional(expectationsField);
        if( payload.getArguments() != null ) {
            payload.getArguments().forEach(payloadArgument -> {
                builder.mandatory(textField(payloadArgument.getKey(), payloadArgument.getKey(), payloadArgument.getDefaultValue()));
            });
        }
        return executableContract(
                contractConfig,
                contractId,
                Map.of(en, payload.getName(), fr, payload.getName()),
                builder.build(),
                Arrays.asList(payload.getPlatforms()),
                true
        );
    }

    private ContractExpectations expectations() {
        // Prevention
        Expectation preventionExpectation = new Expectation();
        preventionExpectation.setType(PREVENTION);
        preventionExpectation.setName("Expect inject to be prevented");
        preventionExpectation.setScore(100.0);
        // Detection
        Expectation detectionExpectation = new Expectation();
        detectionExpectation.setType(DETECTION);
        detectionExpectation.setName("Expect inject to be detected");
        detectionExpectation.setScore(100.0);
        return expectationsField("expectations", "Expectations", List.of(preventionExpectation, detectionExpectation));
    }

    public Payload duplicate(@NotBlank final String payloadId) {
        Payload origin = this.payloadRepository.findById(payloadId).orElseThrow();
        Payload duplicate;
        switch (origin.getType()) {
            case "Command":
                Command originCommand = (Command) Hibernate.unproxy(origin);
                Command duplicateCommand = new Command();
                duplicateCommonProperties(originCommand, duplicateCommand);
                duplicate = payloadRepository.save(duplicateCommand);
                break;
            case "Executable":
                Executable originExecutable = (Executable) Hibernate.unproxy(origin);
                Executable duplicateExecutable = new Executable();
                duplicateCommonProperties(originExecutable, duplicateExecutable);
                duplicateExecutable.setExecutableFile(originExecutable.getExecutableFile());
                duplicate = payloadRepository.save(duplicateExecutable);
                break;
            case "FileDrop":
                FileDrop originFileDrop = (FileDrop) Hibernate.unproxy(origin);
                FileDrop duplicateFileDrop = new FileDrop();
                duplicateCommonProperties(originFileDrop, duplicateFileDrop);
                duplicate = payloadRepository.save(duplicateFileDrop);
                break;
            case "DnsResolution":
                DnsResolution originDnsResolution = (DnsResolution) Hibernate.unproxy(origin);
                DnsResolution duplicateDnsResolution = new DnsResolution();
                duplicateCommonProperties(originDnsResolution, duplicateDnsResolution);
                duplicate = payloadRepository.save(duplicateDnsResolution);
                break;
            case "NetworkTraffic":
                NetworkTraffic originNetworkTraffic = (NetworkTraffic) Hibernate.unproxy(origin);
                NetworkTraffic duplicateNetworkTraffic = new NetworkTraffic();
                duplicateCommonProperties(originNetworkTraffic, duplicateNetworkTraffic);
                duplicate = payloadRepository.save(duplicateNetworkTraffic);
                break;
            default:
                throw new UnsupportedOperationException("Payload type " + origin.getType() + " is not supported");
        }
        this.updateInjectorContractsForPayload(duplicate);
        return duplicate;
    }

    private <T extends Payload> void duplicateCommonProperties(@org.jetbrains.annotations.NotNull final T origin, @org.jetbrains.annotations.NotNull T duplicate) {
        BeanUtils.copyProperties(origin, duplicate);
        duplicate.setId(null);
        duplicate.setName(StringUtils.duplicateString(origin.getName()));
        duplicate.setAttackPatterns(new ArrayList<>(origin.getAttackPatterns()));
        duplicate.setTags(new HashSet<>(origin.getTags()));
        duplicate.setExternalId(null);
        duplicate.setSource(MANUAL);
        duplicate.setStatus(VERIFIED);
        duplicate.setCollector(null);
    }
}
