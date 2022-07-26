package io.openex.model.expectation;

import io.openex.database.model.InjectExpectation;
import io.openex.model.Expectation;

public class TextExpectation implements Expectation {
    @Override
    public InjectExpectation.EXPECTATION_TYPE type() {
        return InjectExpectation.EXPECTATION_TYPE.TEXT;
    }
}
