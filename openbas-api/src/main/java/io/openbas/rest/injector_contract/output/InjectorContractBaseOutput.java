package io.openbas.rest.injector_contract.output;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.InjectorContract;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InjectorContractBaseOutput {
  @Schema(description = "Injector contract Id")
  @JsonProperty("injector_contract_id")
  @NotBlank
  private String id;

  @Schema(description = "Injector contract external Id")
  @JsonProperty("injector_contract_external_id")
  private String externalId;

  @Schema(description = "Timestamp when the injector contract was last updated")
  @JsonProperty("injector_contract_updated_at")
  @NotNull
  private Instant updatedAt;

  public InjectorContractBaseOutput(String id, String externalId, Instant updatedAt) {
    this.setId(id);
    this.setExternalId(externalId);
    this.setUpdatedAt(updatedAt);
  }

  public static InjectorContractBaseOutput fromInjectorContract(InjectorContract sourceContract) {
    return new InjectorContractBaseOutput(
        sourceContract.getId(), sourceContract.getExternalId(), sourceContract.getUpdatedAt());
  }
}
