package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;
import lombok.*;

@Entity
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cwes")
@EntityListeners(ModelBaseListener.class)
public class Cwe implements Base {

  @Id
  @Column(name = "cwe_id")
  @JsonProperty("cwe_id")
  @EqualsAndHashCode.Include
  @NotBlank
  private String id;

  @Column(name = "cwe_source")
  @JsonProperty("cwe_source")
  private String source;

  @ManyToMany(mappedBy = "cwes")
  private Set<Cve> cves;
}
