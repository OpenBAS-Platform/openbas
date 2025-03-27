package io.openbas.database.repository;

import io.openbas.database.model.OutputParser;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OutputParserRepository
    extends CrudRepository<OutputParser, String>, JpaSpecificationExecutor<OutputParser> {

  @Modifying
  @Query("DELETE FROM OutputParser op WHERE op.payload.id = ?1 AND op.id NOT IN (?2)")
  void deleteByPayloadIdAndIdNotIn(String payloadId, List<String> ids);

  @Modifying
  @Query("DELETE FROM OutputParser op WHERE op.payload.id = ?1")
  void deleteByPayloadId(@NotBlank String id);
}
