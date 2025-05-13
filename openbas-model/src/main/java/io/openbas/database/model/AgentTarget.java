package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Queryable;
import lombok.Setter;
import org.apache.commons.lang3.NotImplementedException;

import java.util.Optional;
import java.util.Set;

public class AgentTarget extends InjectTarget {

    public AgentTarget(String id, String name, Set<String> tags, String endpoint, String subType) {
        this.setId(id);
        this.setName(name);
        this.setTags(tags);
        this.setEndpoint(endpoint);
        this.setTargetType("ASSETS");
        this.subType = subType;
    }

    @JsonIgnore private final String subType;

    @JsonIgnore
    @JsonProperty("target_asset_groups")
    @Queryable(searchable = true, filterable = true, dynamicValues = true)
    public Set<String> getAssetGroups() {
        // note that it's not possible at the entity level to fetch a complete set of
        // containing asset groups since dynamic filters do not implement a relationship
        // between the Asset and AssetGroup entities.
        // This is currently only dealt with at the API Service level.
        throw new NotImplementedException(
                "NOT AVAILABLE; this property exists for exposing a filter only.");
    }

    @JsonIgnore
    @Setter
    @JsonProperty("target_endpoint")
    @Queryable(searchable = true, filterable = true, dynamicValues = true)
    private String endpoint;

    @Override
    protected String getTargetSubtype() {
        return Optional.ofNullable(this.subType).orElse("N/A");
    }
}
