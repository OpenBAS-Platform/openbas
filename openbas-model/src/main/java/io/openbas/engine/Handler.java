package io.openbas.engine;

import io.openbas.engine.model.EsBase;
import java.time.Instant;
import java.util.List;

public interface Handler<T extends EsBase> {

  List<T> fetch(Instant from);
}
