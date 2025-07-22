package io.openbas.utilstest;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import io.openbas.IntegrationTest;
import io.openbas.annotation.Queryable;
import io.openbas.database.model.Filters;
import io.openbas.schema.PropertySchema;
import io.openbas.schema.SchemaUtils;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.Getter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

@Transactional
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Schema Utils tests")
public class SchemaUtilsTest extends IntegrationTest {
  @Test
  @DisplayName(
      "When override operators are set on Queryable, PropertySchema has these operators set")
  public void WhenOverrideOperatorsAreSetOnQueryable_PropertySchemaHasTheseOperatorsSet() {
    List<Filters.FilterOperator> expectedOperators =
        List.of(Filters.FilterOperator.eq, Filters.FilterOperator.contains);

    @Getter
    class TestClass {
      @Queryable(
          filterable = true,
          overrideOperators = {Filters.FilterOperator.eq, Filters.FilterOperator.contains})
      private String stringAttribute;

      @Queryable(filterable = true)
      private boolean booleanAttribute;
    }

    List<PropertySchema> propertySchemas = SchemaUtils.schema(TestClass.class);

    PropertySchema stringAttribute =
        propertySchemas.stream()
            .filter(ps -> ps.getName().equals("stringAttribute"))
            .findFirst()
            .get();
    assertThat(stringAttribute.getOverrideOperators()).isEqualTo(expectedOperators);

    PropertySchema booleanAttribute =
        propertySchemas.stream()
            .filter(ps -> ps.getName().equals("booleanAttribute"))
            .findFirst()
            .get();
    assertThat(booleanAttribute.getOverrideOperators()).isEqualTo(List.of());
  }
}
