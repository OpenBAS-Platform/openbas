package io.openbas.rest.inject.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import io.openbas.database.model.Asset;
import io.openbas.database.model.Inject;
import io.openbas.database.repository.InjectRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.fixtures.AssetFixture;
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
  public void testApplyDefaultAssetsToInject_WITH_unexisting_inject() {
    doReturn(Optional.empty()).when(injectRepository).findById(INJECT_ID);
    assertThrows(
        ElementNotFoundException.class,
        () -> {
          injectService.applyDefaultAssetsToInject(INJECT_ID, List.of(), List.of());
        });
  }

  @Test
  public void testApplyDefaultAssetsToInject_WITH_add_and_remove() {
    Asset asset1 = AssetFixture.createDefaultAsset("asset1");
    Asset asset2 = AssetFixture.createDefaultAsset("asset2");
    Asset asset3 = AssetFixture.createDefaultAsset("asset3");
    Asset asset4 = AssetFixture.createDefaultAsset("asset4");
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setAssets(List.of(asset1, asset2, asset3));
    doReturn(Optional.of(inject)).when(injectRepository).findById(INJECT_ID);

    injectService.applyDefaultAssetsToInject(INJECT_ID, List.of(asset4), List.of(asset3));

    ArgumentCaptor<Inject> injectCaptor = ArgumentCaptor.forClass(Inject.class);
    verify(injectRepository).save(injectCaptor.capture());
    Inject capturedInject = injectCaptor.getValue();
    assertEquals(INJECT_ID, capturedInject.getId());
    assertEquals(
        new HashSet<>(List.of(asset1, asset2, asset4)), new HashSet<>(capturedInject.getAssets()));
  }

  @Test
  public void testApplyDefaultAssetsToInject_WITH_remove_all() {
    Asset asset1 = AssetFixture.createDefaultAsset("asset1");
    Asset asset2 = AssetFixture.createDefaultAsset("asset2");
    Asset asset3 = AssetFixture.createDefaultAsset("asset3");
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setAssets(List.of(asset1, asset2, asset3));
    doReturn(Optional.of(inject)).when(injectRepository).findById(INJECT_ID);

    injectService.applyDefaultAssetsToInject(INJECT_ID, List.of(), List.of(asset1, asset2, asset3));

    ArgumentCaptor<Inject> injectCaptor = ArgumentCaptor.forClass(Inject.class);
    verify(injectRepository).save(injectCaptor.capture());
    Inject capturedInject = injectCaptor.getValue();
    assertEquals(INJECT_ID, capturedInject.getId());
    assertEquals(List.of(), capturedInject.getAssets());
  }

  @Test
  public void testApplyDefaultAssetsToInject_WITH_add_all() {
    Asset asset1 = AssetFixture.createDefaultAsset("asset1");
    Asset asset2 = AssetFixture.createDefaultAsset("asset2");
    Asset asset3 = AssetFixture.createDefaultAsset("asset3");
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setAssets(List.of());
    doReturn(Optional.of(inject)).when(injectRepository).findById(INJECT_ID);

    injectService.applyDefaultAssetsToInject(INJECT_ID, List.of(asset1, asset2, asset3), List.of());

    ArgumentCaptor<Inject> injectCaptor = ArgumentCaptor.forClass(Inject.class);
    verify(injectRepository).save(injectCaptor.capture());
    Inject capturedInject = injectCaptor.getValue();
    assertEquals(INJECT_ID, capturedInject.getId());
    assertEquals(
        new HashSet<>(List.of(asset1, asset2, asset3)), new HashSet<>(capturedInject.getAssets()));
  }

  @Test
  public void testApplyDefaultAssetsToInject_WITH_no_change() {
    Asset asset1 = AssetFixture.createDefaultAsset("asset1");
    Asset asset2 = AssetFixture.createDefaultAsset("asset2");
    Asset asset3 = AssetFixture.createDefaultAsset("asset3");
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setAssets(List.of(asset1, asset2, asset3));
    doReturn(Optional.of(inject)).when(injectRepository).findById(INJECT_ID);

    injectService.applyDefaultAssetsToInject(INJECT_ID, List.of(asset1), List.of(asset1));

    verify(injectRepository, never()).save(any());
  }
}
