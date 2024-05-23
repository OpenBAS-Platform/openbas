package io.openbas.collectors.sentinel.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.asset.EndpointService;
import io.openbas.collectors.sentinel.client.LogAnalyticsRestApiCaller;
import io.openbas.collectors.sentinel.config.CollectorSentinelConfig;
import io.openbas.collectors.sentinel.domain.QueryResult;
import io.openbas.collectors.sentinel.domain.Table;
import io.openbas.database.model.Asset;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.InjectExpectation;
import io.openbas.inject_expectation.InjectExpectationService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.function.Predicate;

import static io.openbas.collectors.sentinel.config.CollectorSentinelConfig.PRODUCT_NAME;
import static io.openbas.collectors.sentinel.domain.Table.getAction;
import static io.openbas.collectors.sentinel.domain.Table.getIncidentId;
import static io.openbas.collectors.sentinel.utils.ExpectationUtils.computeFailedMessage;
import static io.openbas.collectors.sentinel.utils.ExpectationUtils.isExpired;
import static io.openbas.collectors.sentinel.utils.FuzzyMatchUtils.fuzzyMatch;
import static io.openbas.collectors.sentinel.utils.InstantUtils.toInstant;
import static io.openbas.collectors.sentinel.utils.TableUtils.*;
import static io.openbas.database.model.Endpoint.ENDPOINT_TYPE;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.DETECTION;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.PREVENTION;
import static io.openbas.inject_expectation.InjectExpectationUtils.getCommandLine;
import static java.util.stream.Stream.concat;
import static org.springframework.util.StringUtils.hasText;

@RequiredArgsConstructor
@Service
@Log
@ConditionalOnProperty(prefix = "collector.sentinel", name = "enable")
public class LogAnalyticsService {

  private final LogAnalyticsRestApiCaller logAnalyticsRestApiCaller;
  private final InjectExpectationService injectExpectationService;
  private final EndpointService endpointService;
  private final CollectorSentinelConfig config;
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Transactional(rollbackFor = Exception.class)
  public void computeExpectations() {
    QueryResult queryResult = queryResult();
    if (queryResult != null) {

      // Retrieve all expectations
      List<InjectExpectation> preventionExpectations = this.injectExpectationService.preventionExpectationsNotFill(this.config.getId());
      log.info("Number of prevention expectations: " + preventionExpectations.size());

      List<InjectExpectation> detectionExpectations = this.injectExpectationService
          .detectionExpectationsNotFill(this.config.getId());
      log.info("Number of detection expectations: " + detectionExpectations.size());

      List<InjectExpectation> expectations = concat(
          preventionExpectations.stream(),
          detectionExpectations.stream()
      ).toList();

      if (!expectations.isEmpty()) {
        this.computeExpectationForAssets(queryResult, expectations);
        this.computeExpectationForAssetGroups(expectations);
      }
    }
  }

  // -- PRIVATE --

