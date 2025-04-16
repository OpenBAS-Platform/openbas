package io.openbas.injects.atomic_testing;

import static java.util.Collections.emptyList;
import static java.util.Collections.emptyMap;
import static org.junit.jupiter.api.Assertions.assertEquals;

import io.openbas.database.model.Endpoint;
import io.openbas.database.raw.RawAsset;
import io.openbas.database.raw.RawAssetGroup;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import io.openbas.utils.AtomicTestingUtils;
import io.openbas.utils.TargetType;
import io.openbas.utils.fixtures.RawAssetFixture;
import io.openbas.utils.fixtures.RawAssetGroupFixture;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AtomicTestingUtilsTest {

  @Test
  @DisplayName("Fetch target results for every target linked to inject")
  void shouldFetchTargetsWithResultsLinkedToInject() {
    // -- PREPARE --
    String asset1Id = "7e3fee31-70ac-4bcc-befb-8c37397f1e25";
    String asset2Id = "8f4rgg31-70ac-4bcc-befb-8f4rgg311e25";
    String assetGroupId = "9p4rgg31-70ac-4bcc-befb-8f4rgg311e25";

    List<String> injectAssets = List.of(asset1Id, asset2Id);

    Map<String, RawAsset> assets =
        Map.of(
            asset1Id,
                RawAssetFixture.createDefaultRawAsset(
                    asset1Id, "raw asset one", Endpoint.PLATFORM_TYPE.Linux),
            asset2Id,
                RawAssetFixture.createDefaultRawAsset(
                    asset2Id, "raw asset two", Endpoint.PLATFORM_TYPE.Windows));

    Map<String, RawAssetGroup> assetGroups =
        Map.of(
            assetGroupId,
            RawAssetGroupFixture.createDefaultRawAssetGroup(
                assetGroupId, "raw asset group one", List.of(asset1Id)));

    // -- EXECUTE --
    List<InjectTargetWithResult> result =
        AtomicTestingUtils.getTargetsWithResultsFromRaw(
            emptyList(),
            injectAssets,
            emptyMap(),
            emptyMap(),
            emptyMap(),
            assets,
            emptyMap(),
            assetGroups);

    // -- ASSERT --
    assertEquals(3, result.size(), "The result should contain three targets");

    assertEquals(
        injectAssets,
        result.stream()
            .filter(target -> target.getTargetType() == TargetType.ASSETS)
            .map(InjectTargetWithResult::getId)
            .toList(),
        "Expected assets to be in the result");

    assertEquals(
        List.of(assetGroupId),
        result.stream()
            .filter(target -> target.getTargetType() == TargetType.ASSETS_GROUPS)
            .map(InjectTargetWithResult::getId)
            .toList(),
        "Expected asset group to be in the result");

    assertEquals(
        1,
        result.stream()
            .filter(target -> target.getTargetType() == TargetType.ASSETS_GROUPS)
            .map(InjectTargetWithResult::getChildren)
            .flatMap(List::stream)
            .count(),
        "Expected asset group to have 1 child");
  }
}
