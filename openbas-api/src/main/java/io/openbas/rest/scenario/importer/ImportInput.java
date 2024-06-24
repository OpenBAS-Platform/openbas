package io.openbas.rest.scenario.importer;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.rest.inject.form.InjectDocumentInput;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ImportInput {

  private ObjectNode content;
  private String title;
  private String description;
  private String injectorContract;
  private List<String> teams = new ArrayList<>();
  private List<String> assets = new ArrayList<>();
  private List<String> assetGroups = new ArrayList<>();
  private List<InjectDocumentInput> documents = new ArrayList<>();
  private boolean allTeams = false;
  private List<String> tagIds = new ArrayList<>();

}
