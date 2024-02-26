package io.openex.rest.security;

import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.UserRepository;
import io.openex.service.ScenarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
@RequiredArgsConstructor
public class MethodSecurityConfig {

  private final UserRepository userRepository;
  private final ExerciseRepository exerciseRepository;
  private final ScenarioService scenarioService;

  @Bean
  MethodSecurityExpressionHandler methodSecurityExpressionHandler() {
    return new SecurityExpressionHandler(this.userRepository, this.exerciseRepository, this.scenarioService);
  }
}
