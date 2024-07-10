package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "inject_importers")
@EntityListeners(ModelBaseListener.class)
public class InjectImporter implements Base {

    @Id
    @Column(name = "importer_id")
    @JsonProperty("inject_importer_id")
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "importer_name")
    @JsonProperty("inject_importer_name")
    private String name;

    @Column(name = "importer_import_type_value")
    @JsonProperty("inject_importer_type_value")
    private String importTypeValue;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "importer_injector_contract_id")
    @JsonProperty("inject_importer_injector_contract")
    @JsonSerialize(using = MonoIdDeserializer.class)
    private InjectorContract injectorContract;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "attribute_inject_importer_id", nullable = false)
    @JsonProperty("rule_attributes")
    private List<RuleAttribute> ruleAttributes = new ArrayList<>();

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

    @Override
    public String getId() {
        return this.id != null ? this.id.toString(): "";
    }

    @Override
    public void setId(String id) {
        this.id = UUID.fromString(id);
    }
}
