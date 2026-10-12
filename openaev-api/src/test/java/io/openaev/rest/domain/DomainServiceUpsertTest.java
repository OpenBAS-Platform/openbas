package io.openaev.rest.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.openaev.database.model.Domain;
import io.openaev.database.model.Tenant;
import io.openaev.database.repository.DomainRepository;
import io.openaev.rest.domain.enums.PresetDomain;
import io.openaev.rest.injector_contract.form.InjectorContractDomainDTO;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("Domain upsert resolution")
class DomainServiceUpsertTest {

  private static final String TENANT_ID = "tenant-under-test";

  @Mock private DomainRepository domainRepository;
  @InjectMocks private DomainService domainService;

  private static Domain domain(String name, String color) {
    return Domain.builder()
        .id(UUID.randomUUID().toString())
        .name(name)
        .color(color)
        .tenant(new Tenant(TENANT_ID))
        .build();
  }

  private static Domain tabletopPreset() {
    return domain(PresetDomain.getTabletop().getName(), PresetDomain.getTabletop().getColor());
  }

  private static InjectorContractDomainDTO dto(String name, String color) {
    InjectorContractDomainDTO dto = new InjectorContractDomainDTO();
    dto.setName(name);
    dto.setColor(color);
    return dto;
  }

  @Nested
  @DisplayName("Single upsert")
  class SingleUpsert {

    @Test
    @DisplayName("given_legacyPresetSpelling_should_reuseThePresetWithoutCreatingADomain")
    void given_legacyPresetSpelling_should_reuseThePresetWithoutCreatingADomain() {
      // Arrange
      Domain tabletop = tabletopPreset();
      when(domainRepository.findByNameAndTenantId("Table-Top", TENANT_ID))
          .thenReturn(Optional.empty());
      when(domainRepository.findByTenantId(TENANT_ID))
          .thenReturn(List.of(domain("Cloud", "#9999CC"), tabletop));

      // Act
      Domain resolved = domainService.upsert("Table-Top", "#FFCC33", new Tenant(TENANT_ID));

      // Assert
      assertThat(resolved).isSameAs(tabletop);
      verify(domainRepository, never()).save(any());
    }

    @Test
    @DisplayName("given_exactName_should_winOverAMatchingKey")
    void given_exactName_should_winOverAMatchingKey() {
      // Arrange
      Domain legacy = domain("Table-Top", "#FFCC33");
      when(domainRepository.findByNameAndTenantId("Table-Top", TENANT_ID))
          .thenReturn(Optional.of(legacy));

      // Act
      Domain resolved = domainService.upsert("Table-Top", "#FFCC33", new Tenant(TENANT_ID));

      // Assert
      assertThat(resolved).isSameAs(legacy);
      verify(domainRepository, never()).findByTenantId(any());
      verify(domainRepository, never()).save(any());
    }

    @Test
    @DisplayName("given_unknownName_should_createItUnchanged")
    void given_unknownName_should_createItUnchanged() {
      // Arrange
      when(domainRepository.findByNameAndTenantId("Satellite", TENANT_ID))
          .thenReturn(Optional.empty());
      when(domainRepository.findByTenantId(TENANT_ID)).thenReturn(List.of(tabletopPreset()));
      when(domainRepository.save(any(Domain.class))).thenAnswer(call -> call.getArgument(0));

      // Act
      Domain created = domainService.upsert("Satellite", "#123456", new Tenant(TENANT_ID));

      // Assert
      assertThat(created.getName()).isEqualTo("Satellite");
      assertThat(created.getColor()).isEqualTo("#123456");
      assertThat(created.getTenant().getId()).isEqualTo(TENANT_ID);
      verify(domainRepository).save(created);
    }

    @Test
    @DisplayName("given_nameWithoutLetterOrDigit_should_neverMatchAnotherOne")
    void given_nameWithoutLetterOrDigit_should_neverMatchAnotherOne() {
      // Arrange
      when(domainRepository.findByNameAndTenantId("---", TENANT_ID)).thenReturn(Optional.empty());
      when(domainRepository.findByTenantId(TENANT_ID))
          .thenReturn(List.of(domain("***", "#000000")));
      when(domainRepository.save(any(Domain.class))).thenAnswer(call -> call.getArgument(0));

      // Act
      Domain created = domainService.upsert("---", "#111111", new Tenant(TENANT_ID));

      // Assert
      assertThat(created.getName()).isEqualTo("---");
      verify(domainRepository).save(created);
    }
  }

