package io.openbas.service;


import io.openbas.database.model.TagRule;
import io.openbas.database.repository.TagRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
@RequiredArgsConstructor
@Service
public class TagRuleService {
    private final TagRuleRepository tagRuleRepository;


    public TagRule findById(String id) {
        return tagRuleRepository.findById(id).get();
    }
}
