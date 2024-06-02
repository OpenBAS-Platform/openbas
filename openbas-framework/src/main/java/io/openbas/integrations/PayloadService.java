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

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

@RequiredArgsConstructor
@Service
public class PayloadService {
    @Resource
    protected ObjectMapper mapper;

    private final PayloadRepository payloadRepository;
    private final InjectorRepository injectorRepository;
    private final InjectorContractRepository injectorContractRepository;
    private final AttackPatternRepository attackPatternRepository;

    @Transactional
    public void updateInjectorContractsForInjector(Injector injector) {
        if( !injector.isPayloads() ) {
            throw new UnsupportedOperationException("This injector does not support payloads");
        }
        Iterable<Payload> payloads = payloadRepository.findAll();
        payloads.forEach(payload -> {
            updateInjectorContract(injector, payload);
        });
    }

    @Transactional
    public void updateInjectorContractsForPayload(Payload payload) {
        List<Injector> injectors = injectorRepository.findAllByPayloads(true);
        injectors.forEach(injector -> {
            updateInjectorContract(injector, payload);
        });
    }

    private void updateInjectorContract(Injector injector, Payload payload) {
        Optional<InjectorContract> injectorContract = injectorContractRepository.findByInjectorAndPayload(injector, payload);
        Contract contract = buildContract(injector, payload);
        if (injectorContract.isPresent()) {
            InjectorContract existingInjectorContract = injectorContract.get();
            Map<String, String> labels = Map.of("en", payload.getName(), "fr", payload.getName());
            existingInjectorContract.setLabels(labels);
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
            Map<String, String> labels = Map.of("en", payload.getName(), "fr", payload.getName());
            InjectorContract newInjectorContract = new InjectorContract();
            newInjectorContract.setId(payload.getId() + "-" + injector.getId());
            newInjectorContract.setLabels(labels);
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

    private Contract buildContract(@NotNull final Injector injector, @NotNull final Payload payload) {
        Map<SupportedLanguage, String> labels = Map.of(en, injector.getName(), fr, injector.getName());
        ContractConfig contractConfig = new ContractConfig(injector.getType(), labels, "#000000", "#000000", "/img/icon-" + injector.getType() + ".png", true);
        ContractAsset assetField = assetField("assets", "Assets", Multiple);
        ContractAssetGroup assetGroupField = assetGroupField("assetgroups", "Asset groups", Multiple);
        ContractExpectations expectationsField = expectations();
        ContractDef builder = contractBuilder();
        builder.mandatoryGroup(assetField, assetGroupField);
        builder.optional(expectationsField);
        return executableContract(
                contractConfig,
                payload.getId(),
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
