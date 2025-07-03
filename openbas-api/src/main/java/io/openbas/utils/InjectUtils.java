package io.openbas.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import static io.openbas.database.model.Command.COMMAND_TYPE;
import static io.openbas.database.model.DnsResolution.DNS_RESOLUTION_TYPE;
import static io.openbas.database.model.Executable.EXECUTABLE_TYPE;
import static io.openbas.database.model.FileDrop.FILE_DROP_TYPE;
import static io.openbas.database.model.NetworkTraffic.NETWORK_TRAFFIC_TYPE;

@RequiredArgsConstructor
@Component
@Slf4j
public class InjectUtils {

  private final ApplicationContext context;

  public StatusPayload getStatusPayloadFromInject(final Inject inject) {
    if (inject == null) {
      return null;
    }

    if (inject.getStatus().isPresent() && inject.getStatus().get().getPayloadOutput() != null) {
      // Commands lines saved because inject has been executed
      return inject.getStatus().get().getPayloadOutput();
    } else if (inject.getInjectorContract().isPresent()) {
      InjectorContract injectorContract = inject.getInjectorContract().get();
      if (injectorContract.getPayload() != null) {
        Payload payload = injectorContract.getPayload();
        StatusPayload.StatusPayloadBuilder builder = StatusPayload.builder()
            .name(payload.getName())
            .description(payload.getDescription())
            .platforms(payload.getPlatforms())
            .attackPatterns(payload.getAttackPatterns().stream().map(AttackPattern::getId).toList())
            .externalId(payload.getExternalId())
            .prerequisites(payload.getPrerequisites())
            .arguments(payload.getArguments())
            .cleanupCommand(List.of(payload.getCleanupCommand()))
            .cleanupExecutor(payload.getCleanupExecutor());
        if (COMMAND_TYPE.equals(injectorContract.getPayload().getType())) {
          // Inject has a command payload
          Command payloadCommand = (Command) Hibernate.unproxy(payload);
          return builder
              .type(COMMAND_TYPE)
              .collectorType(payload.getCollectorType())
              .executor(payloadCommand.getExecutor())
              .content(payloadCommand.getContent())
              .build();

        } else if (EXECUTABLE_TYPE.equals(injectorContract.getPayload().getType())) {
          // Inject has a command payload
          Executable payloadExecutable = (Executable) Hibernate.unproxy(payload);
          return builder
              .type(EXECUTABLE_TYPE)
              .collectorType(payload.getCollectorType())
              .executableFile(payloadExecutable.getExecutableFile().getId())
              .build();
        } else if (FILE_DROP_TYPE.equals(injectorContract.getPayload().getType())) {
          // Inject has a command payload
          FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(payload);
          return builder
              .type(FILE_DROP_TYPE)
              .collectorType(payload.getCollectorType())
              .fileDropFile(payloadFileDrop.getFileDropFile().getId())
              .build();
        } else if (DNS_RESOLUTION_TYPE.equals(injectorContract.getPayload().getType())) {
          // Inject has a command payload
          DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(payload);
          return builder
              .type(DNS_RESOLUTION_TYPE)
              .collectorType(payload.getCollectorType())
              .hostname(payloadDnsResolution.getHostname())
              .build();
        } else if (NETWORK_TRAFFIC_TYPE.equals(injectorContract.getPayload().getType())) {
          // Inject has a command payload
          NetworkTraffic payloadNetworkTraffic = (NetworkTraffic) Hibernate.unproxy(payload);
          return builder
              .type(NETWORK_TRAFFIC_TYPE)
              .collectorType(payload.getCollectorType())
              .protocol(payloadNetworkTraffic.getProtocol())
              .portDst(payloadNetworkTraffic.getPortDst())
              .portSrc(payloadNetworkTraffic.getPortSrc())
              .ipDst(payloadNetworkTraffic.getIpDst())
              .ipSrc(payloadNetworkTraffic.getIpSrc())
              .build();
        }
      } else {
        try {
          // Inject comes from Caldera ability and tomorrow from other(s) Executor(s)
          io.openbas.executors.Injector executor =
              context.getBean(
                  injectorContract.getInjector().getType(), io.openbas.executors.Injector.class);
          return executor.getPayloadOutput(injectorContract.getId());
        } catch (NoSuchBeanDefinitionException e) {
          log.info(
              "No executor found for this injector: " + injectorContract.getInjector().getType());
          return null;
        }
      }
    }
    return null;
  }

