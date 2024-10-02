package io.openbas.database.raw;

import java.util.List;

public interface RawAssetGroupForCompute {

    public String getAsset_group_id();
    public String getAsset_group_name();
    public List<RawAsset> getAsset_ids();
    public List<RawAsset> getDynamicAsset_ids();

}
