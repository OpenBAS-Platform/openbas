package io.openbas.integrations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Endpoint.PLATFORM_TYPE;
import io.openbas.database.model.Injector;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.injector_contract.Contract;
import io.openbas.injector_contract.Contractor;
import io.openbas.service.FileService;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.service.FileService.INJECTORS_IMAGES_BASE_PATH;

@Service
public class InjectorService {

    @Resource
    protected ObjectMapper mapper;

    private FileService fileService;

    private InjectorRepository injectorRepository;

    private InjectorContractRepository injectorContractRepository;

    private AttackPatternRepository attackPatternRepository;

    private PayloadService payloadService;

    @Resource
    public void setFileService(FileService fileService) {
        this.fileService = fileService;
    }

    @Autowired
    public void setAttackPatternRepository(AttackPatternRepository attackPatternRepository) {
        this.attackPatternRepository = attackPatternRepository;
    }

    @Autowired
    public void setInjectorRepository(InjectorRepository injectorRepository) {
        this.injectorRepository = injectorRepository;
    }

    @Autowired
    public void setInjectorContractRepository(InjectorContractRepository injectorContractRepository) {
        this.injectorContractRepository = injectorContractRepository;
    }

    @Autowired
    public void setPayloadService(PayloadService payloadService) {
        this.payloadService = payloadService;
    }

    @Transactional
    public void register(String id, String name, Contractor contractor, Boolean isCustomizable, String category, Map<String, String> executorCommands, Map<String, String> executorClearCommands, Boolean isPayloads) throws Exception {
        if(!contractor.isExpose()) {
            Injector injector = injectorRepository.findById(id).orElse(null);
            if( injector != null ) {
                injectorRepository.deleteById(id);
                return;
            }
            return;
        }
        if (contractor.getIcon() != null) {
            InputStream iconData = contractor.getIcon().getData();
            fileService.uploadStream(INJECTORS_IMAGES_BASE_PATH, contractor.getType() + ".png", iconData);
        }
        // We need to support upsert for registration
        Injector injector = injectorRepository.findById(id).orElse(null);
        if( injector == null ) {
            Injector injectorChecking = injectorRepository.findByType(contractor.getType()).orElse(null);
            if (injectorChecking != null ) {
                throw new Exception("The injector " + contractor.getType() + " already exists with a different ID, please delete it or contact your administrator.");
            }
        }
        // Check error to avoid changing ID
        List<Contract> contracts = contractor.contracts();
        if (injector != null) {
            injector.setName(name);
            injector.setExternal(false);
            injector.setCustomContracts(isCustomizable);
            injector.setType(contractor.getType());
            injector.setCategory(category);
            injector.setExecutorCommands(executorCommands);
            injector.setExecutorClearCommands(executorClearCommands);
            injector.setPayloads(isPayloads);
            injector.setUpdatedAt(Instant.now());
            List<String> existing = new ArrayList<>();
            List<InjectorContract> toUpdates = new ArrayList<>();
            List<String> toDeletes = new ArrayList<>();
            injector.getContracts()
                .forEach(contract -> {
                Optional<Contract> current = contracts.stream().filter(c -> c.getId().equals(contract.getId())).findFirst();
                if (current.isPresent()) {
                    existing.add(contract.getId());
                    contract.setManual(current.get().isManual());
                    contract.setAtomicTesting(current.get().isAtomicTesting());
                    contract.setPlatforms(current.get().getPlatforms().toArray(new PLATFORM_TYPE[0]));
                    contract.setNeedsExecutor(current.get().isNeedsExecutor());
                    Map<String, String> labels = current.get().getLabel().entrySet().stream()
                            .collect(Collectors.toMap(e -> e.getKey().toString(), Map.Entry::getValue));
                    contract.setLabels(labels);
                    // If no override of TTPs, retrieve those of the contract
                    if (contract.getAttackPatterns().isEmpty()) {
                        if (!current.get().getAttackPatternsExternalIds().isEmpty()) {
                            List<AttackPattern> attackPatterns = fromIterable(attackPatternRepository.findAllByExternalIdInIgnoreCase(current.get().getAttackPatternsExternalIds()));
                            contract.setAttackPatterns(attackPatterns);
                        }
                    }
                    try {
                        contract.setContent(mapper.writeValueAsString(current.get()));
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                    toUpdates.add(contract);
                } else if(!contract.getCustom() && (!injector.isPayloads() || contract.getPayload() == null)) {
                    toDeletes.add(contract.getId());
                }
            });
            List<InjectorContract> toCreates = contracts.stream().filter(c -> !existing.contains(c.getId())).map(in -> {
                InjectorContract injectorContract = new InjectorContract();
                injectorContract.setId(in.getId());
                injectorContract.setManual(in.isManual());
                injectorContract.setAtomicTesting(in.isAtomicTesting());
                injectorContract.setPlatforms(in.getPlatforms().toArray(new PLATFORM_TYPE[0]));
                injectorContract.setNeedsExecutor(in.isNeedsExecutor());
                Map<String, String> labels = in.getLabel().entrySet().stream()
                        .collect(Collectors.toMap(e -> e.getKey().toString(), Map.Entry::getValue));
                injectorContract.setLabels(labels);
                injectorContract.setInjector(injector);
                if (!in.getAttackPatternsExternalIds().isEmpty()) {
                    List<AttackPattern> attackPatterns = fromIterable(attackPatternRepository.findAllByExternalIdInIgnoreCase(in.getAttackPatternsExternalIds()));
                    injectorContract.setAttackPatterns(attackPatterns);
                } else {
                    injectorContract.setAttackPatterns(new ArrayList<>());
                }
                try {
                    injectorContract.setContent(mapper.writeValueAsString(in));
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
                return injectorContract;
            }).toList();
            injectorContractRepository.deleteAllById(toDeletes);
            injectorContractRepository.saveAll(toCreates);
            injectorContractRepository.saveAll(toUpdates);
            injectorRepository.save(injector);
        } else {
            // save the injector
            Injector newInjector = new Injector();
            newInjector.setId(id);
            newInjector.setName(name);
            newInjector.setType(contractor.getType());
            newInjector.setCategory(category);
            newInjector.setCustomContracts(isCustomizable);
            newInjector.setExecutorCommands(executorCommands);
            newInjector.setExecutorClearCommands(executorClearCommands);
            newInjector.setPayloads(isPayloads);
            Injector savedInjector = injectorRepository.save(newInjector);
            // Save the contracts
            List<InjectorContract> injectorContracts = contracts.stream().map(in -> {
                InjectorContract injectorContract = new InjectorContract();
                injectorContract.setId(in.getId());
                injectorContract.setManual(in.isManual());
                injectorContract.setAtomicTesting(in.isAtomicTesting());
                injectorContract.setPlatforms(in.getPlatforms().toArray(new PLATFORM_TYPE[0]));
                injectorContract.setNeedsExecutor(in.isNeedsExecutor());
                Map<String, String> labels = in.getLabel().entrySet().stream()
                        .collect(Collectors.toMap(e -> e.getKey().toString(), Map.Entry::getValue));
                injectorContract.setLabels(labels);
                injectorContract.setInjector(savedInjector);
                if (!in.getAttackPatternsExternalIds().isEmpty()) {
                    injectorContract.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(in.getAttackPatternsExternalIds())));
                }
                try {
                    injectorContract.setContent(mapper.writeValueAsString(in));
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
                return injectorContract;
            }).toList();
            injectorContractRepository.saveAll(injectorContracts);
        }
    }

    public Iterable<Injector> injectors() {
        return injectorRepository.findAll();
    }
}
