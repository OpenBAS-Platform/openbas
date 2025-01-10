package io.openbas.utils.fixtures;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

public class Store<T> {
  public List<T> items = new ArrayList<>();

  public T memorise(Supplier<T> f) {
    T result = f.get();
    items.add(result);
    return result;
  }
}
