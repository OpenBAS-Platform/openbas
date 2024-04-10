package io.openbas.rest.atomic_testing.form;

import io.openbas.rest.atomic_testing.form.AtomicTestingMapper.TARGET_TYPE;
import java.util.List;

public record BasicTarget(TARGET_TYPE type, List<String> names) {

}
