package io.openbas.database.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class DefaultGrant {

  @Column(name = "grant_type", nullable = false)
  @Enumerated(EnumType.STRING)
  private Grant.GRANT_TYPE grantType;

  @Column(name = "grant_resource_type", nullable = false, length = 50)
  @Enumerated(EnumType.STRING)
  private Grant.GRANT_RESOURCE_TYPE grantResourceType;
}
