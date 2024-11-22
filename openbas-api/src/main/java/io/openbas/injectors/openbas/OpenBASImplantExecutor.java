package io.openbas.injectors.openbas;

import static io.openbas.database.model.InjectExpectationSignature.*;
import static io.openbas.database.model.InjectStatusExecution.traceError;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAsset;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAssetGroup;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAsset;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAssetGroup;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAsset;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAssetGroup;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.injectors.openbas.model.OpenBASImplantInjectContent;
import io.openbas.model.ExecutionProcess;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.ManualExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Component;

@Component(OpenBASImplantContract.TYPE)
@RequiredArgsConstructor
@Log
public class OpenBASImplantExecutor extends Injector {

  private final AssetGroupService assetGroupService;
  private final InjectRepository injectRepository;

  private Map<Asset, Boolean> resolveAllAssets(@NotNull final ExecutableInject inject) {
    Map<Asset, Boolean> assets = new HashMap<>();
    inject
        .getAssets()
        .forEach(
            (asset -> {
              assets.put(asset, false);
            }));
    inject
        .getAssetGroups()
        .forEach(
            (assetGroup -> {
              List<Asset> assetsFromGroup =
                  this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
              // Verify asset validity
              assetsFromGroup.forEach(
                  (asset) -> {
                    assets.put(asset, true);
                  });
            }));
    return assets;
  }

  /** In case of direct asset, we have an individual expectation for the asset */
  private void computeExpectationsForAsset(
      @NotNull final List<Expectation> expectations,
      @NotNull final OpenBASImplantInjectContent content,
      @NotNull final Asset asset,
      final boolean expectationGroup,
      final List<InjectExpectationSignature> injectExpectationSignatures) {
    if (!content.getExpectations().isEmpty()) {
      expectations.addAll(
          content.getExpectations().stream()
              .flatMap(
                  (expectation) ->
                      switch (expectation.getType()) {
                        case PREVENTION ->
                            Stream.of(
                                preventionExpectationForAsset(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    asset,
                                    expectationGroup,
                                    expectation.getExpirationTime(),
                                    injectExpectationSignatures)); // expectationGroup usefully in
                        // front-end
                        case DETECTION ->
                            Stream.of(
                                detectionExpectationForAsset(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    asset,
                                    expectationGroup,
                                    expectation.getExpirationTime(),
                                    injectExpectationSignatures));
                        case MANUAL ->
                            Stream.of(
                                manualExpectationForAsset(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    asset,
                                    expectation.getExpirationTime(),
                                    expectationGroup));
                        default -> Stream.of();
                      })
              .toList());
    }
  }

  /**
   * In case of asset group if expectation group -> we have an expectation for the group and one for
   * each asset if not expectation group -> we have an individual expectation for each asset
   */
  private void computeExpectationsForAssetGroup(
      @NotNull final List<Expectation> expectations,
      @NotNull final OpenBASImplantInjectContent content,
      @NotNull final AssetGroup assetGroup,
      final List<InjectExpectationSignature> injectExpectationSignatures) {
    if (!content.getExpectations().isEmpty()) {
      expectations.addAll(
          content.getExpectations().stream()
              .flatMap(
                  (expectation) ->
                      switch (expectation.getType()) {
                        case PREVENTION -> {
                          // Verify that at least one asset in the group has been executed
                          List<Asset> assets =
                              this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                          if (assets.stream()
                              .anyMatch(
                                  (asset) ->
                                      expectations.stream()
                                          .filter(
                                              e ->
                                                  InjectExpectation.EXPECTATION_TYPE.PREVENTION
                                                      == e.type())
                                          .anyMatch(
                                              (e) ->
                                                  ((PreventionExpectation) e).getAsset() != null
                                                      && ((PreventionExpectation) e)
                                                          .getAsset()
                                                          .getId()
                                                          .equals(asset.getId())))) {
                            yield Stream.of(
                                preventionExpectationForAssetGroup(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    assetGroup,
                                    expectation.isExpectationGroup(),
                                    expectation.getExpirationTime(),
                                    injectExpectationSignatures));
                          }
                          yield Stream.of();
                        }
                        case DETECTION -> {
                          // Verify that at least one asset in the group has been executed
                          List<Asset> assets =
                              this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                          if (assets.stream()
                              .anyMatch(
                                  (asset) ->
                                      expectations.stream()
                                          .filter(
                                              e ->
                                                  InjectExpectation.EXPECTATION_TYPE.DETECTION
                                                      == e.type())
                                          .anyMatch(
                                              (e) ->
                                                  ((DetectionExpectation) e).getAsset() != null
                                                      && ((DetectionExpectation) e)
                                                          .getAsset()
                                                          .getId()
                                                          .equals(asset.getId())))) {
                            yield Stream.of(
                                detectionExpectationForAssetGroup(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    assetGroup,
                                    expectation.isExpectationGroup(),
                                    expectation.getExpirationTime(),
                                    injectExpectationSignatures));
                          }
                          yield Stream.of();
                        }
                        case MANUAL -> {
                          // Verify that at least one asset in the group has been executed
                          List<Asset> assets =
                              this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                          if (assets.stream()
                              .anyMatch(
                                  (asset) ->
                                      expectations.stream()
                                          .filter(
                                              e ->
                                                  InjectExpectation.EXPECTATION_TYPE.MANUAL
                                                      == e.type())
                                          .anyMatch(
                                              (e) ->
                                                  ((ManualExpectation) e).getAsset() != null
                                                      && ((ManualExpectation) e)
                                                          .getAsset()
                                                          .getId()
                                                          .equals(asset.getId())))) {
                            yield Stream.of(
                                manualExpectationForAssetGroup(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    assetGroup,
                                    expectation.getExpirationTime(),
                                    expectation.isExpectationGroup()));
                          }
                          yield Stream.of();
                        }
                        default -> Stream.of();
                      })
              .toList());
    }
  }

