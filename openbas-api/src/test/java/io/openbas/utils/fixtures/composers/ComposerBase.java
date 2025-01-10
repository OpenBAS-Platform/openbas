package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Document;

import java.util.ArrayList;
import java.util.List;

public class ComposerBase<T> {
    public List<T> generatedItems = new ArrayList<>();

    public void reset() {
        generatedItems.clear();
    }
}
