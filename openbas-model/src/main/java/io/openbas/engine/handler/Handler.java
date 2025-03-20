package io.openbas.engine.handler;

import io.openbas.engine.model.EsBase;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface Handler<T extends EsBase> {

    List<T> fetch(Optional<Date> from);
}
