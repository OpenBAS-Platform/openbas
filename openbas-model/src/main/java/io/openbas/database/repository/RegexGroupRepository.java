package io.openbas.database.repository;

import io.openbas.database.model.RegexGroup;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegexGroupRepository
    extends CrudRepository<RegexGroup, String>, JpaSpecificationExecutor<RegexGroup> {

  @Modifying
  @Query("DELETE FROM RegexGroup op WHERE op.contractOutputElement.id = ?1 AND op.id NOT IN (?2)")
  void deleteByContractOutputElementAndIdNotIn(String contractOutputElementId, List<String> ids);

  @Modifying
  @Query("DELETE FROM RegexGroup op WHERE op.contractOutputElement.id = ?1")
  void deleteByContractOutputElementId(@NotBlank String contractOutputElementId);
}
