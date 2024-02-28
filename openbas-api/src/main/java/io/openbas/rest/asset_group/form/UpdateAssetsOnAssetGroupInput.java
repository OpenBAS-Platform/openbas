package io.openbas.rest.asset_group.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateAssetsOnAssetGroupInput {

  @JsonProperty("asset_group_assets")
  private List<String> assetIds;

}
