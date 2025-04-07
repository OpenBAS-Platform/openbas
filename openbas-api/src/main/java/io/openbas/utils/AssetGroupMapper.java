package io.openbas.utils;

import io.openbas.database.model.AssetGroup;
import io.openbas.rest.asset_group.form.AssetGroupOutput;
import io.openbas.rest.asset_group.form.AssetGroupSimple;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AssetGroupMapper {

  public AssetGroupOutput toAssetGroupOutput(AssetGroup assetGroup) {
    return AssetGroupOutput.builder()
        .id(assetGroup.getId())
        .name(assetGroup.getName())
        .description(assetGroup.getDescription())
        .dynamicFilter(assetGroup.getDynamicFilter())
        .assets(
            assetGroup.getAssets().stream().map(asset -> asset.getId()).collect(Collectors.toSet()))
        .tags(assetGroup.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet()))
        .build();
  }

  public AssetGroupSimple toAssetGroupSimple(AssetGroup assetGroup) {
    return AssetGroupSimple.builder()
        .id(assetGroup.getId())
        .name(assetGroup.getName())
        .dynamicFilter(assetGroup.getDynamicFilter())
        .tags(assetGroup.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet()))
        .build();
  }
}
