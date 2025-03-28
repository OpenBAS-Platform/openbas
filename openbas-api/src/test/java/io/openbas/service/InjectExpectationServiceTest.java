package io.openbas.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.utils.fixtures.*;
import java.util.List;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InjectExpectationServiceTest {

  static Long EXPIRATION_TIME_SIX_HOURS = 21600L;

  @Mock private InjectExpectationRepository mockedInjectExpectationRepository;
  @InjectMocks private InjectExpectationService testInjectExpectationService;

  @Test
  void preventionExpectationsNotExpired_NoneExpired() {
    // Arrange
    Inject inject = InjectFixture.getDefaultInject();
    InjectExpectation preventionExpectation =
        InjectExpectationFixture.createPreventionInjectExpectation(null, inject);
    InjectExpectation preventionExpectation2 =
        InjectExpectationFixture.createPreventionInjectExpectation(null, inject);

    when(mockedInjectExpectationRepository.findAll(any()))
        .thenReturn(List.of(preventionExpectation, preventionExpectation2));

    // Act
    List<InjectExpectation> result =
        testInjectExpectationService.preventionExpectationsNotExpired(
            EXPIRATION_TIME_SIX_HOURS.intValue() * 2);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(preventionExpectation.getId(), result.get(0).getId());
  }

  @Test
  void detectionExpectationsNotExpired_NoneExpired() {
    // Arrange
    Inject inject = InjectFixture.getDefaultInject();
    InjectExpectation detectionExpectation =
        InjectExpectationFixture.createDetectionInjectExpectation(null, inject);
    InjectExpectation detectionExpectation2 =
        InjectExpectationFixture.createDetectionInjectExpectation(null, inject);

    when(mockedInjectExpectationRepository.findAll(any()))
        .thenReturn(List.of(detectionExpectation, detectionExpectation2));

    // Act
    List<InjectExpectation> result =
        testInjectExpectationService.detectionExpectationsNotExpired(
            EXPIRATION_TIME_SIX_HOURS.intValue() * 2);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(detectionExpectation.getId(), result.get(0).getId());
  }

  @Test
  void manualExpectationsNotExpired_NoneExpired() {
    // Arrange
    Inject inject = InjectFixture.getDefaultInject();
    InjectExpectation manualExpectation =
        InjectExpectationFixture.createManualInjectExpectation(null, inject);
    InjectExpectation manualExpectation2 =
        InjectExpectationFixture.createManualInjectExpectation(null, inject);

    when(mockedInjectExpectationRepository.findAll(any()))
        .thenReturn(List.of(manualExpectation, manualExpectation2));

    // Act
    List<InjectExpectation> result =
        testInjectExpectationService.detectionExpectationsNotExpired(
            EXPIRATION_TIME_SIX_HOURS.intValue() * 2);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(manualExpectation.getId(), result.get(0).getId());
  }
}
