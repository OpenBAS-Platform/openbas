package io.openbas.rest.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.ImportMapper;
import io.openbas.database.model.InjectImporter;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.model.RuleAttribute;
import io.openbas.database.raw.RawPaginationImportMapper;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.mapper.form.*;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RestController
@RequiredArgsConstructor
public class MapperApi extends RestBehavior {

    private final ImportMapperRepository importMapperRepository;

    private final InjectorContractRepository injectorContractRepository;

    @Resource
    protected ObjectMapper mapper;

    @Secured(ROLE_USER)
    @PostMapping("/api/mappers/search")
    @Transactional(rollbackOn = Exception.class)
    public Page<RawPaginationImportMapper> getImportMapper(@RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
        return buildPaginationJPA(
                this.importMapperRepository::findAll,
                searchPaginationInput,
                ImportMapper.class
        ).map(RawPaginationImportMapper::new);
    }

    @Secured(ROLE_ADMIN)
    @GetMapping("/api/mappers/{mapperId}")
    public ImportMapper getImportMapperById(@PathVariable String mapperId) {
        return importMapperRepository.findById(UUID.fromString(mapperId)).orElseThrow(ElementNotFoundException::new);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/mappers")
    public void createImportMapper(@RequestBody @Valid final MapperAddInput mapperAddInput) {
        ImportMapper importMapper = new ImportMapper();
        importMapper.setName(mapperAddInput.getName());
        importMapper.setInjectTypeColumn(mapperAddInput.getInjectTypeColumn());
        importMapper.setInjectImporters(new ArrayList<>());

        Map<String, InjectorContract> mapInjectorContracts = getMapOfInjectorContracts(
                mapperAddInput.getImporters()
                        .stream()
                        .map(InjectImporterAddInput::getInjectorContractId)
                        .toList()
        );

        mapperAddInput.getImporters().forEach(
                injectImporterInput -> {
                    InjectImporter injectImporter = new InjectImporter();
                    injectImporter.setInjectorContract(mapInjectorContracts.get(injectImporterInput.getInjectorContractId()));
                    injectImporter.setImportTypeValue(injectImporterInput.getInjectTypeValue());
                    injectImporter.setName(injectImporterInput.getName());
                    injectImporter.setRuleAttributes(new ArrayList<>());
                    injectImporterInput.getRuleAttributes().forEach(ruleAttributeInput -> {
                        RuleAttribute ruleAttribute = new RuleAttribute();
                        ruleAttribute.setColumns(ruleAttributeInput.getColumns());
                        ruleAttribute.setName(ruleAttributeInput.getName());
                        ruleAttribute.setDefaultValue(ruleAttributeInput.getDefaultValue());
                        injectImporter.getRuleAttributes().add(ruleAttribute);
                    });
                    importMapper.getInjectImporters().add(injectImporter);
                }
        );

        importMapperRepository.save(importMapper);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/mappers/{mapperId}")
    public ImportMapper updateImportMapper(@PathVariable String mapperId, @Valid @RequestBody MapperUpdateInput mapperUpdateInput) {
        ImportMapper importMapper = importMapperRepository.findById(UUID.fromString(mapperId)).orElseThrow(ElementNotFoundException::new);
        importMapper.setUpdateAttributes(mapperUpdateInput);
        importMapper.setUpdateDate(Instant.now());

        Map<String, InjectorContract> mapInjectorContracts = getMapOfInjectorContracts(
                mapperUpdateInput.getImporters()
                        .stream()
                        .map(InjectImporterUpdateInput::getInjectorContractId)
                        .toList()
        );

        updateInjectImporter(mapperUpdateInput.getImporters(), importMapper.getInjectImporters(), mapInjectorContracts);

        return importMapperRepository.save(importMapper);
    }

    private void updateRuleAttributes(List<RuleAttributeUpdateInput> ruleAttributesInput, List<RuleAttribute> ruleAttributes) {
        // First, we remove the entities that are no longer linked to the mapper
        ruleAttributes.removeIf(ruleAttribute -> !ruleAttributesInput.stream().anyMatch(importerInput -> ruleAttribute.getId().equals(importerInput.getId())));

        // Then we update the existing ones
        ruleAttributes.forEach(ruleAttribute -> {
            Optional<RuleAttributeUpdateInput> ruleAttributeInput = ruleAttributesInput.stream().filter(ruleAttributeUpdateInput -> ruleAttribute.getId().equals(ruleAttributeUpdateInput.getId())).findFirst();
            if (!ruleAttributeInput.isPresent()) {
                throw new ElementNotFoundException();
            }
            ruleAttribute.setUpdateAttributes(ruleAttributeInput.get());
        });

        // Then we add the new ones
        ruleAttributesInput.forEach(ruleAttributeUpdateInput -> {
            if (ruleAttributeUpdateInput.getId() == null || ruleAttributeUpdateInput.getId().isBlank()) {
                RuleAttribute ruleAttribute = new RuleAttribute();
                ruleAttribute.setColumns(ruleAttributeUpdateInput.getColumns());
                ruleAttribute.setName(ruleAttributeUpdateInput.getName());
                ruleAttribute.setDefaultValue(ruleAttributeUpdateInput.getDefaultValue());
                ruleAttributes.add(ruleAttribute);
            }
        });
    }

    private void updateInjectImporter(List<InjectImporterUpdateInput> injectImportersInput, List<InjectImporter> injectImporters, Map<String, InjectorContract> mapInjectorContracts) {
        // First, we remove the entities that are no longer linked to the mapper
        injectImporters.removeIf(importer -> !injectImportersInput.stream().anyMatch(importerInput -> importer.getId().equals(importerInput.getId())));

        // Then we update the existing ones
        injectImporters.forEach(injectImporter -> {
            Optional<InjectImporterUpdateInput> injectImporterInput = injectImportersInput.stream().filter(injectImporterUpdateInput -> injectImporter.getId().equals(injectImporterUpdateInput.getId())).findFirst();
            if (!injectImporterInput.isPresent()) {
                throw new ElementNotFoundException();
            }
            injectImporter.setUpdateAttributes(injectImporterInput.get());
            updateRuleAttributes(injectImporterInput.get().getRuleAttributes(), injectImporter.getRuleAttributes());
        });

        // Then we add the new ones
        injectImportersInput.forEach(injectImporterUpdateInput -> {
            if (injectImporterUpdateInput.getId() == null || injectImporterUpdateInput.getId().isBlank()) {
                InjectImporter injectImporter = new InjectImporter();
                injectImporter.setInjectorContract(mapInjectorContracts.get(injectImporterUpdateInput.getInjectorContractId()));
                injectImporter.setImportTypeValue(injectImporterUpdateInput.getInjectTypeValue());
                injectImporter.setName(injectImporterUpdateInput.getName());
                injectImporter.setRuleAttributes(new ArrayList<>());
                injectImporterUpdateInput.getRuleAttributes().forEach(ruleAttributeInput -> {
                    RuleAttribute ruleAttribute = new RuleAttribute();
                    ruleAttribute.setColumns(ruleAttributeInput.getColumns());
                    ruleAttribute.setName(ruleAttributeInput.getName());
                    ruleAttribute.setDefaultValue(ruleAttributeInput.getDefaultValue());
                    injectImporter.getRuleAttributes().add(ruleAttribute);
                });
                injectImporters.add(injectImporter);
            }
        });
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/mappers/{mapperId}")
    public void deleteImportMapper(@PathVariable String mapperId) {
        importMapperRepository.deleteById(UUID.fromString(mapperId));
    }

    public Map<String, InjectorContract> getMapOfInjectorContracts(List<String> ids) {
        return StreamSupport.stream(injectorContractRepository.findAllById(ids).spliterator(), false)
                .collect(Collectors.toMap(InjectorContract::getId, Function.identity()));
    }
}
