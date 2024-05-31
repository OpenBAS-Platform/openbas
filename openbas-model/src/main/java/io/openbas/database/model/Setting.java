package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.database.model.SettingKeys.Module;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.*;
import java.util.Objects;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "parameters")
@EntityListeners(ModelBaseListener.class)
public class Setting implements Base {

    public Setting(String key, Module type, String value) {
        this.key = key;
        this.type = type;
        this.value = value;
    }

    @Id
    @Column(name = "parameter_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("setting_id")
    private String id;

    @Column(name = "parameter_key")
    @JsonProperty("setting_key")
    private String key;

    @Column(name = "parameter_type")
    @JsonProperty("setting_type")
    @Enumerated(EnumType.STRING)
    private Module type;

    @Column(name = "parameter_value")
    @JsonProperty("setting_value")
    private String value;

    @Override
    public boolean isUserHasAccess(User user) {
        return user.isAdmin();
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
