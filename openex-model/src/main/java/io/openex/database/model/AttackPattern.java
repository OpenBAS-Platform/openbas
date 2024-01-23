package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoIdDeserializer;
import io.openex.helper.MultiIdDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;

@Getter
@Entity
@Table(name = "attack_patterns")
@EntityListeners(ModelBaseListener.class)
public class AttackPattern implements Base {

    @Getter
    @Setter
    @Id
    @Column(name = "attack_pattern_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("attack_pattern_id")
    @NotBlank
    private String id;

    @Getter
    @Setter
    @Column(name = "attack_pattern_stix_id")
    @JsonProperty("attack_pattern_stix_id")
    @NotBlank
    private String stixId;

    @Getter
    @Setter
    @Column(name = "attack_pattern_name")
    @JsonProperty("attack_pattern_name")
    @NotBlank
    private String name;

    @Getter
    @Setter
    @Column(name = "attack_pattern_description")
    @JsonProperty("attack_pattern_description")
    private String description;

    @Getter
    @Setter
    @Column(name = "attack_pattern_external_id")
    @JsonProperty("attack_pattern_external_id")
    @NotBlank
    private String externalId;

    @Getter
    @Setter
    @Type(value = io.openex.database.converter.PostgreSqlStringArrayType.class)
    @Column(name = "attack_pattern_platforms", columnDefinition = "text[]")
    @JsonProperty("attack_pattern_platforms")
    private String[] platforms = new String[0];

    @Getter
    @Setter
    @Type(value = io.openex.database.converter.PostgreSqlStringArrayType.class)
    @Column(name = "attack_pattern_permissions_required", columnDefinition = "text[]")
    @JsonProperty("attack_pattern_permissions_required")
    private String[] permissionsRequired = new String[0];

    @Getter
    @Setter
    @Column(name = "attack_pattern_created_at")
    @JsonProperty("attack_pattern_created_at")
    private Instant createdAt = now();

    @Getter
    @Setter
    @Column(name = "attack_pattern_updated_at")
    @JsonProperty("attack_pattern_updated_at")
    private Instant updatedAt = now();

    @Getter
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attack_pattern_parent")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("attack_pattern_parent")
    private AttackPattern parent;

    @Getter
    @Setter
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "attack_patterns_kill_chain_phases",
            joinColumns = @JoinColumn(name = "attack_pattern_id"),
            inverseJoinColumns = @JoinColumn(name = "phase_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("attack_pattern_kill_chain_phases")
    private List<KillChainPhase> killChainPhases = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStixId() {
        return stixId;
    }

    public void setStixId(String stixId) {
        this.stixId = stixId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String[] getPlatforms() {
        return platforms;
    }

    public void setPlatforms(String[] platforms) {
        this.platforms = platforms;
    }

    public String[] getPermissionsRequired() {
        return permissionsRequired;
    }

    public void setPermissionsRequired(String[] permissionsRequired) {
        this.permissionsRequired = permissionsRequired;
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

    public AttackPattern getParent() {
        return parent;
    }

    public void setParent(AttackPattern parent) {
        this.parent = parent;
    }

    public List<KillChainPhase> getKillChainPhases() {
        return killChainPhases;
    }

    public void setKillChainPhases(List<KillChainPhase> killChainPhases) {
        this.killChainPhases = killChainPhases;
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
