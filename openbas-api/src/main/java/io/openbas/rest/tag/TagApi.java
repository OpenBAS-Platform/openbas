package io.openbas.rest.tag;

import io.openbas.database.model.KillChainPhase;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.tag.form.TagCreateInput;
import io.openbas.rest.tag.form.TagUpdateInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RestController
public class TagApi extends RestBehavior {

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
    public Tag updateTag(@PathVariable String tagId,
                         @Valid @RequestBody TagUpdateInput input) {
        Tag tag = tagRepository.findById(tagId).orElseThrow();
        tag.setUpdateAttributes(input);
        return tagRepository.save(tag);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/tags")
    public Tag createTag(@Valid @RequestBody TagCreateInput input) {
        Tag tag = new Tag();
        tag.setUpdateAttributes(input);
        return tagRepository.save(tag);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/tags/upsert")
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
}
