package io.openex.model.expectation;

import io.openex.database.model.Article;
import io.openex.database.model.InjectExpectation;
import io.openex.model.Expectation;

public record MediaExpectation(Article article) implements Expectation {
    @Override
    public InjectExpectation.EXPECTATION_TYPE type() {
        return InjectExpectation.EXPECTATION_TYPE.ARTICLE;
    }
}
