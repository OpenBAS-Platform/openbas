package io.openbas.rest.atomic_testing.form;

import io.openbas.rest.atomic_testing.form.AtomicTestingMapper.TargetType;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BasicTarget(@NotNull TargetType type, @NotNull List<String> names) {

}
