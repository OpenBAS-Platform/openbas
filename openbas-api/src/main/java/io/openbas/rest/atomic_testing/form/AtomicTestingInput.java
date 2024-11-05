package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.rest.inject.form.InjectDocumentInput;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class AtomicTestingInput {

  @JsonProperty("inject_title")
  private String title;

  @JsonProperty("inject_description")
  private String description;

  @JsonProperty("inject_injector_contract")
  private String injectorContract;

  @JsonProperty("inject_content")
  private ObjectNode content;

  @JsonProperty("inject_teams")
  private List<String> teams;

  @JsonProperty("inject_assets")
  private List<String> assets;

  @JsonProperty("inject_asset_groups")
  private List<String> assetGroups;

  @JsonProperty("inject_documents")
  private List<InjectDocumentInput> documents;

  @JsonProperty("inject_all_teams")
  private boolean allTeams;

  @JsonProperty("inject_tags")
  private List<String> tagIds;
}
