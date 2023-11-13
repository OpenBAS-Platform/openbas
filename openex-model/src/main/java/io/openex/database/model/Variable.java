package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoIdDeserializer;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.time.Instant;

import static java.time.Instant.now;

@Data
@Entity
@EntityListeners(ModelBaseListener.class)
@Table(name = "variables")
public class Variable implements Base {

  public enum VariableType {
    @JsonProperty("String")
    String,

    @JsonProperty("Object")
    Object,
  }

  @Id
  @Column(name = "variable_id")
  @GeneratedValue(generator = "UUID")
  @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
  @JsonProperty("variable_id")
  @NotBlank
  private String id;

  @Column(name = "variable_key")
  @JsonProperty("variable_key")
  @NotBlank
  @Pattern(regexp="^[a-z_]+$")
  private String key;

  @Column(name = "variable_value")
  @JsonProperty("variable_value")
  private String value;

  @Column(name = "variable_description")
  @JsonProperty("variable_description")
  private String description;

  @Column(name = "variable_type")
  @JsonProperty("variable_type")
  @NotNull
  private VariableType type = VariableType.String;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "variable_exercise")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("variable_exercise")
  private Exercise exercise;

  // -- AUDIT --

  @Column(name = "variable_created_at")
  @JsonProperty("variable_created_at")
  private Instant createdAt = now();

  @Column(name = "variable_updated_at")
  @JsonProperty("variable_updated_at")
  private Instant updatedAt = now();

}
