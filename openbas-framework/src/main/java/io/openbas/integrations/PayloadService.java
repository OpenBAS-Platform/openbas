package io.openbas.integrations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Injector;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.model.Payload;
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
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.DETECTION;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.PREVENTION;
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

    public void updateInjectorContractsForInjector(Injector injector) {
        if( !injector.isPayloads() ) {
            throw new UnsupportedOperationException("This injector does not support payloads");
        }
        Iterable<Payload> payloads = payloadRepository.findAll();
        payloads.forEach(payload -> {
            updateInjectorContract(injector, payload);
        });
    }

    public void updateInjectorContractsForPayload(Payload payload) {
        List<Injector> injectors = injectorRepository.findAllByPayloads(true);
        injectors.forEach(injector -> {
            updateInjectorContract(injector, payload);
        });
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
        preventionExpectation.setScore(0);
        // Detection
        Expectation detectionExpectation = new Expectation();
        detectionExpectation.setType(DETECTION);
        detectionExpectation.setName("Expect inject to be detected");
        detectionExpectation.setScore(0);
        return expectationsField("expectations", "Expectations", List.of(preventionExpectation, detectionExpectation));
    }
}
