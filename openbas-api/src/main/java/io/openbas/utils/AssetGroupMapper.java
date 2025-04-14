package io.openbas.utils;

import io.openbas.database.model.AssetGroup;
import io.openbas.rest.asset_group.form.AssetGroupSimple;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AssetGroupMapper {

  public AssetGroupSimple toAssetGroupSimple(AssetGroup assetGroup) {
    return AssetGroupSimple.builder().id(assetGroup.getId()).name(assetGroup.getName()).build();
  }
}
