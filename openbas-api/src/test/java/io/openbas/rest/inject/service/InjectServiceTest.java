package io.openbas.rest.inject.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Inject;
import io.openbas.database.repository.InjectRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.fixtures.AssetGroupFixture;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class InjectServiceTest {

  private static final String INJECT_ID = "injectid";

  @Mock private InjectRepository injectRepository;

  @InjectMocks private InjectService injectService;

  @Test
  public void testApplyDefaultAssetGroupsToInject_WITH_unexisting_inject() {
    doReturn(Optional.empty()).when(injectRepository).findById(INJECT_ID);
    assertThrows(
        ElementNotFoundException.class,
        () -> {
          injectService.applyDefaultAssetGroupsToInject(INJECT_ID, List.of(), List.of());
        });
  }

  @Test
  public void testApplyDefaultAssetGroupsToInject_WITH_add_and_remove() {
    AssetGroup assetGroup1 = getAssetGroup("assetgroup1");
    AssetGroup assetGroup2 = getAssetGroup("assetgroup2");
    AssetGroup assetGroup3 = getAssetGroup("assetgroup3");
    AssetGroup assetGroup4 = getAssetGroup("assetgroup4");
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setAssetGroups(List.of(assetGroup1, assetGroup2, assetGroup3));
    doReturn(Optional.of(inject)).when(injectRepository).findById(INJECT_ID);

    injectService.applyDefaultAssetGroupsToInject(
        INJECT_ID, List.of(assetGroup4), List.of(assetGroup3));

    ArgumentCaptor<Inject> injectCaptor = ArgumentCaptor.forClass(Inject.class);
    verify(injectRepository).save(injectCaptor.capture());
    Inject capturedInject = injectCaptor.getValue();
    assertEquals(INJECT_ID, capturedInject.getId());
    assertEquals(
        new HashSet<>(List.of(assetGroup1, assetGroup2, assetGroup4)),
        new HashSet<>(capturedInject.getAssetGroups()));
  }

  @Test
  public void testApplyDefaultAssetGroupsToInject_WITH_remove_all() {
    AssetGroup assetGroup1 = getAssetGroup("assetgroup1");
    AssetGroup assetGroup2 = getAssetGroup("assetgroup2");
    AssetGroup assetGroup3 = getAssetGroup("assetgroup3");
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setAssetGroups(List.of(assetGroup1, assetGroup2, assetGroup3));
    doReturn(Optional.of(inject)).when(injectRepository).findById(INJECT_ID);

    injectService.applyDefaultAssetGroupsToInject(
        INJECT_ID, List.of(), List.of(assetGroup1, assetGroup2, assetGroup3));

    ArgumentCaptor<Inject> injectCaptor = ArgumentCaptor.forClass(Inject.class);
    verify(injectRepository).save(injectCaptor.capture());
    Inject capturedInject = injectCaptor.getValue();
    assertEquals(INJECT_ID, capturedInject.getId());
    assertEquals(List.of(), capturedInject.getAssetGroups());
  }

  @Test
  public void testApplyDefaultAssetGroupsToInject_WITH_add_all() {
    AssetGroup assetGroup1 = getAssetGroup("assetgroup1");
    AssetGroup assetGroup2 = getAssetGroup("assetgroup2");
    AssetGroup assetGroup3 = getAssetGroup("assetgroup3");
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setAssetGroups(List.of());
    doReturn(Optional.of(inject)).when(injectRepository).findById(INJECT_ID);

    injectService.applyDefaultAssetGroupsToInject(
        INJECT_ID, List.of(assetGroup1, assetGroup2, assetGroup3), List.of());

    ArgumentCaptor<Inject> injectCaptor = ArgumentCaptor.forClass(Inject.class);
    verify(injectRepository).save(injectCaptor.capture());
    Inject capturedInject = injectCaptor.getValue();
    assertEquals(INJECT_ID, capturedInject.getId());
    assertEquals(
        new HashSet<>(List.of(assetGroup1, assetGroup2, assetGroup3)),
        new HashSet<>(capturedInject.getAssetGroups()));
  }

  @Test
  public void testApplyDefaultAssetGroupsToInject_WITH_no_change() {
    AssetGroup assetGroup1 = getAssetGroup("assetgroup1");
    AssetGroup assetGroup2 = getAssetGroup("assetgroup2");
    AssetGroup assetGroup3 = getAssetGroup("assetgroup3");
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setAssetGroups(List.of(assetGroup1, assetGroup2, assetGroup3));
    doReturn(Optional.of(inject)).when(injectRepository).findById(INJECT_ID);

    injectService.applyDefaultAssetGroupsToInject(
        INJECT_ID, List.of(assetGroup1), List.of(assetGroup1));

    verify(injectRepository, never()).save(any());
  }

  private AssetGroup getAssetGroup(String name) {
    AssetGroup assetGroup = AssetGroupFixture.createDefaultAssetGroup(name);
    assetGroup.setId(name);
    return assetGroup;
  }
}
