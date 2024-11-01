package io.openbas.rest.security;

import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.service.ScenarioService;
import java.util.function.Supplier;
import org.aopalliance.intercept.MethodInvocation;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations;
import org.springframework.security.authentication.AuthenticationTrustResolver;
import org.springframework.security.authentication.AuthenticationTrustResolverImpl;
import org.springframework.security.core.Authentication;

public class SecurityExpressionHandler extends DefaultMethodSecurityExpressionHandler {

  private final AuthenticationTrustResolver trustResolver = new AuthenticationTrustResolverImpl();
  private final UserRepository userRepository;
  private final ExerciseRepository exerciseRepository;
  private final ScenarioService scenarioService;

  public SecurityExpressionHandler(
      final UserRepository userRepository,
      final ExerciseRepository exerciseRepository,
      final ScenarioService scenarioService) {
    this.userRepository = userRepository;
    this.exerciseRepository = exerciseRepository;
    this.scenarioService = scenarioService;
  }

  @Override
  public EvaluationContext createEvaluationContext(
      Supplier<Authentication> authentication, MethodInvocation invocation) {
    StandardEvaluationContext context =
        (StandardEvaluationContext) super.createEvaluationContext(authentication, invocation);
    MethodSecurityExpressionOperations delegate =
        (MethodSecurityExpressionOperations) context.getRootObject().getValue();
    assert delegate != null;
    SecurityExpression root =
        new SecurityExpression(
            delegate.getAuthentication(),
            this.userRepository,
            this.exerciseRepository,
            this.scenarioService);
    root.setPermissionEvaluator(getPermissionEvaluator());
    root.setTrustResolver(this.trustResolver);
    root.setRoleHierarchy(getRoleHierarchy());
    context.setRootObject(root);
    return context;
  }
}
