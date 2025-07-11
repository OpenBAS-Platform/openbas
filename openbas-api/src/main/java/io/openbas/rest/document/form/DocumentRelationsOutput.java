package io.openbas.rest.document.form;

import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class DocumentRelationsOutput {

  private List<RelatedEntityOutput> exercises = new ArrayList();

  private List<RelatedEntityOutput> exercisesDocuments = new ArrayList();

  private List<RelatedEntityOutput> tags = new ArrayList();

  private List<RelatedEntityOutput> scenarios = new ArrayList();

  private List<RelatedEntityOutput> assets = new ArrayList();

  private List<RelatedEntityOutput> channels = new ArrayList();

  private List<RelatedEntityOutput> payloads = new ArrayList();

  private List<RelatedEntityOutput> articles = new ArrayList();

  private List<RelatedEntityOutput> atomicTestings = new ArrayList();

  private List<RelatedEntityOutput> scenarioInjects = new ArrayList();

  private List<RelatedEntityOutput> simulationInjects = new ArrayList();

  private List<RelatedEntityOutput> challenges = new ArrayList();
}
