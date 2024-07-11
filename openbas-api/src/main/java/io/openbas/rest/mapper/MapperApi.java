package io.openbas.rest.mapper;

import io.openbas.database.model.ImportMapper;
import io.openbas.database.raw.RawPaginationImportMapper;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.mapper.form.ImportMapperAddInput;
import io.openbas.rest.mapper.form.ImportMapperUpdateInput;
import io.openbas.service.MapperService;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RestController
@RequiredArgsConstructor
public class MapperApi extends RestBehavior {

    private final ImportMapperRepository importMapperRepository;

    private final MapperService mapperService;

    @Secured(ROLE_USER)
    @PostMapping("/api/mappers/search")
    public Page<RawPaginationImportMapper> getImportMapper(@RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
        return buildPaginationJPA(
                this.importMapperRepository::findAll,
                searchPaginationInput,
                ImportMapper.class
        ).map(RawPaginationImportMapper::new);
    }

    @Secured(ROLE_USER)
    @GetMapping("/api/mappers/{mapperId}")
    public ImportMapper getImportMapperById(@PathVariable String mapperId) {
        return importMapperRepository.findById(UUID.fromString(mapperId)).orElseThrow(ElementNotFoundException::new);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/mappers")
    public ImportMapper createImportMapper(@RequestBody @Valid final ImportMapperAddInput importMapperAddInput) {
        return mapperService.createAndSaveImportMapper(importMapperAddInput);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/mappers/{mapperId}")
    public ImportMapper updateImportMapper(@PathVariable String mapperId, @Valid @RequestBody ImportMapperUpdateInput importMapperUpdateInput) {
        return mapperService.updateImportMapper(mapperId, importMapperUpdateInput);
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/mappers/{mapperId}")
    public void deleteImportMapper(@PathVariable String mapperId) {
        importMapperRepository.deleteById(UUID.fromString(mapperId));
    }
}
