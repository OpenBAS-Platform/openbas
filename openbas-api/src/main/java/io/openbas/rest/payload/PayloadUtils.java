package io.openbas.rest.payload;

import static io.openbas.database.model.Payload.PAYLOAD_EXECUTION_ARCH.arm64;
import static io.openbas.database.model.Payload.PAYLOAD_EXECUTION_ARCH.x86_64;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.payload.form.*;
import io.openbas.rest.payload.service.PayloadService;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

@Log
@RequiredArgsConstructor
@Component
public class PayloadUtils {

  private final TagRepository tagRepository;
  private final AttackPatternRepository attackPatternRepository;
  private final PayloadService payloadService;
  private final PayloadRepository payloadRepository;
  private final DocumentRepository documentRepository;
  private final CollectorRepository collectorRepository;

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

  public static void validateArchitecture(String payloadType, Payload.PAYLOAD_EXECUTION_ARCH arch) {
    if (arch == null) {
      throw new BadRequestException("Payload architecture cannot be null.");
    }
    if (Executable.EXECUTABLE_TYPE.equals(payloadType) && (arch != x86_64 && arch != arm64)) {
      throw new BadRequestException("Executable architecture must be x86_64 or arm64.");
    }
  }

  // -- CREATION --
  public Payload createPayload(PayloadCreateInput input) {
    PayloadType payloadType = PayloadType.fromString(input.getType());
    validateArchitecture(payloadType.key, input.getExecutionArch());

    switch (payloadType) {
      case COMMAND:
        Command commandPayload = new Command();
        copyProperties(input, commandPayload);
        commandPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        commandPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        commandPayload = payloadRepository.save(commandPayload);
        this.payloadService.updateInjectorContractsForPayload(commandPayload);
        return commandPayload;
      case EXECUTABLE:
        Executable executablePayload = new Executable();
        copyProperties(input, executablePayload);
        executablePayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        executablePayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        executablePayload.setExecutableFile(
            documentRepository.findById(input.getExecutableFile()).orElseThrow());
        executablePayload = payloadRepository.save(executablePayload);
        this.payloadService.updateInjectorContractsForPayload(executablePayload);
        return executablePayload;
      case FILE_DROP:
        FileDrop fileDropPayload = new FileDrop();
        copyProperties(input, fileDropPayload);
        fileDropPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        fileDropPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        Optional<Document> document = documentRepository.findById(input.getFileDropFile());
        if (document.isPresent()) {
          fileDropPayload.setFileDropFile(document.get());
        } else {
          log.info("Document not found: " + input.getFileDropFile());
        }
        fileDropPayload = payloadRepository.save(fileDropPayload);
        this.payloadService.updateInjectorContractsForPayload(fileDropPayload);
        return fileDropPayload;
      case DNS_RESOLUTION:
        DnsResolution dnsResolutionPayload = new DnsResolution();
        copyProperties(input, dnsResolutionPayload);
        dnsResolutionPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        dnsResolutionPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        dnsResolutionPayload = payloadRepository.save(dnsResolutionPayload);
        this.payloadService.updateInjectorContractsForPayload(dnsResolutionPayload);
        return dnsResolutionPayload;
      case NETWORK_TRAFFIC:
        NetworkTraffic networkTrafficPayload = new NetworkTraffic();
        copyProperties(input, networkTrafficPayload);
        networkTrafficPayload.setAttackPatterns(
            fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        networkTrafficPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        networkTrafficPayload = payloadRepository.save(networkTrafficPayload);
        this.payloadService.updateInjectorContractsForPayload(networkTrafficPayload);
        return networkTrafficPayload;
      default:
        throw new UnsupportedOperationException(
            "Payload type " + input.getType() + " is not supported");
    }
  }

  public Payload createPayloadFromUpsert(PayloadUpsertInput input) {
    PayloadType payloadType = PayloadType.fromString(input.getType());
    validateArchitecture(payloadType.key, input.getExecutionArch());

    switch (payloadType) {
      case COMMAND:
        Command commandPayload = new Command();
        copyProperties(input, commandPayload);
        if (input.getCollector() != null) {
          commandPayload.setCollector(
              collectorRepository.findById(input.getCollector()).orElseThrow());
        }
        commandPayload.setAttackPatterns(
            fromIterable(
                attackPatternRepository.findAllByExternalIdInIgnoreCase(
                    input.getAttackPatternsExternalIds())));
        commandPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        commandPayload = payloadRepository.save(commandPayload);
        this.payloadService.updateInjectorContractsForPayload(commandPayload);
        return commandPayload;
      case EXECUTABLE:
        Executable executablePayload = new Executable();
        copyProperties(input, executablePayload);
        if (input.getCollector() != null) {
          executablePayload.setCollector(
              collectorRepository.findById(input.getCollector()).orElseThrow());
        }
        executablePayload.setAttackPatterns(
            fromIterable(
                attackPatternRepository.findAllByExternalIdInIgnoreCase(
                    input.getAttackPatternsExternalIds())));
        executablePayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        executablePayload.setExecutableFile(
            documentRepository.findById(input.getExecutableFile()).orElseThrow());
        executablePayload = payloadRepository.save(executablePayload);
        this.payloadService.updateInjectorContractsForPayload(executablePayload);
        return executablePayload;
      case FILE_DROP:
        FileDrop fileDropPayload = new FileDrop();
        copyProperties(input, fileDropPayload);
        if (input.getCollector() != null) {
          fileDropPayload.setCollector(
              collectorRepository.findById(input.getCollector()).orElseThrow());
        }
        fileDropPayload.setAttackPatterns(
            fromIterable(
                attackPatternRepository.findAllByExternalIdInIgnoreCase(
                    input.getAttackPatternsExternalIds())));
        fileDropPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        fileDropPayload.setFileDropFile(
            documentRepository.findById(input.getFileDropFile()).orElseThrow());
        fileDropPayload = payloadRepository.save(fileDropPayload);
        this.payloadService.updateInjectorContractsForPayload(fileDropPayload);
        return fileDropPayload;
      case DNS_RESOLUTION:
        DnsResolution dnsResolutionPayload = new DnsResolution();
        copyProperties(input, dnsResolutionPayload);
        if (input.getCollector() != null) {
          dnsResolutionPayload.setCollector(
              collectorRepository.findById(input.getCollector()).orElseThrow());
        }
        dnsResolutionPayload.setAttackPatterns(
            fromIterable(
                attackPatternRepository.findAllByExternalIdInIgnoreCase(
                    input.getAttackPatternsExternalIds())));
        dnsResolutionPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        dnsResolutionPayload = payloadRepository.save(dnsResolutionPayload);
        this.payloadService.updateInjectorContractsForPayload(dnsResolutionPayload);
        return dnsResolutionPayload;
      case NETWORK_TRAFFIC:
        NetworkTraffic networkTrafficPayload = new NetworkTraffic();
        copyProperties(input, networkTrafficPayload);
        if (input.getCollector() != null) {
          networkTrafficPayload.setCollector(
              collectorRepository.findById(input.getCollector()).orElseThrow());
        }
        networkTrafficPayload.setAttackPatterns(
            fromIterable(
                attackPatternRepository.findAllByExternalIdInIgnoreCase(
                    input.getAttackPatternsExternalIds())));
        networkTrafficPayload.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        networkTrafficPayload = payloadRepository.save(networkTrafficPayload);
        this.payloadService.updateInjectorContractsForPayload(networkTrafficPayload);
        return networkTrafficPayload;
      default:
        throw new UnsupportedOperationException(
            "Payload type " + input.getType() + " is not supported");
    }
  }

  // -- UPDATE --
  public Payload updatePayload(PayloadUpdateInput input, Payload existingPayload) {
    PayloadType payloadType = PayloadType.fromString(existingPayload.getType());
    validateArchitecture(payloadType.key, input.getExecutionArch());

    switch (payloadType) {
      case COMMAND:
        Command payloadCommand = (Command) Hibernate.unproxy(existingPayload);
        copyProperties(input, payloadCommand);
        payloadCommand = payloadRepository.save(payloadCommand);
        this.payloadService.updateInjectorContractsForPayload(payloadCommand);
        return payloadCommand;
      case EXECUTABLE:
        Executable payloadExecutable = (Executable) Hibernate.unproxy(existingPayload);
        copyProperties(input, payloadExecutable);
        payloadExecutable.setExecutableFile(
            documentRepository.findById(input.getExecutableFile()).orElseThrow());
        payloadExecutable = payloadRepository.save(payloadExecutable);
        this.payloadService.updateInjectorContractsForPayload(payloadExecutable);
        return payloadExecutable;
      case FILE_DROP:
        FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(existingPayload);
        copyProperties(input, payloadFileDrop);
        payloadFileDrop.setFileDropFile(
            documentRepository.findById(input.getFileDropFile()).orElseThrow());
        payloadFileDrop = payloadRepository.save(payloadFileDrop);
        this.payloadService.updateInjectorContractsForPayload(payloadFileDrop);
        return payloadFileDrop;
      case DNS_RESOLUTION:
        DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(existingPayload);
        copyProperties(input, payloadDnsResolution);
        payloadDnsResolution = payloadRepository.save(payloadDnsResolution);
        this.payloadService.updateInjectorContractsForPayload(payloadDnsResolution);
        return payloadDnsResolution;
      case NETWORK_TRAFFIC:
        NetworkTraffic payloadNetworkTraffic = (NetworkTraffic) Hibernate.unproxy(existingPayload);
        copyProperties(input, payloadNetworkTraffic);
        payloadNetworkTraffic = payloadRepository.save(payloadNetworkTraffic);
        this.payloadService.updateInjectorContractsForPayload(payloadNetworkTraffic);
        return payloadNetworkTraffic;
      default:
        throw new UnsupportedOperationException(
            "Payload type " + existingPayload.getType() + " is not supported");
    }
  }

  public Payload updatePayloadFromUpsert(PayloadUpsertInput input, Payload existingPayload) {
    PayloadType payloadType = PayloadType.fromString(existingPayload.getType());
    validateArchitecture(payloadType.key, input.getExecutionArch());

    switch (payloadType) {
      case COMMAND:
        Command payloadCommand = (Command) Hibernate.unproxy(existingPayload);
        copyProperties(input, payloadCommand);
        payloadCommand = payloadRepository.save(payloadCommand);
        this.payloadService.updateInjectorContractsForPayload(payloadCommand);
        return payloadCommand;
      case EXECUTABLE:
        Executable payloadExecutable = (Executable) Hibernate.unproxy(existingPayload);
        copyProperties(input, payloadExecutable);
        payloadExecutable.setExecutableFile(
            documentRepository.findById(input.getExecutableFile()).orElseThrow());
        payloadExecutable = payloadRepository.save(payloadExecutable);
        this.payloadService.updateInjectorContractsForPayload(payloadExecutable);
        return payloadExecutable;
      case FILE_DROP:
        FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(existingPayload);
        copyProperties(input, payloadFileDrop);
        payloadFileDrop.setFileDropFile(
            documentRepository.findById(input.getFileDropFile()).orElseThrow());
        payloadFileDrop = payloadRepository.save(payloadFileDrop);
        this.payloadService.updateInjectorContractsForPayload(payloadFileDrop);
        return payloadFileDrop;
      case DNS_RESOLUTION:
        DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(existingPayload);
        copyProperties(input, payloadDnsResolution);
        payloadDnsResolution = payloadRepository.save(payloadDnsResolution);
        this.payloadService.updateInjectorContractsForPayload(payloadDnsResolution);
        return payloadDnsResolution;
      case NETWORK_TRAFFIC:
        NetworkTraffic payloadNetworkTraffic = (NetworkTraffic) Hibernate.unproxy(existingPayload);
        copyProperties(input, payloadNetworkTraffic);
        payloadNetworkTraffic = payloadRepository.save(payloadNetworkTraffic);
        this.payloadService.updateInjectorContractsForPayload(payloadNetworkTraffic);
        return payloadNetworkTraffic;
      default:
        throw new UnsupportedOperationException(
            "Payload type " + existingPayload.getType() + " is not supported");
    }
  }

  // -- COPY PROPERTIES --
  public Payload copyProperties(Object payloadInput, Payload target) {
    if (payloadInput == null) {
      throw new IllegalArgumentException("Input payload cannot be null");
    }

    if (payloadInput instanceof PayloadCreateInput) {
      return copyFromPayloadCreateInput((PayloadCreateInput) payloadInput, target);
    } else if (payloadInput instanceof PayloadUpdateInput) {
      return copyFromPayloadUpdateInput((PayloadUpdateInput) payloadInput, target);
    } else if (payloadInput instanceof PayloadUpsertInput) {
      return copyFromPayloadUpsertInput((PayloadUpsertInput) payloadInput, target);
    }

    throw new IllegalArgumentException("Unsupported payload input type");
  }

  private Payload copyFromPayloadCreateInput(PayloadCreateInput input, Payload target) {
    BeanUtils.copyProperties(input, target);
    copyOutputParsers(input.getOutputParsers(), target);
    return target;
  }

  private Payload copyFromPayloadUpdateInput(PayloadUpdateInput input, Payload target) {
    BeanUtils.copyProperties(input, target);
    copyOutputParsers(input.getOutputParsers(), target);
    return target;
  }

  private Payload copyFromPayloadUpsertInput(PayloadUpsertInput input, Payload target) {
    BeanUtils.copyProperties(input, target);
    copyOutputParsers(input.getOutputParsers(), target);
    return target;
  }

  public <T> void copyOutputParsers(Set<T> inputParsers, Payload target) {
    if (inputParsers != null) {
      Set<OutputParser> outputParsers =
          inputParsers.stream()
              .map(
                  inputParser -> {
                    OutputParser outputParser = new OutputParser();
                    BeanUtils.copyProperties(inputParser, outputParser);
                    outputParser.setPayload(target);

                    // Handle contract output elements based on the input type
                    if (inputParser instanceof OutputParserInput) {
                      OutputParserInput parserInput = (OutputParserInput) inputParser;
                      copyContractOutputElements(
                          parserInput.getContractOutputElements(), outputParser);
                    } else if (inputParser instanceof OutputParser) {
                      OutputParser parser = (OutputParser) inputParser;
                      copyContractOutputElements(parser.getContractOutputElements(), outputParser);
                    }

                    return outputParser;
                  })
              .collect(Collectors.toSet());

      target.setOutputParsers(outputParsers);
    }
  }

  private void copyContractOutputElements(Set<?> inputElements, OutputParser outputParser) {
    if (inputElements != null) {
      Set<ContractOutputElement> contractOutputElements =
          inputElements.stream()
              .map(
                  inputElement -> {
                    ContractOutputElement contractOutputElement = new ContractOutputElement();
                    BeanUtils.copyProperties(inputElement, contractOutputElement);
                    contractOutputElement.setOutputParser(outputParser);
                    if (inputElement instanceof ContractOutputElementInput) {
                      ContractOutputElementInput contractOutputElementInput =
                          (ContractOutputElementInput) inputElement;
                      contractOutputElement.setTags(
                          iterableToSet(
                              tagRepository.findAllById(contractOutputElementInput.getTagIds())));
                      copyRegexGroups(
                          contractOutputElementInput.getRegexGroups(), contractOutputElement);
                    } else {
                      ContractOutputElement contractOutputElementInstance =
                          (ContractOutputElement) inputElement;
                      contractOutputElement.setTags(
                          iterableToSet(new HashSet<>(contractOutputElementInstance.getTags())));
                      copyRegexGroups(
                          contractOutputElement.getRegexGroups(), contractOutputElement);
                    }
                    return contractOutputElement;
                  })
              .collect(Collectors.toSet());

      outputParser.setContractOutputElements(contractOutputElements);
    }
  }

  private void copyRegexGroups(Set<?> inputElements, ContractOutputElement contractOutputElement) {
    if (inputElements != null) {
      Set<RegexGroup> regexGroups =
          inputElements.stream()
              .map(
                  inputElement -> {
                    RegexGroup regexGroup = new RegexGroup();
                    BeanUtils.copyProperties(inputElement, regexGroup);
                    regexGroup.setContractOutputElement(contractOutputElement);
                    return regexGroup;
                  })
              .collect(Collectors.toSet());

      contractOutputElement.setRegexGroups(regexGroups);
    }
  }
}
