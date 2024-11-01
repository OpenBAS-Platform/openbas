package io.openbas.database.raw;

import java.util.Set;

public interface RawScenario {

  public String getScenario_id();

  public String getScenario_name();

  public String getScenario_subtitle();

  public Set<String> getScenario_tags();

  public Set<String> getScenario_injects();
}
