package io.openbas.rest.settings.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ThemeInput {

  @JsonProperty("background_color")
  private String backgroundColor;

  @JsonProperty("paper_color")
  private String paperColor;

  @JsonProperty("navigation_color")
  private String NavigationColor;

  @JsonProperty("primary_color")
  private String primaryColor;

  @JsonProperty("secondary_color")
  private String secondaryColor;

  @JsonProperty("accent_color")
  private String accentColor;

  @JsonProperty("logo_url")
  private String logoUrl;

  @JsonProperty("logo_url_collapsed")
  private String logoUrlCollapsed;

  @JsonProperty("logo_login_url")
  private String logoLoginUrl;
}
