package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "kill_chain_phases")
@EntityListeners(ModelBaseListener.class)
public class KillChainPhase implements Base {
    @Getter
    @Setter
    @Id
    @Column(name = "phase_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("phase_id")
    private String id;

    @Getter
    @Setter
    @Column(name = "phase_external_id")
    @JsonProperty("phase_external_id")
    private String externalId;

    @Getter
    @Setter
    @Column(name = "phase_stix_id")
    @JsonProperty("phase_stix_id")
    private String stixId;

    @Getter
    @Setter
    @Column(name = "phase_name")
    @JsonProperty("phase_name")
    private String name;

    @Getter
    @Setter
    @Column(name = "phase_shortname")
    @JsonProperty("phase_shortname")
    private String shortName;

    @Getter
    @Setter
    @Column(name = "phase_kill_chain_name")
    @JsonProperty("phase_kill_chain_name")
    private String killChainName;

    @Getter
    @Setter
    @Column(name = "phase_description")
    @JsonProperty("phase_description")
    private String description;

    @Getter
    @Setter
    @Column(name = "phase_order")
    @JsonProperty("phase_order")
    private Long order = 0L;

    @Getter
    @Setter
    @Column(name = "phase_created_at")
    @JsonProperty("phase_created_at")
    private Instant createdAt = now();

    @Getter
    @Setter
    @Column(name = "phase_updated_at")
    @JsonProperty("phase_updated_at")
    private Instant updatedAt = now();
    // endregion


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getStixId() {
        return stixId;
    }

    public void setStixId(String stixId) {
        this.stixId = stixId;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getKillChainName() {
        return killChainName;
    }

    public void setKillChainName(String killChainName) {
        this.killChainName = killChainName;
    }

    public Long getOrder() {
        return order;
    }

    public void setOrder(Long order) {
        this.order = order;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || !Base.class.isAssignableFrom(o.getClass())) return false;
        Base base = (Base) o;
        return id.equals(base.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
