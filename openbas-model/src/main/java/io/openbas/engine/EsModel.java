package io.openbas.engine;

import io.openbas.config.EngineConfig;
import io.openbas.engine.handler.Handler;
import io.openbas.engine.model.EsBase;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsModel<T extends EsBase> {
  private String name;
  private Class<T> model;
  private Handler<T> handler;

  public EsModel(String name, Class<T> model, Handler<T> handler) {
    this.name = name;
    this.model = model;
    this.handler = handler;
  }

  public String getIndex(EngineConfig engineConfig) {
    return engineConfig.getIndexPrefix() + "_" + this.name;
  }
}
