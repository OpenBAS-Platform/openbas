package io.openex.database.repository;

import io.openex.database.model.Asset;
import io.openex.database.model.AssetGroup;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotBlank;
import java.util.List;

@Repository
public interface AssetGroupRepository extends CrudRepository<AssetGroup, String> {

  @Query("select asset from Asset asset "
      + "inner join AssetGroupAsset aga on aga.assetId = asset.id "
      + "inner join AssetGroup assetGroup on aga.assetGroupId = assetGroup.id "
      + "where assetGroup.id = :assetGroupId")
  List<Asset> assetsFromAssetGroup(@NotBlank @Param("assetGroupId") final String assetGroupId);

}
