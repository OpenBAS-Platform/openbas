package io.openbas.engine;

import static io.openbas.engine.model.EsFinding.FINDING_TYPE;
import static io.openbas.engine.model.EsScenario.SCENARIO_TYPE;

import io.openbas.engine.handler.FindingHandler;
import io.openbas.engine.handler.ScenarioHandler;
import io.openbas.engine.model.EsFinding;
import io.openbas.engine.model.EsScenario;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
public class EsEngine {

  private ApplicationContext context;

  @Autowired
  public void setContext(ApplicationContext context) {
    this.context = context;
  }

  public List<EsModel<?>> getModels() {
    List<EsModel<?>> models = new ArrayList<>();
    models.add(new EsModel<>(FINDING_TYPE, EsFinding.class, context.getBean(FindingHandler.class)));
    models.add(
        new EsModel<>(SCENARIO_TYPE, EsScenario.class, context.getBean(ScenarioHandler.class)));
    return models;
  }
}
