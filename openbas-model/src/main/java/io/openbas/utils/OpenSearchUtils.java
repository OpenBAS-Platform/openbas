package io.openbas.utils;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.opensearch.client.opensearch._types.FieldValue;
import org.opensearch.client.opensearch._types.query_dsl.BoolQuery;
import org.opensearch.client.opensearch._types.query_dsl.ExistsQuery;
import org.opensearch.client.opensearch._types.query_dsl.Query;
import org.opensearch.client.opensearch._types.query_dsl.TermQuery;

public class OpenSearchUtils {

  private OpenSearchUtils() {}

  public static Query existsQuery(@NotBlank final String field) {
    return ExistsQuery.of(e -> e.field(field)).toQuery();
  }

  public static Query notExistsQuery(@NotBlank final String field) {
    return BoolQuery.of(b -> b.mustNot(List.of(existsQuery(field)))).toQuery();
  }

  public static Query emptyFieldQuery(@NotBlank final String field) {
    return TermQuery.of(t -> t.field(field).value(FieldValue.of(""))).toQuery();
  }

  public static Query notEmptyFieldQuery(@NotBlank final String field) {
    return BoolQuery.of(b -> b.mustNot(List.of(emptyFieldQuery(field)))).toQuery();
  }
}
