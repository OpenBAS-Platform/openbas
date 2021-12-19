package io.openex.rest.tag;

import io.openex.database.model.Tag;
import io.openex.database.repository.TagRepository;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
