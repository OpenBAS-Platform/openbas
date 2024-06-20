package io.openbas.database.raw;

import io.openbas.database.model.ImportMapper;
<<<<<<< HEAD
import jakarta.validation.constraints.NotBlank;
=======
>>>>>>> f8ddf4990 ([backend] Adding PUT to the mappers endpoint)
import lombok.Data;

import java.time.Instant;

@Data
public class RawPaginationImportMapper {

<<<<<<< HEAD
    @NotBlank
=======
>>>>>>> f8ddf4990 ([backend] Adding PUT to the mappers endpoint)
    String import_mapper_id;
    String import_mapper_name;
    Instant import_mapper_created_at;
    Instant import_mapper_updated_at;

    public RawPaginationImportMapper(final ImportMapper importMapper) {
        this.import_mapper_id = importMapper.getId();
        this.import_mapper_name = importMapper.getName();
        this.import_mapper_created_at = importMapper.getCreationDate();
        this.import_mapper_updated_at = importMapper.getUpdateDate();
    }
}
