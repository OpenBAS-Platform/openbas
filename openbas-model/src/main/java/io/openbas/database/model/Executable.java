package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@DiscriminatorValue(Executable.EXECUTABLE_TYPE)
@EntityListeners(ModelBaseListener.class)
public class Executable extends Payload {

  public static final String EXECUTABLE_TYPE = "Executable";

  @JsonProperty("payload_type")
  private String type = EXECUTABLE_TYPE;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "executable_file")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("executable_file")
  private Document executableFile;

  public Executable() {

  }

  public Executable(String id, String type, String name) {
    super(id, type, name);
  }
}
