package io.openbas.rest.tag_rule;

import io.openbas.aop.LogExecutionTime;
import io.openbas.rest.tag_rule.form.TagRuleInput;
import io.openbas.rest.tag_rule.form.TagRuleOutput;
import io.openbas.telemetry.Tracing;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping(TagRuleApi.TAG_RULE_URI)
public class TagRuleApi {


    //TODO define permission

    public static final String TAG_RULE_URI = "/api/tag-rule";

    @LogExecutionTime
    @GetMapping("/{tagRuleId}")
    @Tracing(name = "Get a tag rule", layer = "api", operation = "GET")
    public TagRuleOutput findTagRule(@PathVariable @NotBlank final String tagRuleId) {
        return new TagRuleOutput();
    }

    @LogExecutionTime
    @DeleteMapping("/{tagRuleId}")
    @Tracing(name = "Delete a tag rule", layer = "api", operation = "DELETE")
    public void deleteTagRule(@PathVariable @NotBlank final String tagRuleId) {
    }

    @LogExecutionTime
    @PutMapping("/{tagRuleId}")
    @Transactional(rollbackFor = Exception.class)
    @Tracing(name = "Update a tag rule", layer = "api", operation = "PUT")
    public TagRuleOutput updateTagRule(
            @PathVariable @NotBlank final String tagRuleId,
            @Valid @RequestBody final TagRuleInput input) {
        return new TagRuleOutput();
    }

    @LogExecutionTime
    @PostMapping("/search")
    @Tracing(name = "Get a page of tag rule", layer = "api", operation = "POST")
    public Page<TagRuleOutput> findAllTagRules(
            @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
        return Page.empty();
    }





}
