package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "rule_attributes")
@EntityListeners(ModelBaseListener.class)
public class RuleAttribute implements Base {

    @Id
    @Column(name = "attribute_id")
    @JsonProperty("rule_attribute_id")
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "attribute_name")
    @JsonProperty("rule_attribute_name")
    @NotBlank
    private String name;

    @Column(name = "attribute_columns")
    @JsonProperty("rule_attribute_columns")
    private String columns;

    @Column(name = "attribute_default_value")
    @JsonProperty("rule_attribute_default_value")
    @NotBlank
    @NotNull
    private String defaultValue;

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
        return this.id.toString();
    }

    @Override
    public void setId(String id) {
        this.id = UUID.fromString(id);
    }
}
