package io.openex.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractSearchInput {

    @Schema(description = "Label Type from contract config")
    String type;

    @Schema(description = "Label contract")
    String label;

    @Builder.Default
    @Schema(description = "Indicate if the contract can be exposed")
    boolean exposedContractsOnly = true;

    @Schema(description = "Text to search within contract attributes such as fields, config.label, and label")
    String textSearch;

}
