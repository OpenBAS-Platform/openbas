package io.openbas.collectors.expectations_expiration_manager.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.asset.EndpointService;
import io.openbas.collectors.expectations_expiration_manager.config.ExpectationsExpirationManagerConfig;
import io.openbas.database.model.Asset;
import io.openbas.database.model.InjectExpectation;
import io.openbas.inject_expectation.InjectExpectationService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static io.openbas.collectors.expectations_expiration_manager.utils.ExpectationUtils.computeFailedMessage;
import static java.util.stream.Stream.concat;
import static io.openbas.collectors.expectations_expiration_manager.config.ExpectationsExpirationManagerConfig.PRODUCT_NAME;
import static io.openbas.collectors.expectations_expiration_manager.utils.ExpectationUtils.isExpired;

@RequiredArgsConstructor
@Service
@Log
public class ExpectationsExpirationManagerService {

    private final InjectExpectationService injectExpectationService;
    private final EndpointService endpointService;
    private final ExpectationsExpirationManagerConfig config;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(rollbackFor = Exception.class)
    public void computeExpectations() {
        // Retrieve all expectations
        List<InjectExpectation> preventionExpectations = this.injectExpectationService.preventionExpectationsNotFill();
        log.info("Number of prevention expectations: " + preventionExpectations.size());

        List<InjectExpectation> detectionExpectations = this.injectExpectationService.detectionExpectationsNotFill();
        log.info("Number of detection expectations: " + detectionExpectations.size());

        List<InjectExpectation> expectations = concat(preventionExpectations.stream(), detectionExpectations.stream()).toList();

        if (!expectations.isEmpty()) {
            this.computeExpectationForAssets(expectations);
            this.computeExpectationForAssetGroups(expectations);
        }
    }

    // -- PRIVATE --

    private void computeExpectationForAssets(@NotNull final List<InjectExpectation> expectations) {
        List<InjectExpectation> expectationAssets = expectations.stream().filter(e -> e.getAsset() != null).toList();
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
}
