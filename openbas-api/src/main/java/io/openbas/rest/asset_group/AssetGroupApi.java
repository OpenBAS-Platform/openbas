package io.openbas.rest.asset_group;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.AssetGroupSpecification.fromIds;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;

import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Endpoint;
import io.openbas.database.repository.AssetGroupRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.asset.endpoint.form.EndpointOutput;
import io.openbas.rest.asset_group.form.AssetGroupInput;
import io.openbas.rest.asset_group.form.AssetGroupOutput;
import io.openbas.rest.asset_group.form.UpdateAssetsOnAssetGroupInput;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.AssetGroupService;
import io.openbas.service.EndpointService;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.mapper.EndpointMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Secured(ROLE_USER)
public class AssetGroupApi extends RestBehavior {

  public static final String ASSET_GROUP_URI = "/api/asset_groups";
  private final EndpointService endpointService;
  private final EndpointMapper endpointMapper;

  private final AssetGroupService assetGroupService;
  private final AssetGroupCriteriaBuilderService assetGroupCriteriaBuilderService;
  private final TagRepository tagRepository;
  private final AssetGroupRepository assetGroupRepository;

  @PostMapping(ASSET_GROUP_URI)
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public AssetGroup createAssetGroup(@Valid @RequestBody final AssetGroupInput input) {
    AssetGroup assetGroup = new AssetGroup();
    assetGroup.setUpdateAttributes(input);
    assetGroup.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
    return this.assetGroupService.createAssetGroup(assetGroup);
  }

  @GetMapping(ASSET_GROUP_URI)
  @PreAuthorize("isObserver()")
  public List<AssetGroup> assetGroups() {
    return this.assetGroupService.assetGroups();
  }

  @LogExecutionTime
  @PostMapping(ASSET_GROUP_URI + "/search")
  @PreAuthorize("isObserver()")
  public Page<AssetGroupOutput> assetGroups(
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return this.assetGroupCriteriaBuilderService.assetGroupPagination(searchPaginationInput);
  }

  @PostMapping(ASSET_GROUP_URI + "/{assetGroupId}/assets/search")
  public Page<EndpointOutput> endpointsFromAssetGroup(
      @RequestBody @Valid SearchPaginationInput searchPaginationInput,
      @PathVariable @NotBlank final String assetGroupId) {

    Page<Endpoint> endpointPage =
        endpointService.searchManagedEndpoints(assetGroupId, searchPaginationInput);
    // Convert the Page of Endpoint to a Page of EndpointOutput
    List<EndpointOutput> endpointOutputs =
        endpointPage.getContent().stream()
            .map(
                endpoint -> {
                  Boolean isPresent =
                      endpoint.getAssetGroups().stream()
                          .map(AssetGroup::getId)
                          .anyMatch(id -> Objects.equals(id, assetGroupId));
                  EndpointOutput endpointOutput = endpointMapper.toEndpointOutput(endpoint);
                  endpointOutput.setIsStatic(isPresent);
                  return endpointOutput;
                })
            .toList();
    return new PageImpl<>(
        endpointOutputs, endpointPage.getPageable(), endpointPage.getTotalElements());
  }

  @PostMapping(ASSET_GROUP_URI + "/find")
  @PreAuthorize("isObserver()")
  @Transactional(readOnly = true)
  public List<AssetGroupOutput> findAssetGroups(
      @RequestBody @Valid @NotNull final List<String> assetGroupIds) {
    return this.assetGroupCriteriaBuilderService.find(fromIds(assetGroupIds));
  }

  @GetMapping(ASSET_GROUP_URI + "/{assetGroupId}")
  @PreAuthorize("isObserver()")
  public AssetGroup assetGroup(@PathVariable @NotBlank final String assetGroupId) {
    return this.assetGroupService.assetGroup(assetGroupId);
  }

  @PutMapping(ASSET_GROUP_URI + "/{assetGroupId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public AssetGroup updateAssetGroup(
      @PathVariable @NotBlank final String assetGroupId,
      @Valid @RequestBody final AssetGroupInput input) {
    AssetGroup assetGroup = this.assetGroupService.assetGroup(assetGroupId);
    assetGroup.setUpdateAttributes(input);
    assetGroup.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
    return this.assetGroupService.updateAssetGroup(assetGroup);
  }

  @PutMapping(ASSET_GROUP_URI + "/{assetGroupId}/assets")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public AssetGroup updateAssetsOnAssetGroup(
      @PathVariable @NotBlank final String assetGroupId,
      @Valid @RequestBody final UpdateAssetsOnAssetGroupInput input) {
    AssetGroup assetGroup = this.assetGroupService.assetGroup(assetGroupId);
    return this.assetGroupService.updateAssetsOnAssetGroup(assetGroup, input.getAssetIds());
  }

  @DeleteMapping(ASSET_GROUP_URI + "/{assetGroupId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public void deleteAssetGroup(@PathVariable @NotBlank final String assetGroupId) {
    try {
      assetGroupService.assetGroup(assetGroupId);
    } catch (IllegalArgumentException ex) {
      throw new ElementNotFoundException(ex.getMessage());
    }
    this.assetGroupService.deleteAssetGroup(assetGroupId);
  }

  // -- OPTION --

  @GetMapping(ASSET_GROUP_URI + "/options")
  public List<FilterUtilsJpa.Option> optionsByName(
      @RequestParam(required = false) final String searchText,
      @RequestParam(required = false) final String simulationOrScenarioId) {
    return assetGroupRepository
        .findAllBySimulationOrScenarioIdAndName(
            StringUtils.trimToNull(simulationOrScenarioId), StringUtils.trimToNull(searchText))
        .stream()
        .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
        .toList();
  }

  @LogExecutionTime
  @GetMapping(ASSET_GROUP_URI + "/findings/options")
  public List<FilterUtilsJpa.Option> optionsByNameLinkedToFindings(
      @RequestParam(required = false) final String searchText,
      @RequestParam(required = false) final String sourceId) {
    return assetGroupService.getOptionsByNameLinkedToFindings(
        searchText, sourceId, PageRequest.of(0, 50));
  }

  @LogExecutionTime
  @PostMapping(ASSET_GROUP_URI + "/options")
  public List<FilterUtilsJpa.Option> optionsById(@RequestBody final List<String> ids) {
    return fromIterable(this.assetGroupRepository.findAllById(ids)).stream()
        .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
        .toList();
  }
}
