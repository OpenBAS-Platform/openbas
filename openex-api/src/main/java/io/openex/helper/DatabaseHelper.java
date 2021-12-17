package io.openex.helper;

import io.openex.database.model.Base;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

import static java.util.Optional.ofNullable;
import static org.springframework.util.StringUtils.hasLength;

public class DatabaseHelper {

    public static <T> T updateRelationResolver(String inputRelationId, Base current, CrudRepository<T, String> repository) {
        if (hasLength(inputRelationId)) {
            String currentGroupId = ofNullable(current).map(Base::getId).orElse(null);
            if (!inputRelationId.equals(currentGroupId)) {
                Optional<T> existingEntity = repository.findById(inputRelationId);
                return existingEntity.orElse(null);
            }
        }
        return null;
    }
}
