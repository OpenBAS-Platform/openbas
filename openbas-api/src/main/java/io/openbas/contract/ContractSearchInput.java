package io.openbas.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;

import static io.openbas.contract.ContractService.TYPE;

@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractSearchInput {

    @Schema(description = "Label Type from contract config")
    String type;

    @Schema(description = "Label contract")
    String label;

    @Schema(description = "Indicate if the contract can be exposed")
    boolean exposedContractsOnly = true;

    @Schema(description = "Text to search within contract attributes such as fields, config.label, and label")
    String textSearch;

    @Schema(description = "List of sort fields : a field is composed of a property (for instance \"label\" and an optional direction (\"asc\" is assumed if no direction is specified) : (\"desc\", \"asc\")")
    List<SortField> sorts = new ArrayList<>();

    public Sort getSort() {
        List<Sort.Order> orders;

        if (null == sorts || sorts.isEmpty()) {
            orders = List.of(new Sort.Order(Sort.DEFAULT_DIRECTION, TYPE));
        } else {
            orders = sorts.stream().map(field -> {
                String property = field.property();
                Sort.Direction direction = Sort.DEFAULT_DIRECTION;
                if (null != field.direction()) {
                    String directionString = field.direction();
                    direction = Sort.Direction.fromOptionalString(directionString).orElse(Sort.DEFAULT_DIRECTION);
                }
                return new Sort.Order(direction, property);
            }).toList();
        }

        return Sort.by(orders);
    }
}
