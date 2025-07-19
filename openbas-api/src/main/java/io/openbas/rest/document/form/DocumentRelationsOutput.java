package io.openbas.rest.document.form;

import java.util.Set;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class DocumentRelationsOutput {

  private Set<RelatedEntityOutput> simulations;

  private Set<RelatedEntityOutput> securityPlatforms;

  private Set<RelatedEntityOutput> channels;

  private Set<RelatedEntityOutput> payloads;

  private Set<RelatedEntityOutput> scenarioArticles;

  private Set<RelatedEntityOutput> simulationArticles;

  private Set<RelatedEntityOutput> atomicTestings;

  private Set<RelatedEntityOutput> scenarioInjects;

  private Set<RelatedEntityOutput> simulationInjects;

  private Set<RelatedEntityOutput> challenges;
}
