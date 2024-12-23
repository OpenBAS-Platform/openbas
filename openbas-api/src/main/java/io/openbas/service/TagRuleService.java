package io.openbas.service;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import com.cronutils.utils.VisibleForTesting;
import io.openbas.database.model.Asset;
import io.openbas.database.model.Tag;
import io.openbas.database.model.TagRule;
import io.openbas.database.repository.AssetRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.database.repository.TagRuleRepository;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class TagRuleService {
  private TagRuleRepository tagRuleRepository;
  private TagRepository tagRepository;
  private AssetRepository assetRepository;

  /**
   * Find the TagRule by id
   *
   * @param id
   * @return
   */
  public Optional<TagRule> findById(String id) {
    return tagRuleRepository.findById(id);
  }

  /**
   * Finn all the TagRules
   *
   * @return
   */
  public List<TagRule> findAll() {
    return StreamSupport.stream(tagRuleRepository.findAll().spliterator(), false)
        .collect(Collectors.toList());
  }

  /**
   * Create a TagRule
   *
   * @param tagName if the tag doesn't exist it will be created
   * @param assetIds list of existing assets id
   * @return
   */
  public TagRule createTagRule(@NotBlank final String tagName, final List<String> assetIds) {
    // if the tag doesn't exist we create it
    // if one of the asset doesn't exist throw a ResourceNotFoundException
    TagRule tagRule = new TagRule();
    tagRule.setTag(getOrCreateTag(tagName));
    tagRule.setAssets(getAssets(assetIds));
    return tagRuleRepository.save(tagRule);
  }

  /**
   * Update tagRule
   *
   * @param tagName
   * @param assetIds
   * @return
   */
  public TagRule updateTagRule(
      @NotBlank final String tagRuleId, final String tagName, final List<String> assetIds) {

    // verify that the tag rule exists
    TagRule tagRule =
        tagRuleRepository
            .findById(tagRuleId)
            .orElseThrow(
                () -> new EntityNotFoundException("TagRule not found with id: " + tagRuleId));

    // if the tag doesn't exist we create it
    tagRule.setTag(getOrCreateTag(tagName));

    // if one of the asset doesn't exist throw a ResourceNotFoundException
    tagRule.setAssets(getAssets(assetIds));

    return tagRuleRepository.save(tagRule);
  }

  /**
   * Search TagRule
   *
   * @param searchPaginationInput
   * @return
   */
  public Page<TagRule> searchTagRule(SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        (Specification<TagRule> specification, Pageable pageable) ->
            this.tagRuleRepository.findAll(specification, pageable),
        searchPaginationInput,
        TagRule.class);
  }

  /**
   * Delete a TagRule
   *
   * @param tagRuleId
   */
  public void deleteTagRule(@NotBlank final String tagRuleId) {
    this.tagRuleRepository.deleteById(tagRuleId);
  }

  @VisibleForTesting
  protected Tag createtag(final String tagName) {
    Tag tag = new Tag();
    tag.setName(tagName);
    tag.setColor("");
    return tag;
  }

  /**
   * Check if the tag exists, if no it creates it
   *
   * @param tagName
   * @return
   */
  @VisibleForTesting
  protected Tag getOrCreateTag(final String tagName) {
    return tagRepository.findByName(tagName).orElse(tagRepository.save(createtag(tagName)));
  }

  /**
   * Get the assets from the DB, and throwns an exception if an asset doesn't exist
   *
   * @param assetIds
   * @return
   */
  @VisibleForTesting
  protected List<Asset> getAssets(final List<String> assetIds) {
    return assetIds.stream()
        .map(
            id ->
                assetRepository
                    .findById(id)
                    .orElseThrow(
                        () -> new EntityNotFoundException("Asset not found with id: " + id)))
        .toList();
  }

  @Autowired
  public void setTagRuleRepository(TagRuleRepository tagRuleRepository) {
    this.tagRuleRepository = tagRuleRepository;
  }

  @Autowired
  public void setTagRepository(TagRepository tagRepository) {
    this.tagRepository = tagRepository;
  }

  @Autowired
  public void setAssetRepository(AssetRepository assetRepository) {
    this.assetRepository = assetRepository;
  }
}
