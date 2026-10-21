package io.openaev.secrets.service;

import static io.openaev.database.model.CredentialSecretReference.CREDENTIAL_AUTH_METHOD.AZURE_SERVICE_PRINCIPAL;
import static io.openaev.database.model.SecretReference.SECRET_STATUS.ACTIVE;
import static io.openaev.database.model.SecretReference.SECRET_STATUS.UNSET;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import io.openaev.context.TenantScopedTransaction;
import io.openaev.database.model.CredentialSecretReference;
import io.openaev.database.model.SecretReference;
import io.openaev.database.model.Tenant;
import io.openaev.database.repository.SecretReferenceRepository;
import io.openaev.secrets.provider.SecretConnectionProbe;
import io.openaev.secrets.provider.SecretConnectionResult;
import io.openaev.secrets.provider.SecretsProvider;
import java.util.List;
import java.util.function.Supplier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("SecretValidationOnWriteService tests")
class SecretValidationOnWriteServiceTest {

  private static final String TENANT_ID = "tenant-id";
  private static final String REFERENCE_ID = "reference-id";

  @Mock private SecretReferenceRepository secretReferenceRepository;
  @Mock private TenantScopedTransaction tenantTx;
  @Mock private SecretsProvider provider;
  @Mock private CredentialSecretReference credentialReference;
  @Mock private Tenant tenant;

  @InjectMocks private SecretValidationService service;

  @SuppressWarnings("unchecked")
  private void mockTenantTransactionsAsPassThrough() {
    when(tenantTx.execute(any(), any(Supplier.class)))
        .thenAnswer(invocation -> ((Supplier<Object>) invocation.getArgument(1)).get());
  }

  private static boolean containsReferenceId(Iterable<String> ids) {
    for (String id : ids) {
      if (REFERENCE_ID.equals(id)) {
        return true;
      }
    }
    return false;
  }

  @Nested
  @DisplayName("validateAfterWrite")
  class ValidateAfterWrite {

    @Test
    @DisplayName("Given null reference, should skip validation and persistence")
    void given_nullReference_should_skipValidationAndPersistence() {
      // Arrange
      // Act
      service.validateAfterWrite(provider, null);

      // Assert
      verifyNoInteractions(provider, secretReferenceRepository);
    }

    @Test
    @DisplayName("Given blank reference id, should skip validation and persistence")
    void given_blankReferenceId_should_skipValidationAndPersistence() {
      // Arrange
      when(credentialReference.getId()).thenReturn("   ");

      // Act
      service.validateAfterWrite(provider, credentialReference);

      // Assert
      verify(provider, never()).prepareConnectionCheck(any());
      verifyNoInteractions(secretReferenceRepository);
    }

    @Test
    @DisplayName("Given active probe result, should persist updated status")
    void given_activeProbeResult_should_persistUpdatedStatus() {
      // Arrange
      mockTenantTransactionsAsPassThrough();
      SecretReference storedReference = new SecretReference();
      storedReference.setId(REFERENCE_ID);
      storedReference.setStatus(UNSET);

      when(credentialReference.getId()).thenReturn(REFERENCE_ID);
      when(credentialReference.getTenant()).thenReturn(tenant);
      when(tenant.getId()).thenReturn(TENANT_ID);
      when(credentialReference.getCredentialAuthMethod()).thenReturn(AZURE_SERVICE_PRINCIPAL);
      when(provider.prepareConnectionCheck(credentialReference))
          .thenReturn(SecretConnectionProbe.of(SecretConnectionResult.active()));
      when(secretReferenceRepository.findAllById(
              argThat(SecretValidationOnWriteServiceTest::containsReferenceId)))
          .thenReturn(List.of(storedReference));

      // Act
      service.validateAfterWrite(provider, credentialReference);

      // Assert
      verify(provider).prepareConnectionCheck(credentialReference);
      verify(secretReferenceRepository)
          .findAllById(argThat(SecretValidationOnWriteServiceTest::containsReferenceId));
      verify(secretReferenceRepository).saveAll(any());
      assertThat(storedReference.getStatus()).isEqualTo(ACTIVE);
    }
  }
}
