package io.openex.rest.asset_group;

import io.openex.database.model.AssetGroup;
import io.openex.rest.asset_group.form.AssetGroupInput;
import io.openex.service.AssetGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import java.util.List;

import static io.openex.database.model.User.ROLE_ADMIN;

@RestController
@RequiredArgsConstructor
public class AssetGroupApi {

  public static final String ASSET_GROUP_URI = "/api/asset_groups";

  private final AssetGroupService assetGroupService;

  @PostMapping(ASSET_GROUP_URI)
  @RolesAllowed(ROLE_ADMIN)
  public AssetGroup createAssetGroup(@Valid @RequestBody final AssetGroupInput input) {
    AssetGroup assetGroup = new AssetGroup();
    assetGroup.setUpdateAttributes(input);
    return this.assetGroupService.createAssetGroup(assetGroup);
  }

  @GetMapping(ASSET_GROUP_URI)
  @PreAuthorize("isObserver()")
  public List<AssetGroup> assetGroups() {
    return this.assetGroupService.assetGroups();
  }

  @PutMapping(ASSET_GROUP_URI + "/{assetGroupId}")
  @RolesAllowed(ROLE_ADMIN)
  public AssetGroup updateAssetGroup(
      @PathVariable @NotBlank final String assetGroupId,
      @Valid @RequestBody final AssetGroupInput input) {
    AssetGroup assetGroup = this.assetGroupService.assetGroup(assetGroupId);
    assetGroup.setUpdateAttributes(input);
    return this.assetGroupService.updateAssetGroup(assetGroup);
  }

  @DeleteMapping(ASSET_GROUP_URI + "/{assetGroupId}")
  @RolesAllowed(ROLE_ADMIN)
  public void deleteAssetGroup(@PathVariable @NotBlank final String assetGroupId) {
    this.assetGroupService.deleteAssetGroup(assetGroupId);
  }

}
