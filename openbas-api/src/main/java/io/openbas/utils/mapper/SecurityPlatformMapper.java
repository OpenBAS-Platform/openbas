package io.openbas.utils.mapper;

import io.openbas.database.model.SecurityPlatform;
import io.openbas.rest.document.form.RelatedEntityOutput;
import java.util.Set;
import java.util.stream.Collectors;

public class SecurityPlatformMapper {

  public static Set<RelatedEntityOutput> toRelatedEntityOutputs(
      Set<SecurityPlatform> securityPlatforms) {
    return securityPlatforms.stream()
        .map(securityPlatform -> toRelatedEntityOutput(securityPlatform))
        .collect(Collectors.toSet());
  }

  private static RelatedEntityOutput toRelatedEntityOutput(SecurityPlatform securityPlatform) {
    return RelatedEntityOutput.builder()
        .id(securityPlatform.getId())
        .name(securityPlatform.getName())
        .build();
  }
}
