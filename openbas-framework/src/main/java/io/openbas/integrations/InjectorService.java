package io.openbas.integrations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.injector_contract.Contract;
import io.openbas.injector_contract.Contractor;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Injector;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.service.FileService;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
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

    @Transactional
    public void register(String id, String name, Contractor contractor, Boolean isCustomizable, Boolean isSimulationAgent, String[] simulationPlatforms, String category) throws Exception {
        if(!contractor.isExpose()) {
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
            injector.setSimulationAgent(isSimulationAgent);
            injector.setSimulationAgentPlatforms(simulationPlatforms);
            injector.setCategory(category);
            List<String> existing = new ArrayList<>();
            List<InjectorContract> toUpdates = new ArrayList<>();
            List<String> toDeletes = new ArrayList<>();
            injector.getContracts()
                .stream()
                .parallel()
                .forEach(contract -> {
                Optional<Contract> current = contracts.stream().filter(c -> c.getId().equals(contract.getId())).findFirst();
                if (current.isPresent()) {
                    existing.add(contract.getId());
                    contract.setManual(current.get().isManual());
                    contract.setAtomicTesting(current.get().isAtomicTesting());
                    contract.setPlatforms(current.get().getPlatforms().toArray(new String[0]));
                    Map<String, String> labels = current.get().getLabel().entrySet().stream()
                            .collect(Collectors.toMap(e -> e.getKey().toString(), Map.Entry::getValue));
                    contract.setLabels(labels);
                    if (!current.get().getAttackPatternsExternalIds().isEmpty()) {
                        List<AttackPattern> attackPatterns = fromIterable(attackPatternRepository.findAllByExternalIdInIgnoreCase(current.get().getAttackPatternsExternalIds()));
                        contract.setAttackPatterns(attackPatterns);
                    } else {
                        contract.setAttackPatterns(new ArrayList<>());
                    }
                    try {
                        contract.setContent(mapper.writeValueAsString(current.get()));
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                    toUpdates.add(contract);
                } else if( !contract.getCustom() ) {
                    toDeletes.add(contract.getId());
                }
            });
            List<InjectorContract> toCreates = contracts.stream().filter(c -> !existing.contains(c.getId())).map(in -> {
                InjectorContract injectorContract = new InjectorContract();
                injectorContract.setId(in.getId());
                injectorContract.setManual(in.isManual());
                injectorContract.setAtomicTesting(in.isAtomicTesting());
                injectorContract.setPlatforms(in.getPlatforms().toArray(new String[0]));
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
            newInjector.setSimulationAgent(isSimulationAgent);
            newInjector.setSimulationAgentPlatforms(simulationPlatforms);
            newInjector.setCategory(category);
            Injector savedInjector = injectorRepository.save(newInjector);
            // Save the contracts
            List<InjectorContract> injectorContracts = contracts.stream().map(in -> {
                InjectorContract injectorContract = new InjectorContract();
                injectorContract.setId(in.getId());
                injectorContract.setManual(in.isManual());
                injectorContract.setAtomicTesting(in.isAtomicTesting());
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

}
