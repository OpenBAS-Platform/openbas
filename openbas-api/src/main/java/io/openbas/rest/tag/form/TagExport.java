package io.openbas.rest.tag.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class TagExport {

  public TagExport(String name, String color) {
    this.name = name;
    this.color = color;
  }

  @JsonProperty("tag_name")
  private String name;

  @JsonProperty("tag_color")
  private String color;
}
