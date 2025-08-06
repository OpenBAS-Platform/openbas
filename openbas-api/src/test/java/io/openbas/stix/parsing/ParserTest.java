package io.openbas.stix.parsing;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import io.openbas.IntegrationTest;
import io.openbas.stix.objects.Bundle;
import io.openbas.stix.types.Identifier;
import jakarta.transaction.Transactional;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
public class ParserTest extends IntegrationTest {
  @Test
  public void testParse() throws Exception {
    try (FileInputStream fis =
        //new FileInputStream("src/test/resources/stix/bundles/report_stix_bundle_origin.json")) {
        new FileInputStream("src/test/resources/stix/bundles/2025-08-04t19_28_29.749z_tlp_all_(exportfilestix2)_report-eset pipemon may 2020_full.json")) {
      String contents = IOUtils.toString(fis, StandardCharsets.UTF_8);
      Parser parser = new Parser();
      Bundle b = parser.parseBundle(contents);
      assertThat(b).isNotNull();
    }
  }

  @Test
  public void equality() throws Exception {
    Identifier id1 = new Identifier("1");
    Identifier id2 = new Identifier("1");

    assertThat(id1).isEqualTo(id2);
  }
}
