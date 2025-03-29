package io.openbas.engine.model.inject;

import static io.openbas.engine.EsUtils.buildRestrictions;

import io.openbas.database.raw.RawInjectIndexing;
import io.openbas.database.repository.InjectRepository;
import io.openbas.engine.Handler;
import java.time.Instant;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class InjectHandler implements Handler<EsInject> {

  private InjectRepository injectRepository;

  @Autowired
  public void setInjectRepository(InjectRepository injectRepository) {
    this.injectRepository = injectRepository;
  }

  @Override
  public List<EsInject> fetch(Instant from) {
    Instant queryFrom = from != null ? from : Instant.ofEpochMilli(0);
    List<RawInjectIndexing> forIndexing = injectRepository.findForIndexing(queryFrom);
    return forIndexing.stream()
        .map(
            inject -> {
              EsInject esInject = new EsInject();
              // Base
              esInject.setBase_id(inject.getInject_id());
              esInject.setBase_representative(inject.getInject_title());
              esInject.setBase_created_at(inject.getInject_created_at());
              esInject.setBase_updated_at(inject.getInject_updated_at());
              esInject.setBase_restrictions(
                  buildRestrictions(inject.getInject_scenario(), inject.getInject_Exercise()));
              // Specific
              esInject.setInject_title(inject.getInject_title());
              esInject.setInject_status(inject.getInject_status_name());
              esInject.setInject_scenario_side(inject.getInject_scenario());
              esInject.setInject_simulation_side(inject.getInject_Exercise());
              esInject.setAttack_patterns_side(inject.getInject_attack_patterns());
              esInject.setKill_chain_phases_side(inject.getInject_kill_chain_phases());
              esInject.setContract_side(inject.getInject_injector_contract());
              return esInject;
            })
        .toList();
  }
}
