package io.openbas.rest.document.form;

import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class DocumentRelationsOutput {

  private List<RelatedEntityOutput> simulations = new ArrayList();

  private List<RelatedEntityOutput> securityPlatforms = new ArrayList(); // Security Platforms

  private List<RelatedEntityOutput> channels = new ArrayList();

  private List<RelatedEntityOutput> payloads = new ArrayList();

  private List<RelatedEntityOutput> scenarioArticles = new ArrayList();

  private List<RelatedEntityOutput> simulationArticles = new ArrayList();

  private List<RelatedEntityOutput> atomicTestings = new ArrayList();

  private List<RelatedEntityOutput> scenarioInjects = new ArrayList();

  private List<RelatedEntityOutput> simulationInjects = new ArrayList();

  private List<RelatedEntityOutput> challenges = new ArrayList();
}
