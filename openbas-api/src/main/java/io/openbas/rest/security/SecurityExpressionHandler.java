package io.openbas.rest.security;

import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.database.repository.UserRepository;
import java.util.function.Supplier;
import lombok.Getter;
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
  private final ScenarioRepository scenarioRepository;
  private final InjectRepository injectRepository;

  @Getter private SecurityExpression securityExpression;

  public SecurityExpressionHandler(
      final UserRepository userRepository,
      final ExerciseRepository exerciseRepository,
      final ScenarioRepository scenarioRepository,
      final InjectRepository injectRepository) {
    this.userRepository = userRepository;
    this.exerciseRepository = exerciseRepository;
    this.scenarioRepository = scenarioRepository;
    this.injectRepository = injectRepository;
  }

  @Override
  public EvaluationContext createEvaluationContext(
      Supplier<Authentication> authentication, MethodInvocation invocation) {
    StandardEvaluationContext context =
        (StandardEvaluationContext) super.createEvaluationContext(authentication, invocation);
    MethodSecurityExpressionOperations delegate =
        (MethodSecurityExpressionOperations) context.getRootObject().getValue();
    assert delegate != null;
    this.securityExpression =
        new SecurityExpression(
            delegate.getAuthentication(),
            this.userRepository,
            this.exerciseRepository,
            this.scenarioRepository,
            this.injectRepository);
    this.securityExpression.setPermissionEvaluator(getPermissionEvaluator());
    this.securityExpression.setTrustResolver(this.trustResolver);
    this.securityExpression.setRoleHierarchy(getRoleHierarchy());
    context.setRootObject(this.securityExpression);
    return context;
  }
}
