package io.openbas.rest.document.form;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class DocumentRelationsOutput {

  private List<RelatedEntityOutput> simulations;

  private List<RelatedEntityOutput> securityPlatforms;

  private List<RelatedEntityOutput> channels;

  private List<RelatedEntityOutput> payloads;

  private List<RelatedEntityOutput> scenarioArticles;

  private List<RelatedEntityOutput> simulationArticles;

  private List<RelatedEntityOutput> atomicTestings;

  private List<RelatedEntityOutput> scenarioInjects;

  private List<RelatedEntityOutput> simulationInjects;

  private List<RelatedEntityOutput> challenges;
}
