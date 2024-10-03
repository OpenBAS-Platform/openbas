package io.openbas.asset;

import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Endpoint;
import io.openbas.database.raw.RawAsset;
import io.openbas.database.raw.RawAssetGroup;
import io.openbas.database.repository.AssetGroupRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openbas.database.model.Filters.isEmptyFilterGroup;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.FilterUtilsJpa.computeFilterGroupJpa;
import static io.openbas.utils.FilterUtilsRuntime.computeFilterGroupRuntime;
import static java.time.Instant.now;
import static java.util.Collections.emptyList;

@RequiredArgsConstructor
@Service
public class AssetGroupService {

    private final AssetGroupRepository assetGroupRepository;
    private final AssetService assetService;
    private final EndpointService endpointService;

    // -- ASSET GROUP --

    public AssetGroup createAssetGroup(@NotNull final AssetGroup assetGroup) {
        AssetGroup assetGroupCreated = this.assetGroupRepository.save(assetGroup);
        return computeDynamicAssets(assetGroupCreated);
    }

    public List<AssetGroup> assetGroups() {
        List<AssetGroup> assetGroups = fromIterable(this.assetGroupRepository.findAll());
        return computeDynamicAssets(assetGroups);
    }

    public List<AssetGroup> assetGroups(@NotBlank final List<String> assetGroupIds) {
        List<AssetGroup> assetGroups = fromIterable(this.assetGroupRepository.findAllById(assetGroupIds));
        return computeDynamicAssets(assetGroups);
    }

    public AssetGroup assetGroup(@NotBlank final String assetGroupId) {
        AssetGroup assetGroup = this.assetGroupRepository.findById(assetGroupId).orElseThrow();
        return computeDynamicAssets(assetGroup);
    }

    public AssetGroup updateAssetGroup(@NotNull final AssetGroup assetGroup) {
        assetGroup.setUpdatedAt(now());
        AssetGroup assetGroupUpdated = this.assetGroupRepository.save(assetGroup);
        return computeDynamicAssets(assetGroupUpdated);
    }

    public AssetGroup updateAssetsOnAssetGroup(
            @NotNull final AssetGroup assetGroup,
            @NotNull final List<String> assetIds) {
        Iterable<Asset> assets = this.assetService.assetFromIds(assetIds);
        assetGroup.setAssets(fromIterable(assets));
        assetGroup.setUpdatedAt(now());
        AssetGroup assetGroupUpdated = this.assetGroupRepository.save(assetGroup);
        return computeDynamicAssets(assetGroupUpdated);
    }

    public void deleteAssetGroup(@NotBlank final String assetGroupId) {
        this.assetGroupRepository.deleteById(assetGroupId);
    }

    // -- ASSET --

    @Transactional(readOnly = true)
    public List<Asset> assetsFromAssetGroup(@NotBlank final String assetGroupId) {
        AssetGroup assetGroup = this.assetGroup(assetGroupId);
        return Stream.concat(
                        assetGroup.getAssets().stream(),
                        assetGroup.getDynamicAssets().stream()
                )
                .distinct()
                .collect(Collectors.toList());
    }

    private List<AssetGroup> computeDynamicAssets(@NotNull final List<AssetGroup> assetGroups) {
        if (assetGroups.stream().noneMatch(assetGroup -> isEmptyFilterGroup(assetGroup.getDynamicFilter()))) {
            return assetGroups;
        }

        List<Asset> assets = this.assetService.assets();
        assetGroups.forEach(assetGroup -> {
            if (!isEmptyFilterGroup(assetGroup.getDynamicFilter())) {
                Predicate<Object> filters = computeFilterGroupRuntime(assetGroup.getDynamicFilter());

                List<Asset> filteredAssets = assets.stream()
                    .filter(asset -> "Endpoint".equals(asset.getType())) // Filters for dynamic assets are applicable only to endpoints
                    .filter(filters)
                    .toList();

                assetGroup.setDynamicAssets(filteredAssets);
            }
        });
        return assetGroups;
    }

    public AssetGroup computeDynamicAssets(@NotNull final AssetGroup assetGroup) {
        if (isEmptyFilterGroup(assetGroup.getDynamicFilter())) {
            return assetGroup;
        }
        Specification<Endpoint> specification = computeFilterGroupJpa(assetGroup.getDynamicFilter());
        List<Asset> assets = this.endpointService.endpoints(specification)
                .stream()
                .map(endpoint -> (Asset) endpoint)
                .filter(asset -> asset.getParent() == null && asset.getInject() == null)
                .distinct()
                .toList();
        assetGroup.setDynamicAssets(assets);
        return assetGroup;
    }

    public Map<String, List<RawAsset>> computeRawDynamicAsset(@NotNull List<RawAssetGroup> assetGroups) {
        if (assetGroups.isEmpty() || isEmptyFilterGroup(assetGroups.get(0).getAsset_group_dynamic_filter())) {
            return Map.of();
        }

        Specification<Endpoint> specification = computeFilterGroupJpa(assetGroups.get(0).getAsset_group_dynamic_filter());
        List<RawAsset> dynamicAssets = emptyList();

        return dynamicAssets.stream()
            .collect(Collectors.groupingBy(RawAsset::getAsset_id));
    }

}