  public List<InjectExpectation> getPrimaryExpectations(Inject inject) {
    List<String> firstIds = new ArrayList<>();

    firstIds.addAll(inject.getTeams().stream().map(Team::getId).toList());
    firstIds.addAll(inject.getAssets().stream().map(Asset::getId).toList());
    firstIds.addAll(inject.getAssetGroups().stream().map(AssetGroup::getId).toList());

    // Reject expectations if none of the team, asset, or assetGroup IDs exist in firstIds
    return inject.getExpectations().stream()
        .filter(
            expectation -> {
              boolean teamMatch =
                  expectation.getTeam() != null && firstIds.contains(expectation.getTeam().getId());
              boolean assetMatch =
                  expectation.getAsset() != null
                      && firstIds.contains(expectation.getAsset().getId());
              boolean assetGroupMatch =
                  expectation.getAssetGroup() != null
                      && firstIds.contains(expectation.getAssetGroup().getId());
              return teamMatch || assetMatch || assetGroupMatch;
            })
        .collect(Collectors.toList());
  }

  public static boolean checkIfRowIsEmpty(Row row) {
    if (row == null) {
      return true;
    }
    if (row.getLastCellNum() <= 0) {
      return true;
    }
    for (int cellNum = row.getFirstCellNum(); cellNum < row.getLastCellNum(); cellNum++) {
      Cell cell = row.getCell(cellNum);
      if (cell != null
          && cell.getCellType() != CellType.BLANK
          && StringUtils.isNotBlank(cell.toString())) {
        return false;
      }
    }
    return true;
  }

  public static Inject duplicateInject(@NotNull Inject injectOrigin) {
    ObjectMapper objectMapper = new ObjectMapper();
    Inject duplicatedInject = new Inject();
    duplicatedInject.setUser(injectOrigin.getUser());
    duplicatedInject.setTitle(injectOrigin.getTitle());
    duplicatedInject.setDescription(injectOrigin.getDescription());
    try {
      ObjectNode content =
          objectMapper.readValue(
              objectMapper.writeValueAsString(injectOrigin.getContent()), ObjectNode.class);
      duplicatedInject.setContent(content);
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
    duplicatedInject.setAllTeams(injectOrigin.isAllTeams());
    duplicatedInject.setTeams(injectOrigin.getTeams().stream().toList());
    duplicatedInject.setEnabled(injectOrigin.isEnabled());
    duplicatedInject.setDependsDuration(injectOrigin.getDependsDuration());
    if (injectOrigin.getDependsOn() != null) {
      duplicatedInject.setDependsOn(injectOrigin.getDependsOn().stream().toList());
    }
    duplicatedInject.setCountry(injectOrigin.getCountry());
    duplicatedInject.setCity(injectOrigin.getCity());
    duplicatedInject.setInjectorContract(injectOrigin.getInjectorContract().orElse(null));
    duplicatedInject.setAssetGroups(injectOrigin.getAssetGroups().stream().toList());
    duplicatedInject.setAssets(injectOrigin.getAssets().stream().toList());
    duplicatedInject.setCommunications(injectOrigin.getCommunications().stream().toList());
    duplicatedInject.setTags(new HashSet<>(injectOrigin.getTags()));

    duplicatedInject.setExercise(injectOrigin.getExercise());
    duplicatedInject.setScenario(injectOrigin.getScenario());
    return duplicatedInject;
  }
}
