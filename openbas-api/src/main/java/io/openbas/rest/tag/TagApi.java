package io.openbas.rest.tag;

import io.openbas.database.model.Tag;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.tag.form.TagCreateInput;
import io.openbas.rest.tag.form.TagUpdateInput;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import static io.openbas.database.model.User.ROLE_ADMIN;

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
    @DeleteMapping("/api/tags/{tagId}")
    public void deleteTag(@PathVariable String tagId) {
        tagRepository.deleteById(tagId);
    }
}