  @Nested
  @DisplayName("Batch upsert")
  class BatchUpsert {

    @Test
    @DisplayName(
        "given_legacyAndExactAndNewNames_should_reuseResolvedDomainsAndCreateOnlyTheNewOne")
    void given_legacyAndExactAndNewNames_should_reuseResolvedDomainsAndCreateOnlyTheNewOne() {
      // Arrange
      Domain tabletop = tabletopPreset();
      Domain cloud = domain("Cloud", "#9999CC");
      when(domainRepository.findByNameInAndTenantId(anyCollection(), eq(TENANT_ID)))
          .thenReturn(List.of(cloud));
      when(domainRepository.findByTenantId(TENANT_ID)).thenReturn(List.of(cloud, tabletop));
      when(domainRepository.save(any(Domain.class))).thenAnswer(call -> call.getArgument(0));

      // Act
      Set<Domain> resolved =
          domainService.upserts(
              Set.of(
                  dto("Table-Top", "#FFCC33"),
                  dto("Cloud", "#9999CC"),
                  dto("Satellite", "#123456")),
              TENANT_ID);

      // Assert
      assertThat(resolved)
          .extracting(Domain::getName)
          .containsExactlyInAnyOrder("Tabletop", "Cloud", "Satellite");
      assertThat(resolved).contains(tabletop, cloud);
      ArgumentCaptor<Domain> saved = ArgumentCaptor.forClass(Domain.class);
      verify(domainRepository).save(saved.capture());
      assertThat(saved.getValue().getName()).isEqualTo("Satellite");
    }

    @Test
    @DisplayName("given_everyNameMatchingExactly_should_notLoadTheTenantDomains")
    void given_everyNameMatchingExactly_should_notLoadTheTenantDomains() {
      // Arrange
      Domain cloud = domain("Cloud", "#9999CC");
      when(domainRepository.findByNameInAndTenantId(anyCollection(), eq(TENANT_ID)))
          .thenReturn(List.of(cloud));

      // Act
      Set<Domain> resolved = domainService.upserts(Set.of(dto("Cloud", "#9999CC")), TENANT_ID);

      // Assert
      assertThat(resolved).containsExactly(cloud);
      verify(domainRepository, never()).findByTenantId(any());
      verify(domainRepository, never()).save(any());
    }

    @Test
    @DisplayName("given_twoNewSpellingsOfTheSameName_should_createASingleDomain")
    void given_twoNewSpellingsOfTheSameName_should_createASingleDomain() {
      // Arrange
      when(domainRepository.findByNameInAndTenantId(anyCollection(), eq(TENANT_ID)))
          .thenReturn(List.of());
      when(domainRepository.findByTenantId(TENANT_ID)).thenReturn(List.of());
      when(domainRepository.save(any(Domain.class))).thenAnswer(call -> call.getArgument(0));

      // Act
      Set<Domain> resolved =
          domainService.upserts(
              Set.of(dto("Space-Ops", "#123456"), dto("space ops", "#654321")), TENANT_ID);

      // Assert
      assertThat(resolved).hasSize(1);
      verify(domainRepository).save(any(Domain.class));
    }
  }

  @Nested
  @DisplayName("Matching key resolution")
  class MatchingKeyResolution {

    @Test
    @DisplayName("given_presetAndCustomSharingAKey_should_preferThePreset")
    void given_presetAndCustomSharingAKey_should_preferThePreset() {
      // Arrange
      Domain tabletop = tabletopPreset();
      List<Domain> candidates = List.of(domain("table top", "#000000"), tabletop);

      // Act
      Optional<Domain> resolved = DomainService.findByMatchingKey("TABLE_TOP", candidates);

      // Assert
      assertThat(resolved).containsSame(tabletop);
    }

    @Test
    @DisplayName("given_noCandidateSharingTheKey_should_returnEmpty")
    void given_noCandidateSharingTheKey_should_returnEmpty() {
      // Act
      Optional<Domain> resolved =
          DomainService.findByMatchingKey("Table-Top", List.of(domain("Cloud", "#9999CC")));

      // Assert
      assertThat(resolved).isEmpty();
    }
  }
}
