package io.openex.service;

import io.openex.database.model.Asset;
import io.openex.database.model.AssetGroup;
import io.openex.database.repository.AssetGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

import static io.openex.helper.StreamHelper.fromIterable;
import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class AssetGroupService {

  private final AssetGroupRepository assetGroupRepository;

  // -- ASSET GROUP --

  public AssetGroup createAssetGroup(@NotNull final AssetGroup assetGroup) {
    return this.assetGroupRepository.save(assetGroup);
  }

  public AssetGroup assetGroup(@NotBlank final String assetGroupId) {
    return this.assetGroupRepository.findById(assetGroupId).orElseThrow();
  }

  public List<AssetGroup> assetGroups() {
    return fromIterable(this.assetGroupRepository.findAll());
  }

  public AssetGroup updateAssetGroup(@NotNull final AssetGroup assetGroup) {
    assetGroup.setUpdatedAt(now());
    return this.assetGroupRepository.save(assetGroup);
  }

  public void deleteAssetGroup(@NotBlank final String assetGroupId) {
    this.assetGroupRepository.deleteById(assetGroupId);
  }

  // -- ASSET --

  public List<Asset> assetsFromAssetGroup(@NotBlank final String assetGroupId) {
    return this.assetGroupRepository.assetsFromAssetGroup(assetGroupId);
  }

}
