package io.openbas.utils;

import static io.openbas.utils.ExpectationUtils.getPreventionExpectationList;
import static java.util.Collections.emptyList;
import static java.util.Collections.emptyMap;
import static org.junit.jupiter.api.Assertions.assertEquals;

import io.openbas.database.model.Asset;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.raw.RawAsset;
import io.openbas.database.raw.RawAssetGroup;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import io.openbas.utils.fixtures.*;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExpectationUtilsTest {

  @Test
  @DisplayName("Build expectations with the signature parent process name for obas implant")
  void shouldBuildExpectationsWithSignatureParentProcessNameForObasImplant_Prevention() {
    // -- PREPARE --
    Asset asset= AssetFixture.createDefaultAsset("Asset toto");
    InjectorContract injectorContract = InjectorContractFixture.createDefaultInjectorContract();
    Inject inject= InjectFixture.createTechnicalInject(injectorContract, "Inject 0", asset);

    PreventionExpectation preventionExpectation = ExpectationFixture.createTechnicalPreventionExpectationForAsset(asset, 60L);

    // -- EXECUTE --
    List<PreventionExpectation> preventionExpectations = getPreventionExpectationList(asset, inject, preventionExpectation);

    // -- ASSERT --

  }
}
