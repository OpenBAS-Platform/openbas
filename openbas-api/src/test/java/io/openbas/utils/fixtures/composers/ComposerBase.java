package io.openbas.utils.fixtures.composers;

import java.util.ArrayList;
import java.util.List;

public class ComposerBase<T> {
  public List<T> generatedItems = new ArrayList<>();
  public List<InnerComposerBase<T>> generatedComposer = new ArrayList<>();

  public void reset() {
    generatedItems.clear();
    generatedComposer.clear();
  }
}
