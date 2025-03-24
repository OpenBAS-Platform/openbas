package io.openbas.engine.handler;

import io.openbas.database.raw.RawFinding;
import io.openbas.database.repository.FindingRepository;
import io.openbas.engine.model.EsFinding;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FindingHandler implements Handler<EsFinding> {

  private FindingRepository findingRepository;

  @Autowired
  public void setFindingRepository(FindingRepository findingRepository) {
    this.findingRepository = findingRepository;
  }

  @Override
  public List<EsFinding> fetch(Instant from) {
    Instant queryFrom = from != null ? from : Instant.ofEpochMilli(0);
    List<RawFinding> forIndexing = findingRepository.findForIndexing(queryFrom);
    return forIndexing.stream()
        .map(
            finding -> {
              EsFinding esFinding = new EsFinding();
              esFinding.setBase_id(finding.getFinding_id());
              esFinding.setBase_representative(finding.getFinding_value());
              esFinding.setFinding_type(finding.getFinding_type());
              esFinding.setBase_created_at(finding.getFinding_created_at());
              esFinding.setBase_updated_at(finding.getFinding_updated_at());
              esFinding.setFinding_field(finding.getFinding_field());
              esFinding.setFinding_value(finding.getFinding_value());
              esFinding.setFinding_inject_side(finding.getFinding_inject_id());
              esFinding.setFinding_scenario_side(finding.getInject_scenario());
              esFinding.setBase_dependencies(
                  List.of(finding.getFinding_inject_id(), finding.getInject_scenario()));
              return esFinding;
            })
        .toList();
  }
}
