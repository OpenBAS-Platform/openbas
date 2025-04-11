package io.openbas.utils;

import io.openbas.database.model.AssetGroup;
import io.openbas.rest.asset_group.form.AssetGroupSimple;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AssetGroupMapper {

  public AssetGroupSimple toAssetGroupSimple(AssetGroup assetGroup) {
    return AssetGroupSimple.builder()
        .id(assetGroup.getId())
        .name(assetGroup.getName())
        .tags(assetGroup.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet()))
        .build();
  }
}
