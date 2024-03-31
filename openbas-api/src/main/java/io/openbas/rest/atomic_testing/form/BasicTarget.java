package io.openbas.rest.atomic_testing.form;

import io.openbas.rest.atomic_testing.form.AtomicTestingMapper.TargetType;
import java.util.List;

public record BasicTarget(TargetType type, List<String> names) {

}
