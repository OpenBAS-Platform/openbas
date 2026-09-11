package io.openaev.ocsf;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

import io.openaev.ocsf.schema.v190.OcsfClassUid;
import io.openaev.ocsf.schema.v190.OcsfFilter;
import io.openaev.ocsf.schema.v190.datatypes.OcsfDatatypeStringT;
import io.openaev.utils.fixtures.ProwlerOcsfOutputFixture;
import java.io.IOException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class OcsfFilterTest {
  @Test
  @DisplayName(
      "Given detection findings from prowler output, then the parser correctly creates objects from it")
  void given_detectionFindingsFromProwlerOutput_then_parserCorrectlyCreatesObjectsFromIt()
      throws IOException {
    assertThat(
            new OcsfFilter()
                .filterOcsfClassDetectionFindings(
                    ProwlerOcsfOutputFixture.getProwlerOcsfOutputTrace()))
        .hasSize(3)
        .allSatisfy(
            finding ->
                assertThat(finding)
                    .satisfies(
                        f ->
                            assertThat(f.getMetadataField().getVersionField())
                                .isEqualTo(new OcsfDatatypeStringT("1.5.0")))
                    .satisfies(
                        f ->
                            assertThat(f.getClassUidField().getValue())
                                .isEqualTo(OcsfClassUid.DETECTION_FINDING.getValue())));
  }
}
