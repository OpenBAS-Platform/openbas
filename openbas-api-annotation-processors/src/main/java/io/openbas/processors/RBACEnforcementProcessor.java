package io.openbas.processors;

import java.util.Map;
import java.util.Set;
import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.*;
import javax.tools.Diagnostic;

@SupportedAnnotationTypes({
  "org.springframework.web.bind.annotation.GetMapping",
  "org.springframework.web.bind.annotation.PostMapping",
  "org.springframework.web.bind.annotation.PutMapping",
  "org.springframework.web.bind.annotation.DeleteMapping",
  "org.springframework.web.bind.annotation.RequestMapping"
})
@SupportedSourceVersion(SourceVersion.RELEASE_21)
public class RBACEnforcementProcessor extends AbstractProcessor {

  private static final String RBAC_ANNOTATION = "io.openbas.annotations.RBAC";

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    for (TypeElement annotation : annotations) {
      Set<? extends Element> annotatedMethods = roundEnv.getElementsAnnotatedWith(annotation);

      for (Element element : annotatedMethods) {
        if (element.getKind() != ElementKind.METHOD) {
          continue;
        }

        ExecutableElement method = (ExecutableElement) element;
        checkRBACPresent(method, annotation);
      }
    }
    return false;
  }

  private void checkRBACPresent(ExecutableElement method, TypeElement mappingAnnotation) {
    boolean hasRBAC = false;

    for (AnnotationMirror annotationMirror : method.getAnnotationMirrors()) {
      String annotationType = annotationMirror.getAnnotationType().toString();
      if (annotationType.equals(RBAC_ANNOTATION) || annotationType.endsWith(".RBAC")) {
        hasRBAC = true;

        // Extract annotation values
        Map<? extends ExecutableElement, ? extends AnnotationValue> values =
            annotationMirror.getElementValues();

        String requiredActions = null;
        String resourceType = null;
        boolean skipRBAC = false;

        for (Map.Entry<? extends ExecutableElement, ? extends AnnotationValue> entry :
            values.entrySet()) {
          String name = entry.getKey().getSimpleName().toString();
          Object value = entry.getValue().getValue();

          switch (name) {
            case "skipRBAC":
              skipRBAC = Boolean.parseBoolean(value.toString());
              break;
            case "requiredActions":
              requiredActions = value.toString();
              break;
            case "resourceType":
              resourceType = value.toString();
              break;
          }
        }

        // Validate: if skipRBAC is false, requiredActions and resourceType must not be SKIP_RBAC
        if (!skipRBAC) {
          if ("SKIP_RBAC".equals(requiredActions) || "SKIP_RBAC".equals(resourceType)) {
            processingEnv
                .getMessager()
                .printMessage(
                    Diagnostic.Kind.ERROR,
                    String.format(
                        "Method '%s' has @RBAC with skipRBAC=false but invalid values: requiredActions=%s, resourceType=%s. "
                            + "These must not be set to SKIP_RBAC when RBAC checks are enforced.",
                        method.getSimpleName(), requiredActions, resourceType),
                    method);
          }
        }

        break; // only need to process @RBAC once
      }
    }

    if (!hasRBAC) {
      processingEnv
          .getMessager()
          .printMessage(
              Diagnostic.Kind.ERROR,
              String.format(
                  "Method '%s' has @%s but is missing @RBAC annotation. "
                      + "All controller endpoints must be protected with @RBAC.",
                  method.getSimpleName(), mappingAnnotation.getSimpleName()),
              method);
    }
  }
}
