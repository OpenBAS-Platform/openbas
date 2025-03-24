package io.openbas.engine;

import io.openbas.engine.model.finding.EsFinding;
import io.openbas.engine.model.finding.FindingHandler;
import io.openbas.engine.model.inject.EsInject;
import io.openbas.engine.model.inject.InjectHandler;
import io.openbas.engine.model.scenario.EsScenario;
import io.openbas.engine.model.scenario.ScenarioHandler;
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
    models.add(new EsModel<>(EsFinding.class, context.getBean(FindingHandler.class)));
    models.add(new EsModel<>(EsScenario.class, context.getBean(ScenarioHandler.class)));
    models.add(new EsModel<>(EsInject.class, context.getBean(InjectHandler.class)));
    return models;
  }
}
