package io.openbas.utils;

import io.openbas.database.model.Document;
import io.openbas.rest.document.form.DocumentRelationsOutput;
import io.openbas.rest.document.form.RelatedEntityOutput;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class DocumentMapper {

  public static DocumentRelationsOutput toDocumentRelationsOutput(Document document) {
    return DocumentRelationsOutput.builder()
        .simulations(toOutput(document.getSimulations()))
        .securityPlatforms(toOutput(document.getSecurityPlatforms()))
        .channels(toOutput(document.getChannels()))
        .payloads(toOutput(document.getPayloads()))
        .scenarioArticles(
            toOutputWithContext(document.getArticles()))
        .simulationArticles(
            toOutputWithContext(document.getArticles()))
        .atomicTestings(toOutput(document.getAtomicTestings()))
        .scenarioInjects(
            toOutputWithContext(document.getInjects()))
        .simulationInjects(
            toOutputWithContext(document.getInjects()))
        .challenges(toOutput(document.getChallenges()))
        .build();
  }

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
