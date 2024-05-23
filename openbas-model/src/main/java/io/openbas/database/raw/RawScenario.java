package io.openbas.database.raw;

import java.util.List;

public interface RawScenario {

    public String getScenario_id();
    public String getScenario_name();
    public String getScenario_subtitle();
    public List<String> getScenario_tags();

}
