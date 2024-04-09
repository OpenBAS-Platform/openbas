package io.openbas.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.Inject;
import io.openbas.rest.inject.form.InjectDocumentInput;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class AtomicTestingInput {

  @JsonProperty("inject_title")
  private String title;

  @JsonProperty("inject_description")
  private String description;

  @JsonProperty("inject_type")
  private String type;

  @JsonProperty("inject_contract")
  private String contract;

  @JsonProperty("inject_content")
  private ObjectNode content;

  @JsonProperty("inject_teams")
  private List<String> teams = new ArrayList<>();

  @JsonProperty("inject_assets")
  private List<String> assets = new ArrayList<>();

  @JsonProperty("inject_asset_groups")
  private List<String> assetGroups = new ArrayList<>();

  @JsonProperty("inject_documents")
  private List<InjectDocumentInput> documents = new ArrayList<>();

  @JsonProperty("inject_all_teams")
  private boolean allTeams = false;

  @JsonProperty("inject_tags")
  private List<String> tagIds = new ArrayList<>();

  public Inject toInject() {
    Inject inject = new Inject();
    inject.setTitle(getTitle());
    inject.setDescription(getDescription());
    inject.setContent(getContent());
    inject.setType(getType());
    inject.setContract(getContract());
    inject.setDependsDuration(0L);
    inject.setAllTeams(isAllTeams());
    inject.setCountry(null);
    inject.setCity(null);
    return inject;
  }

}
