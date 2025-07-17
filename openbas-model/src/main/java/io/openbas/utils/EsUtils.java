package io.openbas.utils;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.ExistsQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TermQuery;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class EsUtils {

  private EsUtils() {}

  public static Query existsQuery(@NotBlank final String field) {
    return ExistsQuery.of(e -> e.field(field))._toQuery();
  }

  public static Query notExistsQuery(@NotBlank final String field) {
    return BoolQuery.of(b -> b.mustNot(List.of(existsQuery(field))))._toQuery();
  }

  public static Query emptyFieldQuery(@NotBlank final String field) {
    return TermQuery.of(t -> t.field(field).value(""))._toQuery();
  }

  public static Query notEmptyFieldQuery(@NotBlank final String field) {
    return BoolQuery.of(b -> b.mustNot(List.of(emptyFieldQuery(field))))._toQuery();
  }
}
