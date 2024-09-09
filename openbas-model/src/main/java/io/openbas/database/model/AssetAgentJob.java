package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import org.hibernate.annotations.UuidGenerator;

import java.util.Objects;

@Data
@Entity
@Table(name = "asset_agent_jobs")
@EntityListeners(ModelBaseListener.class)
public class AssetAgentJob implements Base {

    @Id
    @Column(name = "asset_agent_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("asset_agent_id")
    @NotBlank
    private String id;

    @Getter
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_agent_inject")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("asset_agent_inject")
    private Inject inject;

    @Getter
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_agent_asset")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("asset_agent_asset")
    private Asset asset;

    @Getter
    @Column(name = "asset_agent_command")
    @JsonProperty("asset_agent_command")
    @NotBlank
    private String command;

    @Getter
    @Column(name = "asset_agent_elevation_required")
    @JsonProperty("asset_agent_elevation_required")
    private boolean elevationRequired;

    @Override
    public String toString() {
        return this.id;
    }

    @Override
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (null == o || !Base.class.isAssignableFrom(o.getClass())) return false;
        final Base base = (Base) o;
        return this.id.equals(base.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    @Override
    public String getId() {
        return this.id;
    }
}
