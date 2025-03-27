package io.openbas.database.repository;

import io.openbas.database.model.ContractOutputElement;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContractOutputElementRepository
    extends CrudRepository<ContractOutputElement, String>,
        JpaSpecificationExecutor<ContractOutputElement> {

  @Modifying
  @Query("DELETE FROM ContractOutputElement op WHERE op.outputParser.id = ?1 AND op.id NOT IN (?2)")
  void deleteByOutPutParserAndIdNotIn(String outputParserId, List<String> ids);

  @Modifying
  @Query("DELETE FROM ContractOutputElement op WHERE op.outputParser.id = ?1")
  void deleteByOutPutParserId(@NotBlank String outputParserId);
}
