package io.openbas.database.raw;

import java.util.List;
import java.util.Set;

public interface RawInject {

    String getInject_id();

    String getAsset_group_id();

    List<String> getInject_teams();

    List<String> getInject_assets();

    List<String> getInject_asset_groups();

    List<String> getInject_expectations();

    public Set<String> getInject_communications();

    public Set<String> getInject_platforms();

    public Set<String> getInject_kill_chain_phases();

    public String getStatus_name();

    public String getInject_scenario();

}
