package io.openbas.database.raw;

import java.util.List;
import java.util.Set;

public interface RawInject {

    public String getInject_id();

    public String getAsset_group_id();

    public List<String> getInject_teams();

    public List<String> getInject_assets();

    public List<String> getInject_asset_groups();

    public List<String> getInject_expectations();

    public Set<String> getInject_communications();

    public Set<String> getInject_platforms();

    public Set<String> getInject_kill_chain_phases();

    public String getStatus_name();

}
