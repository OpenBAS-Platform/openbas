package io.openbas.database.raw;

import java.time.Instant;
import java.util.Set;

public interface RawScenario {

  public String getScenario_id();

  public String getScenario_name();

  Instant getScenario_created_at();

  Instant getScenario_updated_at();

  public String getScenario_subtitle();

  public Set<String> getScenario_tags();

  public Set<String> getScenario_injects();
}
