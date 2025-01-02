package io.openbas.service;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import com.cronutils.utils.VisibleForTesting;
import io.openbas.database.model.Asset;
import io.openbas.database.model.Tag;
import io.openbas.database.model.TagRule;
import io.openbas.database.repository.AssetRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.database.repository.TagRuleRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TagRuleService {
  private final TagRuleRepository tagRuleRepository;
  private final TagRepository tagRepository;
  private final AssetRepository assetRepository;

  public Optional<TagRule> findById(String id) {
    return tagRuleRepository.findById(id);
  }

  public List<TagRule> findAll() {
    return StreamSupport.stream(tagRuleRepository.findAll().spliterator(), false)
        .collect(Collectors.toList());
  }

  public TagRule createTagRule(@NotBlank final String tagName, final List<String> assetIds) {
    // if the tag  or one of the asset doesn't exist we exist throw a ElementNotFoundException
    TagRule tagRule = new TagRule();
    tagRule.setTag(getTag(tagName));
    tagRule.setAssets(getAssets(assetIds));
    return tagRuleRepository.save(tagRule);
  }

  public TagRule updateTagRule(
      @NotBlank final String tagRuleId, final String tagName, final List<String> assetIds) {

    // verify that the tag rule exists
    TagRule tagRule =
        tagRuleRepository
            .findById(tagRuleId)
            .orElseThrow(
                () -> new ElementNotFoundException("TagRule not found with id: " + tagRuleId));

    tagRule.setTag(getTag(tagName));

    // if one of the asset doesn't exist throw a ResourceNotFoundException
    tagRule.setAssets(getAssets(assetIds));

    return tagRuleRepository.save(tagRule);
  }

  public Page<TagRule> searchTagRule(SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            tagRuleRepository::findAll,
        searchPaginationInput,
        TagRule.class);
  }

  public void deleteTagRule(@NotBlank final String tagRuleId) {
    //verify that the TagRule exists
    tagRuleRepository
            .findById(tagRuleId)
            .orElseThrow(
                    () -> new ElementNotFoundException("TagRule not found with id: " + tagRuleId));
    tagRuleRepository.deleteById(tagRuleId);
  }

  @VisibleForTesting
  protected Tag getTag(@NotBlank final String tagName) {
    // TODO: tag name normalization needs to be implemented in a reusable method
    return tagRepository
            .findByName(tagName.toLowerCase())
            .orElseThrow(
                    () -> new ElementNotFoundException("Tag not found with name: " + tagName));
  }

  @VisibleForTesting
  protected List<Asset> getAssets(final List<String> assetIds) {
    return assetIds == null
        ? new ArrayList<>()
        : assetIds.stream()
            .map(
                id ->
                    assetRepository
                        .findById(id)
                        .orElseThrow(
                            () -> new ElementNotFoundException("Asset not found with id: " + id)))
            .collect(Collectors.toList());
  }
}
