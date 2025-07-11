package io.openbas.utils;

import io.openbas.rest.document.form.RelatedEntityOutput;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
public class DocumentMapper {

  public static List<RelatedEntityOutput> toOutput(List<Object[]> rows) {
    return rows.stream()
        .map(r -> new RelatedEntityOutput((String) r[0], (String) r[1], null))
        .toList();
  }

  public static List<RelatedEntityOutput> toOutputWithContext(List<Object[]> rows) {
    return rows.stream()
        .map(r -> new RelatedEntityOutput((String) r[0], (String) r[1], (String) r[2]))
        .toList();
  }
}
