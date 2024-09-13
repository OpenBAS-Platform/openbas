package io.openbas.rest.tag;

import io.openbas.database.model.Tag;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.tag.form.TagCreateInput;
import io.openbas.rest.tag.form.TagUpdateInput;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.specification.TagSpecification.byName;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RestController
public class TagApi extends RestBehavior {

    public static final String TAG_URI = "/api/tags";

    private TagRepository tagRepository;

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @GetMapping("/api/tags")
    public Iterable<Tag> tags() {
        return tagRepository.findAll();
    }

    @PostMapping("/api/tags/search")
    public Page<Tag> tags(@RequestBody @Valid SearchPaginationInput searchPaginationInput) {
        return buildPaginationJPA(
                (Specification<Tag> specification, Pageable pageable) -> this.tagRepository.findAll(
                        specification, pageable),
                searchPaginationInput,
                Tag.class
        );
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/tags/{tagId}")
    @Transactional(rollbackOn = Exception.class)
    public Tag updateTag(@PathVariable String tagId,
                         @Valid @RequestBody TagUpdateInput input) {
        Tag tag = tagRepository.findById(tagId).orElseThrow(ElementNotFoundException::new);
        tag.setUpdateAttributes(input);
        return tagRepository.save(tag);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/tags")
    @Transactional(rollbackOn = Exception.class)
    public Tag createTag(@Valid @RequestBody TagCreateInput input) {
        Tag tag = new Tag();
        tag.setUpdateAttributes(input);
        return tagRepository.save(tag);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/tags/upsert")
    @Transactional(rollbackOn = Exception.class)
    public Tag upsertTag(@Valid @RequestBody TagCreateInput input) {
        Optional<Tag> tag = tagRepository.findByName(input.getName());
        if( tag.isPresent() ) {
            return tag.get();
        } else {
            Tag newTag = new Tag();
            newTag.setUpdateAttributes(input);
            return tagRepository.save(newTag);
        }
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/tags/{tagId}")
    public void deleteTag(@PathVariable String tagId) {
        tagRepository.deleteById(tagId);
    }

    // -- OPTION --

    @GetMapping(TAG_URI + "/options")
    public List<FilterUtilsJpa.Option> optionsByName(@RequestParam(required = false) final String searchText) {
        return fromIterable(this.tagRepository.findAll(byName(searchText), Sort.by(Sort.Direction.ASC, "name")))
            .stream()
            .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
            .toList();
    }

    @PostMapping(TAG_URI + "/options")
    public List<FilterUtilsJpa.Option> optionsById(@RequestBody final List<String> ids) {
        return fromIterable(this.tagRepository.findAllById(ids))
            .stream()
            .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
            .toList();
    }
}
