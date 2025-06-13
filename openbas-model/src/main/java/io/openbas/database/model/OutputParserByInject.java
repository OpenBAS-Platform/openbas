package io.openbas.database.model;

import jakarta.persistence.*;

public interface OutputParserByInject {

  String getInjectId();

  OutputParser getOutputParser();

  InjectorContract getInjectorContract();
}
