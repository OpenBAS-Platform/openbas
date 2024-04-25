package io.openbas.asset;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.contract.Contract;
import io.openbas.contract.Contractor;
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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
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
    public void register(String id, String name, Contractor contractor, Boolean isCustomizable) throws Exception {
        if(!contractor.isExpose()) {
            return;
        }
        if (contractor.getIcon() != null) {
            InputStream iconData = contractor.getIcon().getData();
            fileService.uploadStream(INJECTORS_IMAGES_BASE_PATH, contractor.getType() + ".png", iconData);
        }
        // We need to support upsert for registration
        Injector injector = injectorRepository.findById(id).orElse(null);
        List<Contract> contracts = contractor.contracts();
        if (injector != null) {
            injector.setId(id);
            injector.setName(name);
            injector.setExternal(false);
            injector.setCustomContracts(isCustomizable);
            injector.setType(contractor.getType());
            ConcurrentLinkedQueue<String> existing = new ConcurrentLinkedQueue<>();
            ConcurrentLinkedQueue<InjectorContract> toUpdates = new ConcurrentLinkedQueue<>();
            ConcurrentLinkedQueue<String> toDeletes = new ConcurrentLinkedQueue<>();
            injector.getContracts()
                .parallelStream()
                .forEach(contract -> {
                    Optional<Contract> current = contracts.stream()
                        .filter(c -> c.getId().equals(contract.getId()))
                        .findFirst();
                    if (current.isPresent()) {
                        existing.add(contract.getId());

                        synchronized (contract) {
                            contract.setManual(current.get().isManual());
                            contract.setAtomicTesting(current.get().isAtomicTesting());

                            Map<String, String> labels = new ConcurrentHashMap<>();
                            current.get().getLabel().forEach((key, value) -> labels.putIfAbsent(key.toString(), value));
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
                        }
                        toUpdates.add(contract);
                    } else {
                        toDeletes.add(contract.getId());
                    }
                });
            List<InjectorContract> toCreates = contracts.stream().filter(c -> !existing.contains(c.getId())).map(in -> {
                InjectorContract injectorContract = new InjectorContract();
                injectorContract.setId(in.getId());
                injectorContract.setManual(in.isManual());
                injectorContract.setAtomicTesting(in.isAtomicTesting());
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
