package io.openbas.engine.model.simulation;

import static io.openbas.engine.EsUtils.buildRestrictions;

import io.openbas.database.raw.RawSimulation;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.engine.Handler;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class SimulationHandler implements Handler<EsSimulation> {

  private final ExerciseRepository simulationRepository;

  @Override
  public List<EsSimulation> fetch(Instant from) {
    Instant queryFrom = from != null ? from : Instant.ofEpochMilli(0);
    List<RawSimulation> forIndexing = simulationRepository.findForIndexing(queryFrom);
    return forIndexing.stream()
        .map(
            simulation -> {
              EsSimulation esSimulation = new EsSimulation();
              // Base
              esSimulation.setBase_id(simulation.getExercise_id());
              esSimulation.setBase_created_at(simulation.getExercise_created_at());
              esSimulation.setBase_updated_at(simulation.getExercise_updated_at());
              esSimulation.setBase_representative(simulation.getExercise_name());
              esSimulation.setBase_restrictions(buildRestrictions(simulation.getExercise_id()));
              // Specific
              return esSimulation;
            })
        .toList();
  }
}
