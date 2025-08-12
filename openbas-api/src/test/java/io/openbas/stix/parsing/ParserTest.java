package io.openbas.stix.parsing;

import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.stix.objects.Bundle;
import io.openbas.stix.types.*;
import io.openbas.stix.types.inner.ExternalReference;
import jakarta.transaction.Transactional;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import net.javacrumbs.jsonunit.core.Option;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
public class ParserTest extends IntegrationTest {
  @Autowired private ObjectMapper mapper;

  @Test
  public void testParse() throws Exception {
    try (FileInputStream fis =
        // new FileInputStream("src/test/resources/stix/bundles/report_stix_bundle_origin.json")) {
        new FileInputStream("src/test/resources/stix/bundles/report_stix_bundle_origin.json")) {
      String contents = IOUtils.toString(fis, StandardCharsets.UTF_8);
      Parser parser = new Parser();
      Bundle b = parser.parseBundle(contents);

      assertThatJson(b.toStix(mapper).toString())
          .when(Option.IGNORING_ARRAY_ORDER)
          .isEqualTo(contents);
    }
  }

  @Test
  public void testListtoStix() throws Exception {
    List<StixString> list = new List<>(java.util.List.of(new StixString("Heyooo")));

    assertThatJson(list.toStix(mapper).toPrettyString())
        .when(Option.IGNORING_ARRAY_ORDER)
        .isEqualTo("[\"Heyooo\"]");
  }

  @Test
  public void testListOfComplexToStix() throws Exception {
    ExternalReference externalReference = new ExternalReference();
    externalReference.setSourceName("Heyooo");
    externalReference.setExternalId("abcde");
    List<?> list = new List<>(java.util.List.of(new Complex<>(externalReference)));

    assertThatJson(list.toStix(mapper).toPrettyString())
        .when(Option.IGNORING_ARRAY_ORDER)
        .isEqualTo("[{\"source_name\":\"Heyooo\", \"external_id\":\"abcde\"}]");
  }

  @Test
  public void testDictToStix() throws Exception {
    Map<String, BaseType<?>> map = new HashMap<>();
    map.put("test key", new StixString("test value"));
    io.openbas.stix.types.Dictionary dict = new Dictionary(map);

    assertThatJson(dict.toStix(mapper).toPrettyString())
        .when(Option.IGNORING_ARRAY_ORDER)
        .isEqualTo("{\"test key\":\"test value\"}");
  }

  @Test
  public void equality() throws Exception {
    Identifier id1 = new Identifier("1");
    Identifier id2 = new Identifier("1");

    assertThat(id1).isEqualTo(id2);
  }
}
