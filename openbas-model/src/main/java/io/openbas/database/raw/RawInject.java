package io.openbas.database.raw;

import java.util.List;

public interface RawInject {

    public String getInject_id();

    public String getAsset_group_id();

    public List<String> getInject_teams();

    public List<String> getInject_assets();

    public List<String> getInject_asset_groups();

    public List<String> getInject_expectations();

}
