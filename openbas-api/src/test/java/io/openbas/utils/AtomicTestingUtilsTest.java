package io.openbas.utils;

import static io.openbas.expectation.ExpectationType.*;
import static java.util.Collections.emptyList;
import static java.util.Collections.emptyMap;

import io.openbas.database.raw.RawAsset;
import io.openbas.database.repository.*;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AtomicTestingUtilsTest {

  @Test
  @DisplayName("Should get calculated global scores for injects")
  void getTargetsWithResultsFromRaw() {
    // -- PREPARE --
    List<String> injectAssets = List.of("7e3fee31-70ac-4bcc-befb-8c37397f1e25");
    Map<String, RawAsset> assetMap = new HashMap<>();
    assetMap.put("7e3fee31-70ac-4bcc-befb-8c37397f1e25", RawAssetFixture.getAsset());

    // -- EXECUTE --

    List<InjectTargetWithResult> result =
        AtomicTestingUtils.getTargetsWithResultsFromRaw(
            emptyList(), injectAssets, emptyMap(), emptyMap(), assetMap, emptyMap(), emptyMap());
    // -- ASSERT --

  }
}
