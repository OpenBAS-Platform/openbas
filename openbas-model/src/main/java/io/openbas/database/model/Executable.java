package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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

  @Queryable(filterable = true, searchable = true)
  @Column(name = "executable_arch")
  @JsonProperty("executable_arch")
  @Enumerated(EnumType.STRING)
  @NotNull
  private Endpoint.PLATFORM_ARCH executableArch;

  public Executable() {}

  public Executable(String id, String type, String name) {
    super(id, type, name);
  }

  /*
   * return the number of actions a given payload is expected to achieve
   * by default this is 2 here, one file drop and one execution
   */
  public int getNumberOfActions() {
    return 2;
  }
}
