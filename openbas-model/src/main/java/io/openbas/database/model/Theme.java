package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.Objects;


@Getter
@Setter
public class Theme implements Base {

  public enum THEME_KEYS {
    BACKGROUND_COLOR("background_color", ""),
    PAPER_COLOR("paper_color", ""),
    NAVIGATION_COLOR("navigation_color", ""),
    PRIMARY_COLOR("primary_color", ""),
    SECONDARY_COLOR("secondary_color", ""),
    ACCENT_COLOR("accent_color", ""),
    LOGO_URL("logo_url", ""),
    LOGO_URL_COLLAPSED("logo_url_collapsed", ""),
    LOGO_LOGIN_URL("logo_login_url", "");

    private final String key;
    private final String defaultValue;

    THEME_KEYS(String key, String defaultValue) {
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

  public Theme() {
    // Default constructor
  }

  public Theme(String key, String value) {
    this.key = key;
    this.value = value;
  }

  @Id
  @Column(name = "personalized_theme_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("theme_id")
  private String id;

  @Getter
  @Column(name = "personalized_theme_key")
  @JsonProperty("theme_key")
  private String key;

  @Getter
  @Column(name = "personalized_theme_value")
  @JsonProperty("theme_value")
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

  public void setKey(String key) {
    this.key = key;
  }

  public void setValue(String value) {
    this.value = value;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || !Base.class.isAssignableFrom(o.getClass())) {
      return false;
    }
    Base base = (Base) o;
    return id.equals(base.getId());
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }


}
