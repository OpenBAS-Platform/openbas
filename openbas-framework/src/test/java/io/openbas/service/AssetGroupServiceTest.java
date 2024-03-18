package io.openbas.service;

import io.openbas.asset.AssetGroupService;
import io.openbas.asset.EndpointService;
import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.TagRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import static io.openbas.database.model.Endpoint.PLATFORM_TYPE.Linux;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AssetGroupServiceTest {

  @Autowired
  private AssetGroupService assetGroupService;
  @Autowired
  private EndpointService endpointService;
  @Autowired
  private TagRepository tagRepository;

  static String ASSET_GROUP_ID;

  @DisplayName("Create asset group")
  @Test
  @Order(1)
  void createAssetGroupTest() {
    // -- PREPARE --
    AssetGroup assetGroup = new AssetGroup();
    String name = "Personal network";
    assetGroup.setName(name);

    // -- EXECUTE --
    AssetGroup assetGroupCreated = this.assetGroupService.createAssetGroup(assetGroup);
    ASSET_GROUP_ID = assetGroupCreated.getId();
    assertNotNull(assetGroupCreated);
    assertNotNull(assetGroupCreated.getId());
    assertNotNull(assetGroupCreated.getCreatedAt());
    assertNotNull(assetGroupCreated.getUpdatedAt());
    assertEquals(name, assetGroupCreated.getName());
  }

  @DisplayName("Retrieve asset group")
  @Test
  @Order(2)
  void retrieveAssetGroupTest() {
    AssetGroup assetGroup = this.assetGroupService.assetGroup(ASSET_GROUP_ID);
    assertNotNull(assetGroup);

    List<AssetGroup> assetGroups = this.assetGroupService.assetGroups();
    assertNotNull(assetGroups);
    assertEquals(ASSET_GROUP_ID, assetGroups.get(0).getId());
  }

  @DisplayName("Update asset group")
  @Test
  @Order(3)
  @Transactional
  void updateAssetGroupTest() {
    // -- PREPARE --
    Endpoint endpoint = new Endpoint();
    String name = "Personal PC";
    endpoint.setName(name);
    endpoint.setIps(new String[]{"127.0.0.1"});
    endpoint.setHostname("hostname");
    endpoint.setPlatform(Linux);
    Endpoint endpointCreated = this.endpointService.createEndpoint(endpoint);

    AssetGroup assetGroup = this.assetGroupService.assetGroup(ASSET_GROUP_ID);
    String value = "Professional network";
    assetGroup.setName(value);
    assetGroup.setAssets(new ArrayList<>() {{add(endpointCreated);}});

    // -- EXECUTE --
    AssetGroup assetGroupUpdated = this.assetGroupService.updateAssetGroup(assetGroup);
    assertNotNull(assetGroupUpdated);
    assertEquals(value, assetGroupUpdated.getName());
    assertEquals(1, assetGroupUpdated.getAssets().size());

    // -- CLEAN --
    assetGroupUpdated.setAssets(new ArrayList<>());
    this.assetGroupService.updateAssetGroup(assetGroup);
    this.endpointService.deleteEndpoint(endpointCreated.getId());
  }

  @Test
  @Order(4)
  void updateAssetsOnAssetGroupTest() {
    // -- PREPARE --
    Endpoint endpoint = new Endpoint();
    String name = "Personal PC";
    endpoint.setName(name);
    endpoint.setIps(new String[]{"127.0.0.1"});
    endpoint.setHostname("hostname");
    endpoint.setPlatform(Linux);
    Endpoint endpointCreated = this.endpointService.createEndpoint(endpoint);
    AssetGroup assetGroup = this.assetGroupService.assetGroup(ASSET_GROUP_ID);

    // -- EXECUTE --
    AssetGroup assetGroupUpdated = this.assetGroupService.updateAssetsOnAssetGroup(assetGroup, List.of(endpointCreated.getId()));
    assertNotNull(assetGroupUpdated);
    assertEquals(1, assetGroupUpdated.getAssets().size());

    List<Asset> assets = this.assetGroupService.assetsFromAssetGroup(ASSET_GROUP_ID);
    assertEquals(1, assets.size());

    // -- CLEAN --
    this.endpointService.deleteEndpoint(endpointCreated.getId());
  }

  @DisplayName("Update asset group with tag")
  @Test
  @Order(5)
  void updateAssetGroupWithTagTest() {
    // -- PREPARE --
    Tag tag = new Tag();
    String tagName = "endpoint";
    tag.setName(tagName);
    tag.setColor("blue");
    Tag tagCreated = this.tagRepository.save(tag);
    AssetGroup assetGroup = this.assetGroupService.assetGroup(ASSET_GROUP_ID);
    assetGroup.setTags(List.of(tagCreated));

    // -- EXECUTE --
    AssetGroup assetGroupUpdated = this.assetGroupService.updateAssetGroup(assetGroup);
    assertNotNull(assetGroupUpdated);
    assertEquals(tagName, assetGroupUpdated.getTags().get(0).getName());

    // -- CLEAN --
    this.tagRepository.delete(tag);
  }

  @DisplayName("Delete asset group")
  @Test
  @Order(6)
  void deleteAssetGroupTest() {
    this.assetGroupService.deleteAssetGroup(ASSET_GROUP_ID);
    assertThrows(NoSuchElementException.class, () -> this.assetGroupService.assetGroup(ASSET_GROUP_ID));
  }
}
