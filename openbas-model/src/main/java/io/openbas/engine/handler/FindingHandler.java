package io.openbas.engine.handler;

import static io.openbas.engine.model.EsFinding.FINDING_TYPE;

import io.openbas.database.raw.RawFinding;
import io.openbas.database.repository.FindingRepository;
import io.openbas.engine.model.EsFinding;
import java.time.Instant;
import java.util.ArrayList;
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
    List<EsFinding> data = new ArrayList<>();
    Instant queryFrom = from != null ? from : Instant.ofEpochMilli(0);
    List<RawFinding> forIndexing = findingRepository.findForIndexing(queryFrom);
    if (!forIndexing.isEmpty()) {
      for (RawFinding finding : forIndexing) {
        EsFinding esFinding = new EsFinding();
        esFinding.setId(finding.getFinding_id());
        esFinding.setType(FINDING_TYPE);
        esFinding.setCreated_at(finding.getFinding_created_at());
        esFinding.setUpdated_at(finding.getFinding_updated_at());
        esFinding.setField(finding.getFinding_field());
        esFinding.setValue(finding.getFinding_value());
        esFinding.setInject(finding.getFinding_inject_id());
        esFinding.setScenario(finding.getInject_scenario());
        esFinding.setDependencies(
            List.of(finding.getFinding_inject_id(), finding.getInject_scenario()));
        data.add(esFinding);
      }
    }
    return data;
  }
}
