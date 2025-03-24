package io.openbas.engine;

import io.openbas.annotation.Indexable;
import io.openbas.config.EngineConfig;
import io.openbas.engine.model.EsBase;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsModel<T extends EsBase> {
  private String name;
  private String label;
  private Class<T> model;
  private Handler<T> handler;

  public EsModel(Class<T> model, Handler<T> handler) {
    this.name = model.getAnnotation(Indexable.class).index();
    this.label = model.getAnnotation(Indexable.class).label();
    this.model = model;
    this.handler = handler;
  }

  public String getIndex(EngineConfig engineConfig) {
    return engineConfig.getIndexPrefix() + "_" + this.name;
  }
}