  @Override
  public ExecutionProcess process(Execution execution, ExecutableInject injection)
      throws Exception {
    Inject inject =
        this.injectRepository.findById(injection.getInjection().getInject().getId()).orElseThrow();
    Map<Asset, Boolean> assets = this.resolveAllAssets(injection);

    // Check assets target
    if (assets.isEmpty()) {
      execution.addTrace(
          traceError(
              "Found 0 asset to execute the ability on (likely this inject does not have any target or the targeted asset is inactive and has been purged)"));
    }

    // Compute expectations
    OpenBASImplantInjectContent content =
        contentConvert(injection, OpenBASImplantInjectContent.class);

    List<Expectation> expectations = new ArrayList<>();
    assets.forEach(
        (asset, isInGroup) -> {
          Optional<InjectorContract> contract = inject.getInjectorContract();
          List<InjectExpectationSignature> injectExpectationSignatures = new ArrayList<>();

          if (contract.isPresent()) {
            Payload payload = contract.get().getPayload();
            injectExpectationSignatures = spawnSignatures(inject, payload);
            execution.setExpectedCount(
                payload.getPrerequisites().size()
                    + (payload.getCleanupCommand() != null ? 1 : 0)
                    + 1);
          }
          computeExpectationsForAsset(
              expectations, content, asset, isInGroup, injectExpectationSignatures);
        });

    List<AssetGroup> assetGroups = injection.getAssetGroups();
    assetGroups.forEach(
        (assetGroup ->
            computeExpectationsForAssetGroup(
                expectations, content, assetGroup, new ArrayList<>())));
    return new ExecutionProcess(true, expectations);
  }

  private List<InjectExpectationSignature> spawnSignatures(Inject inject, Payload payload) {
    List<InjectExpectationSignature> signatures = new ArrayList<>();

    /*
     * Always add the "Parent process" signature type for the OpenBAS Implant Executor
     */
    signatures.add(
        createSignature(
            EXPECTATION_SIGNATURE_TYPE_PARENT_PROCESS_NAME, "obas-implant-" + inject.getId()));

    switch (payload.getType()) {
      case "Command":
        Command commandPayload = (Command) payload;
        String interpolatedCommand =
            interpolateCommand(commandPayload.getContent(), inject.getContent());
        signatures.add(
            createSignature(
                EXPECTATION_SIGNATURE_TYPE_COMMAND_LINE_BASE64,
                Base64.getEncoder().encodeToString(interpolatedCommand.getBytes())));
        signatures.add(
            createSignature(EXPECTATION_SIGNATURE_TYPE_COMMAND_LINE, interpolatedCommand));
        break;
      case "Executable":
        Executable executablePayload = (Executable) payload;
        signatures.add(
            createSignature(
                EXPECTATION_SIGNATURE_TYPE_FILE_NAME,
                executablePayload.getExecutableFile().getName()));
        break;
      case "FileDrop":
        FileDrop payloadFileDrop = (FileDrop) payload;
        signatures.add(
            createSignature(
                EXPECTATION_SIGNATURE_TYPE_FILE_NAME, payloadFileDrop.getFileDropFile().getName()));
        break;
      case "DnsResolution":
        DnsResolution payloadDnsResolution = (DnsResolution) payload;
        // TODO this is only generating the signature for the first hostname
        // Problem is: we are not supporting multiple signatures of the same type
        // with "AND" parameters, and this can be in multiple alerts downstream in
        // security platforms
        // Tech pain to refine
        signatures.add(
            createSignature(
                EXPECTATION_SIGNATURE_TYPE_HOSTNAME,
                payloadDnsResolution.getHostname().split("\\r?\\n")[0]));
        break;
      default:
        throw new UnsupportedOperationException(
            "Payload type " + payload.getType() + " is not supported");
    }
    return signatures;
  }

  private static InjectExpectationSignature createSignature(
      String signatureType, String signatureValue) {
    return InjectExpectationSignature.builder().type(signatureType).value(signatureValue).build();
  }

  private static String interpolateCommand(String commandMask, ObjectNode injectContent) {
    List<String> placeholders = extractPlaceholderNames(commandMask);
    String interpolatedCommand = commandMask;
    for (String placeholder : placeholders) {
      String value = injectContent.get(placeholder).asText();
      interpolatedCommand = interpolatedCommand.replace("#{" + placeholder + "}", value);
    }
    return interpolatedCommand;
  }

  private static List<String> extractPlaceholderNames(String command) {
    List<String> placeholders = new ArrayList<>();
    Pattern pattern = Pattern.compile("#\\{(.*?)\\}");
    Matcher matcher = pattern.matcher(command);
    while (matcher.find()) {
      placeholders.add(matcher.group(1));
    }
    return placeholders;
  }
}
