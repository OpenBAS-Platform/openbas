package io.openex.rest.tag;

import io.openex.database.model.Tag;
import io.openex.database.repository.TagRepository;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.tag.form.TagCreateInput;
import io.openex.rest.tag.form.TagUpdateInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;

import static io.openex.database.model.User.ROLE_ADMIN;

@RestController
public class TagApi extends RestBehavior {

    private TagRepository tagRepository;

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @GetMapping("/api/tag")
    public Iterable<Tag> tags() {
        return tagRepository.findAll();
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/tag/{tagId}")
    public Tag updateTag(@PathVariable String tagId,
                         @Valid @RequestBody TagUpdateInput input) {
        Tag tag = tagRepository.findById(tagId).orElseThrow();
        tag.setUpdateAttributes(input);
        return tagRepository.save(tag);
    }

    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/tag")
    public Tag createTag(@Valid @RequestBody TagCreateInput input) {
        Tag tag = new Tag();
        tag.setUpdateAttributes(input);
        return tagRepository.save(tag);
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/tag/{tagId}")
    public void deleteTag(@PathVariable String tagId) {
        tagRepository.deleteById(tagId);
    }
}
