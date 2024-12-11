package io.openbas.rest.payload;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Payload;
import io.openbas.database.model.PayloadArgument;
import io.openbas.database.model.PayloadPrerequisite;
import io.openbas.rest.payload.form.PayloadCreateInput;
import java.util.ArrayList;
import java.util.List;
import org.jetbrains.annotations.NotNull;

public class PayloadUtils {

  private PayloadUtils() {
  }

  public static PayloadCreateInput buildPayload(@NotNull final JsonNode payloadNode) {
    PayloadCreateInput payloadCreateInput = new PayloadCreateInput();
    payloadCreateInput.setType(payloadNode.get("payload_type").textValue());
    payloadCreateInput.setName(payloadNode.get("payload_name").textValue());
    payloadCreateInput.setSource(
        Payload.PAYLOAD_SOURCE.valueOf(payloadNode.get("payload_source").textValue()));
    payloadCreateInput.setStatus(
        Payload.PAYLOAD_STATUS.valueOf(payloadNode.get("payload_status").textValue()));

    ArrayNode platformsNode = (ArrayNode) payloadNode.get("payload_platforms");
    Endpoint.PLATFORM_TYPE[] platforms = new Endpoint.PLATFORM_TYPE[platformsNode.size()];
    for (int i = 0; i < platformsNode.size(); i++) {
      platforms[i] = Endpoint.PLATFORM_TYPE.valueOf(platformsNode.get(i).textValue());
    }
    payloadCreateInput.setPlatforms(platforms);
    if (payloadNode.has("payload_description")) {
      payloadCreateInput.setDescription(payloadNode.get("payload_description").textValue());
    }
    if (payloadNode.has("command_executor")) {
      payloadCreateInput.setExecutor(payloadNode.get("command_executor").textValue());
    }
    if (payloadNode.has("command_content")) {
      payloadCreateInput.setContent(payloadNode.get("command_content").textValue());
    }
    if (payloadNode.has("payload_execution_arch")) {
      payloadCreateInput.setExecutionArch(
          Payload.PAYLOAD_EXECUTION_ARCH.valueOf(
              (payloadNode.get("payload_execution_arch").textValue())));
    }
    if (payloadNode.has("executable_file")) {
      payloadCreateInput.setExecutableFile(payloadNode.get("executable_file").textValue());
    }
    if (payloadNode.has("file_drop_file")) {
      payloadCreateInput.setFileDropFile(payloadNode.get("file_drop_file").textValue());
    }
    if (payloadNode.has("dns_resolution_hostname")) {
      payloadCreateInput.setHostname(payloadNode.get("dns_resolution_hostname").textValue());
    }

    if (payloadNode.has("payload_arguments")) {
      ArrayNode argumentsNode = (ArrayNode) payloadNode.get("payload_arguments");
      List<PayloadArgument> arguments = new ArrayList<>();
      for (JsonNode argumentNode : argumentsNode) {
        PayloadArgument argument = new PayloadArgument();
        argument.setType(argumentNode.get("type").textValue());
        argument.setKey(argumentNode.get("key").textValue());
        argument.setDefaultValue(argumentNode.get("default_value").textValue());
        argument.setDescription(argumentNode.get("description").textValue());
        arguments.add(argument);
      }
      payloadCreateInput.setArguments(arguments);
    }

    if (payloadNode.has("payload_prerequisites")) {
      ArrayNode prerequisitesNode = (ArrayNode) payloadNode.get("payload_prerequisites");
      List<PayloadPrerequisite> prerequisites = new ArrayList<>();
      for (JsonNode prerequisiteNode : prerequisitesNode) {
        PayloadPrerequisite prerequisite = new PayloadPrerequisite();
        prerequisite.setExecutor(prerequisiteNode.get("executor").textValue());
        prerequisite.setGetCommand(prerequisiteNode.get("get_command").textValue());
        prerequisite.setCheckCommand(prerequisiteNode.get("check_command").textValue());
        prerequisite.setDescription(prerequisiteNode.get("description").textValue());
        prerequisites.add(prerequisite);
      }
      payloadCreateInput.setPrerequisites(prerequisites);
    }
    if (payloadNode.has("payload_cleanup_executor")) {
      payloadCreateInput.setCleanupExecutor(
          payloadNode.get("payload_cleanup_executor").textValue());
    }
    if (payloadNode.has("payload_cleanup_command")) {
      payloadCreateInput.setCleanupCommand(payloadNode.get("payload_cleanup_command").textValue());
    }

    // TODO: tag & attack pattern
    payloadCreateInput.setTagIds(new ArrayList<>());
    payloadCreateInput.setAttackPatternsIds(new ArrayList<>());
    return payloadCreateInput;
  }
}
