package io.openbas.utils.fixtures;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.rest.atomic_testing.form.AtomicTestingInput;
import java.util.Collections;

public class AtomicTestingInputFixture {

  public static AtomicTestingInput createDefaultAtomicTestingInput() {
    AtomicTestingInput input = new AtomicTestingInput();
    input.setTitle("Atomic Testing");
    input.setDescription("Description");
    ObjectMapper mapper = new ObjectMapper();
    ObjectNode content = mapper.createObjectNode();
    content.put(
        "namedpipes_client_exe_path",
        "./ExternalPayloads/../ExternalPayloads/build/namedpipes_client.exe");
    content.put("path", "./ExternalPayloads/../ExternalPayloads");
    input.setContent(content);
    input.setTeams(Collections.emptyList());
    input.setAssets(Collections.emptyList());
    input.setAssetGroups(Collections.emptyList());
    input.setDocuments(Collections.emptyList());
    input.setTagIds(Collections.emptyList());
    input.setAllTeams(false);
    return input;
  }
}
