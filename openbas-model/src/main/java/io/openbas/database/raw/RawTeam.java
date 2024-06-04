package io.openbas.database.raw;

import java.time.Instant;
import java.util.Set;

public interface RawTeam {

    public String getTeam_id();

    public String getTeam_name();

    public String getTeam_description();

    public Instant getTeam_created_at();

    public Instant getTeam_updated_at();

    public String getTeam_organization();

    public boolean getTeam_contextual();

    public Set<String> getTeam_tags();

    public Set<String> getTeam_users();

    public Set<String> getTeam_exercises();

    public Set<String> getTeam_scenarios();

    public Set<String> getTeam_expectations();

    public Set<String> getTeam_exercise_injects();

    public Set<String> getTeam_communications();
}
