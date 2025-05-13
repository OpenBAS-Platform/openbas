package io.openbas.utils.mockConfig;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import org.springframework.boot.test.autoconfigure.properties.PropertyMapping;

@Retention(RetentionPolicy.RUNTIME)
@PropertyMapping("openbas.xtm.opencti")
public @interface WithMockOpenCTIConfig {
  String url() default "";

  String apiUrl() default "";
}
