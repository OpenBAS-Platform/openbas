package io.openbas.asset;

import io.openbas.database.model.Asset;
import io.openbas.database.repository.AssetRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import static io.openbas.helper.StreamHelper.fromIterable;

@RequiredArgsConstructor
@Service
public class AssetService {

  private final AssetRepository assetRepository;

  public Asset asset(@NotBlank final String assetId) {
    return this.assetRepository.findById(assetId).orElseThrow();
  }

  public List<Asset> assets(@NotBlank final List<String> assetIds) {
    return fromIterable(this.assetRepository.findAllById(assetIds));
  }

  public List<Asset> assets() {
    return fromIterable(this.assetRepository.findAll());
  }

  public List<Asset> assetsFromTypes(@NotNull final List<String> types) {
    return this.assetRepository.findByType(types);
  }

  public Iterable<Asset> assetFromIds(@NotNull final List<String> assetIds) {
    return this.assetRepository.findAllById(assetIds);
  }

}
