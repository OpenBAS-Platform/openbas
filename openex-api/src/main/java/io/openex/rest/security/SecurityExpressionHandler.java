package io.openex.rest.security;

import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.UserRepository;
import org.aopalliance.intercept.MethodInvocation;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations;
import org.springframework.security.authentication.AuthenticationTrustResolver;
import org.springframework.security.authentication.AuthenticationTrustResolverImpl;
import org.springframework.security.core.Authentication;

import java.util.function.Supplier;

public class SecurityExpressionHandler extends DefaultMethodSecurityExpressionHandler {

  private final AuthenticationTrustResolver trustResolver = new AuthenticationTrustResolverImpl();
  private final ExerciseRepository exerciseRepository;
  private final UserRepository userRepository;

  public SecurityExpressionHandler(UserRepository userRepository, ExerciseRepository exerciseRepository) {
    this.userRepository = userRepository;
    this.exerciseRepository = exerciseRepository;
  }

  @Override
  public EvaluationContext createEvaluationContext(Supplier<Authentication> authentication,
      MethodInvocation invocation) {
    StandardEvaluationContext context = (StandardEvaluationContext) super.createEvaluationContext(authentication,
        invocation);
    MethodSecurityExpressionOperations delegate = (MethodSecurityExpressionOperations) context.getRootObject()
        .getValue();
    assert delegate != null;
    SecurityExpression root = new SecurityExpression(delegate.getAuthentication(), userRepository, exerciseRepository);
    root.setPermissionEvaluator(getPermissionEvaluator());
    root.setTrustResolver(this.trustResolver);
    root.setRoleHierarchy(getRoleHierarchy());
    context.setRootObject(root);
    return context;
  }
}
