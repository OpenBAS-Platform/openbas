package io.openbas.rest.payload.service;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.SupportedLanguage.en;
import static io.openbas.helper.SupportedLanguage.fr;
import static io.openbas.injector_contract.Contract.executableContract;
import static io.openbas.injector_contract.ContractCardinality.Multiple;
import static io.openbas.injector_contract.ContractDef.contractBuilder;
import static io.openbas.injector_contract.fields.ContractAsset.assetField;
import static io.openbas.injector_contract.fields.ContractAssetGroup.assetGroupField;
import static io.openbas.injector_contract.fields.ContractExpectations.expectationsField;
import static io.openbas.injector_contract.fields.ContractText.textField;
import static io.openbas.rest.payload.PayloadUtils.copyOutputParsers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.expectation.ExpectationBuilderService;
import io.openbas.helper.SupportedLanguage;
import io.openbas.injector_contract.Contract;
import io.openbas.injector_contract.ContractConfig;
import io.openbas.injector_contract.ContractDef;
import io.openbas.injector_contract.fields.ContractAsset;
import io.openbas.injector_contract.fields.ContractAssetGroup;
import io.openbas.injector_contract.fields.ContractChoiceInformation;
import io.openbas.injector_contract.fields.ContractExpectations;
import io.openbas.injectors.openbas.util.OpenBASObfuscationMap;
import io.openbas.utils.StringUtils;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PayloadService {

  private static final Logger LOGGER = Logger.getLogger(PayloadService.class.getName());

  @Resource protected ObjectMapper mapper;

  private final PayloadRepository payloadRepository;
  private final InjectorRepository injectorRepository;
  private final InjectorContractRepository injectorContractRepository;
  private final AttackPatternRepository attackPatternRepository;
  private final ExpectationBuilderService expectationBuilderService;

  public void updateInjectorContractsForPayload(Payload payload) {
    List<Injector> injectors = this.injectorRepository.findAllByPayloads(true);
    injectors.forEach(injector -> updateInjectorContract(injector, payload));
  }

  private void updateInjectorContract(Injector injector, Payload payload) {
    Optional<InjectorContract> injectorContract =
        injectorContractRepository.findInjectorContractByInjectorAndPayload(injector, payload);
    if (injectorContract.isPresent()) {
      InjectorContract existingInjectorContract = injectorContract.get();
      Contract contract = buildContract(existingInjectorContract.getId(), injector, payload);
      Map<String, String> labels = Map.of("en", payload.getName(), "fr", payload.getName());
      existingInjectorContract.setLabels(labels);
      existingInjectorContract.setNeedsExecutor(true);
      existingInjectorContract.setManual(false);
      existingInjectorContract.setInjector(injector);
      existingInjectorContract.setPayload(payload);
      existingInjectorContract.setPlatforms(payload.getPlatforms());
      existingInjectorContract.setAttackPatterns(
          fromIterable(
              attackPatternRepository.findAllById(
                  payload.getAttackPatterns().stream().map(AttackPattern::getId).toList())));
      existingInjectorContract.setAtomicTesting(true);
      try {
        existingInjectorContract.setContent(mapper.writeValueAsString(contract));
      } catch (JsonProcessingException e) {
        throw new RuntimeException(e);
      }
      injectorContractRepository.save(existingInjectorContract);
    } else {
      String contractId = String.valueOf(UUID.randomUUID());
      Map<String, String> labels = Map.of("en", payload.getName(), "fr", payload.getName());
      Contract contract = buildContract(contractId, injector, payload);
      InjectorContract newInjectorContract = new InjectorContract();
      newInjectorContract.setId(contractId);
      newInjectorContract.setLabels(labels);
      newInjectorContract.setNeedsExecutor(true);
      newInjectorContract.setManual(false);
      newInjectorContract.setInjector(injector);
      newInjectorContract.setPayload(payload);
      newInjectorContract.setPlatforms(payload.getPlatforms());
      newInjectorContract.setAttackPatterns(
          fromIterable(
              attackPatternRepository.findAllById(
                  payload.getAttackPatterns().stream().map(AttackPattern::getId).toList())));
      newInjectorContract.setAtomicTesting(true);
      try {
        newInjectorContract.setContent(mapper.writeValueAsString(contract));
      } catch (JsonProcessingException e) {
        throw new RuntimeException(e);
      }
      injectorContractRepository.save(newInjectorContract);
    }
  }

  private ContractChoiceInformation obfuscatorField() {
    OpenBASObfuscationMap obfuscationMap = new OpenBASObfuscationMap();
    Map<String, String> obfuscationInfo = obfuscationMap.getAllObfuscationInfo();
    return ContractChoiceInformation.choiceInformationField(
        "obfuscator", "Obfuscators", obfuscationInfo, obfuscationMap.getDefaultObfuscator());
  }

  private Contract buildContract(
      @NotNull final String contractId,
      @NotNull final Injector injector,
      @NotNull final Payload payload) {
    Map<SupportedLanguage, String> labels = Map.of(en, injector.getName(), fr, injector.getName());
    ContractConfig contractConfig =
        new ContractConfig(
            injector.getType(),
            labels,
            "#000000",
            "#000000",
            "/img/icon-" + injector.getType() + ".png",
            true);
    ContractAsset assetField = assetField("assets", "Assets", Multiple);
    ContractAssetGroup assetGroupField = assetGroupField("assetgroups", "Asset groups", Multiple);
    ContractExpectations expectationsField = expectations();
    ContractDef builder = contractBuilder();
    builder.mandatoryGroup(assetField, assetGroupField);

    if (payload.getType().equals("Command")) {
      ContractChoiceInformation obfuscatorField = obfuscatorField();
      builder.optional(obfuscatorField);
    }

    builder.optional(expectationsField);
    if (payload.getArguments() != null) {
      payload
          .getArguments()
          .forEach(
              payloadArgument -> {
                builder.mandatory(
                    textField(
                        payloadArgument.getKey(),
                        payloadArgument.getKey(),
                        payloadArgument.getDefaultValue()));
              });
    }
    return executableContract(
        contractConfig,
        contractId,
        Map.of(en, payload.getName(), fr, payload.getName()),
        builder.build(),
        Arrays.asList(payload.getPlatforms()),
        true);
  }

  private ContractExpectations expectations() {
    return expectationsField(
        "expectations",
        "Expectations",
        List.of(
            this.expectationBuilderService.buildPreventionExpectation(),
            this.expectationBuilderService.buildDetectionExpectation()));
  }

  public Payload duplicate(@NotBlank final String payloadId) {
    Payload origin = this.payloadRepository.findById(payloadId).orElseThrow();
    Payload duplicated = payloadRepository.save(generateDuplicatedPayload(origin));
    this.updateInjectorContractsForPayload(duplicated);
    return duplicated;
  }

  public Payload generateDuplicatedPayload(Payload originalPayload) {
    return switch (originalPayload.getTypeEnum()) {
      case PayloadType.COMMAND -> {
        Command originCommand = (Command) Hibernate.unproxy(originalPayload);
        Command duplicateCommand = new Command();
        duplicateCommonProperties(originCommand, duplicateCommand);
        yield duplicateCommand;
      }
      case PayloadType.EXECUTABLE -> {
        Executable originExecutable = (Executable) Hibernate.unproxy(originalPayload);
        Executable duplicateExecutable = new Executable();
        duplicateCommonProperties(originExecutable, duplicateExecutable);
        duplicateExecutable.setExecutableFile(originExecutable.getExecutableFile());
        yield duplicateExecutable;
      }
      case PayloadType.FILE_DROP -> {
        FileDrop originFileDrop = (FileDrop) Hibernate.unproxy(originalPayload);
        FileDrop duplicateFileDrop = new FileDrop();
        duplicateCommonProperties(originFileDrop, duplicateFileDrop);
        yield duplicateFileDrop;
      }
      case PayloadType.DNS_RESOLUTION -> {
        DnsResolution originDnsResolution = (DnsResolution) Hibernate.unproxy(originalPayload);
        DnsResolution duplicateDnsResolution = new DnsResolution();
        duplicateCommonProperties(originDnsResolution, duplicateDnsResolution);
        yield duplicateDnsResolution;
      }
      case PayloadType.NETWORK_TRAFFIC -> {
        NetworkTraffic originNetworkTraffic = (NetworkTraffic) Hibernate.unproxy(originalPayload);
        NetworkTraffic duplicateNetworkTraffic = new NetworkTraffic();
        duplicateCommonProperties(originNetworkTraffic, duplicateNetworkTraffic);
        yield duplicateNetworkTraffic;
      }
    };
  }

  private <T extends Payload> void duplicateCommonProperties(
      @org.jetbrains.annotations.NotNull final T origin,
      @org.jetbrains.annotations.NotNull T duplicate) {
    BeanUtils.copyProperties(origin, duplicate);
    duplicate.setId(null);
    duplicate.setName(StringUtils.duplicateString(origin.getName()));
    duplicate.setAttackPatterns(new ArrayList<>(origin.getAttackPatterns()));
    duplicate.setTags(new HashSet<>(origin.getTags()));
    duplicate.setExternalId(null);
    duplicate.setCollector(null);
    duplicate.setSource(Payload.PAYLOAD_SOURCE.MANUAL);
    duplicate.setStatus(Payload.PAYLOAD_STATUS.UNVERIFIED);
    copyOutputParsers(origin.getOutputParsers(), duplicate);
  }

  public void deprecateNonProcessedPayloadsByCollector(
      String collectorId, List<String> processedPayloadExternalIds) {
    List<String> payloadExternalIds =
        payloadRepository.findAllExternalIdsByCollectorId(collectorId);
    List<String> payloadExternalIdsToDeprecate =
        getExternalIdsToDeprecate(payloadExternalIds, processedPayloadExternalIds);
    payloadRepository.setPayloadStatusByExternalIds(
        String.valueOf(Payload.PAYLOAD_STATUS.DEPRECATED), payloadExternalIdsToDeprecate);
    LOGGER.log(
        Level.INFO, "Number of deprecated Payloads: " + payloadExternalIdsToDeprecate.size());
  }

  private static List<String> getExternalIdsToDeprecate(
      List<String> payloadExternalIds, List<String> processedPayloadExternalIds) {
    return payloadExternalIds.stream()
        .filter(externalId -> !processedPayloadExternalIds.contains(externalId))
        .collect(Collectors.toList());
  }
}
