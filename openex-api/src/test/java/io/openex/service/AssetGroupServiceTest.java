package io.openex.service;

import io.openex.database.model.Endpoint;
import io.openex.database.model.AssetGroup;
import io.openex.service.asset.EndpointService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.NoSuchElementException;

import static io.openex.database.model.Endpoint.OS_TYPE.LINUX;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AssetGroupServiceTest {

  @Autowired
  private AssetGroupService assetGroupService;
  @Autowired
  private EndpointService endpointService;

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
  void updateAssetGroupTest() {
    // -- PREPARE --
    Endpoint endpoint = new Endpoint();
    String name = "Personal PC";
    endpoint.setName(name);
    endpoint.setIp("127.0.0.1");
    endpoint.setHostname("hostname");
    endpoint.setOs(LINUX);
    endpoint.setHostname("hostname");
    endpoint.setOs(LINUX);
    Endpoint endpointCreated = this.endpointService.createEndpoint(endpoint);

    AssetGroup assetGroup = this.assetGroupService.assetGroup(ASSET_GROUP_ID);
    String value = "Professional network";
    assetGroup.setName(value);
    assetGroup.setAssets(List.of(endpointCreated));

    // -- EXECUTE --
    AssetGroup assetGroupUpdated = this.assetGroupService.updateAssetGroup(assetGroup);
    assertNotNull(assetGroup);
    assertEquals(value, assetGroupUpdated.getName());
  }

  @DisplayName("Delete asset group")
  @Test
  @Order(4)
  void deleteAssetGroupTest() {
    this.assetGroupService.deleteAssetGroup(ASSET_GROUP_ID);
    assertThrows(NoSuchElementException.class, () -> this.assetGroupService.assetGroup(ASSET_GROUP_ID));
  }
}
