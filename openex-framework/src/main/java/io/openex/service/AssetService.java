package io.openex.service;

import io.openex.database.model.Asset;
import io.openex.database.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.validation.constraints.NotNull;
import java.util.List;

@RequiredArgsConstructor
@Service
public class AssetService {

  private final AssetRepository assetRepository;

  public List<Asset> assets(@NotNull final List<String> types) {
    return this.assetRepository.findByType(types);
  }

}
