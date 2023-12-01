package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.audit.ModelBaseListener;
import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "parameters")
@EntityListeners(ModelBaseListener.class)
public class Setting implements Base {

    public enum SETTING_KEYS {
        PLATFORM_NAME("platform_name", "OpenEx - Exercises planning platform"),
        DEFAULT_THEME("platform_theme", "dark"),
        DEFAULT_LANG("platform_lang", "auto");

        private final String key;
        private final String defaultValue;

        SETTING_KEYS(String key, String defaultValue) {
            this.key = key;
            this.defaultValue = defaultValue;
        }

        public String key() {
            return key;
        }

        public String defaultValue() {
            return defaultValue;
        }
    }

    public Setting() {
        // Default constructor
    }

    public Setting(String key, String value) {
        this.key = key;
        this.value = value;
    }

    @Id
    @Column(name = "parameter_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("setting_id")
    private String id;

    @Column(name = "parameter_key")
    @JsonProperty("setting_key")
    private String key;

    @Column(name = "parameter_value")
    @JsonProperty("setting_value")
    private String value;

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return user.isAdmin();
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
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
