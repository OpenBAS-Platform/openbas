package io.openbas.rest.atomictesting.form;

import io.openbas.rest.atomictesting.form.AtomicTestingMapper.TARGET_TYPE;
import java.util.List;

public record BasicTarget(TARGET_TYPE type, List<String> names) {

}