  private void computeExpectationForAssets(
      @NotNull final QueryResult queryResult,
      @NotNull final List<InjectExpectation> expectations) {
    List<InjectExpectation> expectationAssets = expectations.stream()
        .filter(e -> e.getAsset() != null)
        .toList();

    expectationAssets.forEach((expectation) -> {
      Asset asset = expectation.getAsset();
      // Maximum time for detection
      if (isExpired(expectation, this.config.getExpirationTimeInMinute())) {
        String result = computeFailedMessage(expectation.getType());
        this.injectExpectationService.computeExpectation(
            expectation,
            this.config.getId(),
            PRODUCT_NAME,
            result,
            false
        );
      } else if (ENDPOINT_TYPE.equals(asset.getType())) {
        Endpoint endpoint = this.endpointService.endpoint(asset.getId());
        // Fill expectation
        List<Action> actions = matchOnAlert(endpoint, queryResult, expectation);
        if (!actions.isEmpty()) {
          actions.forEach((action) -> {
            // Prevention
            if (PREVENTION.equals(expectation.getType()) && isActionPrevention(action.action)) {
              try {
                this.injectExpectationService.computeExpectation(
                    expectation,
                    this.config.getId(),
                    PRODUCT_NAME,
                    this.objectMapper.writeValueAsString(action),
                    true
                );
              } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
              }
              // Detection
            } else if (DETECTION.equals(expectation.getType()) && isActionDetection(action.action)) {
              try {
                this.injectExpectationService.computeExpectation(
                    expectation,
                    this.config.getId(),
                    PRODUCT_NAME,
                    this.objectMapper.writeValueAsString(action),
                    true
                );
              } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
              }
            }
          });
        }
      }
    });
  }

  private void computeExpectationForAssetGroups(@NotNull final List<InjectExpectation> expectations) {
    List<InjectExpectation> expectationAssetGroups = expectations.stream().filter(e -> e.getAssetGroup() != null).toList();
    expectationAssetGroups.forEach((expectationAssetGroup -> {
      List<InjectExpectation> expectationAssets = this.injectExpectationService.expectationsForAssets(
          expectationAssetGroup.getInject(), expectationAssetGroup.getAssetGroup(), expectationAssetGroup.getType()
      );
      // Every expectation assets are filled
      if (expectationAssets.stream().noneMatch(e -> e.getResults().isEmpty())) {
        this.injectExpectationService.computeExpectationGroup(
            expectationAssetGroup,
            expectationAssets,
            this.config.getId(),
            PRODUCT_NAME
        );
      }
    }));
  }

  private List<Action> matchOnAlert(
      @NotNull final Endpoint endpoint,
      @NotNull final QueryResult queryResult,
      @NotNull final InjectExpectation expectation) {
    Optional<Table> tableOpt = extractTableFromQueryResult(queryResult);
    if (tableOpt.isPresent()) {
      Table table = tableOpt.get();
      Map<String, Integer> propertyMap = computeIndexPropertyFromTable(table);

      // Not valid
      if (propertyMap.values().stream().anyMatch((v) -> v == -1)) {
        return List.of();
      }

      // Retrieve security alert for hostname
      List<List<String>> securityAlertForHostname = table
          .getRows()
          .stream()
//          .filter(filterRowAfter(propertyMap, expectation.getCreatedAt()))
          .filter(filterRowOnHostname(propertyMap, endpoint.getHostname()))
          .toList();

      // Retrieve security alert for command line
      List<List<String>> securityAlertForHostnameAndCommandLine = securityAlertForHostname
          .stream()
          .filter(filterRowOnCommandLine(propertyMap, getCommandLine(expectation)))
          .toList();
      // Retrieve security alert for action
      List<List<String>> securityAlertForHostnameAndAction = securityAlertForHostname
          .stream()
          .filter(filterRowOnAction(propertyMap))
          .toList();

      // Reconciliation between action and command line
      List<List<String>> securityAlertActions = new ArrayList<>();
      securityAlertForHostnameAndCommandLine.forEach((securityAlert) -> {
        LinkedHashMap<String, Object> extendedProperties = extendedPropertiesFromRow(securityAlert, propertyMap);
        String incidentId = getIncidentId(extendedProperties);
        String alertName = securityAlert.get(propertyMap.get(ALERT_NAME));
        securityAlertForHostnameAndAction.forEach((line) -> {
          LinkedHashMap<String, Object> extendedPropertiesLine = extendedPropertiesFromRow(line, propertyMap);
          String incidentLineId = getIncidentId(extendedPropertiesLine);
          String alertNameLine = securityAlert.get(propertyMap.get(ALERT_NAME));
          if (alertNameLine.equals(alertName) && incidentLineId.equals(incidentId)) {
            securityAlertActions.add(line);
          }
        });
      });

      // Build transient object
      return securityAlertActions
          .stream()
          .map(securityAlert -> {
            LinkedHashMap<String, Object> extendedProperties = extendedPropertiesFromRow(securityAlert, propertyMap);
            String action = getAction(extendedProperties);
            String description = securityAlert.get(propertyMap.get(DESCRIPTION));
            String severity = securityAlert.get(propertyMap.get(ALERT_SEVERITY));
            String link = securityAlert.get(propertyMap.get(ALERT_LINK));
            return new Action(action, description, severity, link);
          })
          .toList();
    }
    return List.of();
  }

  // -- QUERY --

  private QueryResult queryResult() {
    String jsonResponse = this.logAnalyticsRestApiCaller.retrieveSecurityAlert();
    try {
      return this.objectMapper.readValue(jsonResponse, new TypeReference<>() {
      });
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  // -- FILTER --

  private Predicate<List<String>> filterRowAfter(
      @NotNull final Map<String, Integer> propertyMap,
      @NotNull final Instant expectationDate) {
    return row -> {
      String dateString = row.get(propertyMap.get(TIME_GENERATED));
      Instant date = toInstant(dateString);
      return date.isAfter(expectationDate);
    };
  }

  private Predicate<List<String>> filterRowOnHostname(
      @NotNull final Map<String, Integer> propertyMap,
      @NotBlank final String hostname) {
    return row -> {
      List<LinkedHashMap<String, Object>> entities = entitiesFromRow(row, propertyMap);
      return entities.stream().anyMatch(e -> hostname.equalsIgnoreCase(Table.Entities.getHostName(e)));
    };
  }

  private Predicate<List<String>> filterRowOnCommandLine(
      @NotNull final Map<String, Integer> propertyMap,
      @NotNull final Optional<java.lang.String> commandLine) {
    return row -> {
      List<LinkedHashMap<String, Object>> entities = entitiesFromRow(row, propertyMap);
      return entities.stream()
          .anyMatch(e -> commandLine.map(
                  cl -> hasText(Table.Entities.getCommandLine(e))
                      && fuzzyMatch(Table.Entities.getCommandLine(e), cl, 70)
              )
              .orElse(false));
    };
  }

  private Predicate<List<String>> filterRowOnAction(@NotNull final Map<String, Integer> propertyMap) {
    return row -> {
      LinkedHashMap<String, Object> extendedProperties = extendedPropertiesFromRow(row, propertyMap);
      String action = getAction(extendedProperties);
      return isValidAction(action);
    };
  }

  public record Action(String action, String description, String severity, String link) {

  }

}
