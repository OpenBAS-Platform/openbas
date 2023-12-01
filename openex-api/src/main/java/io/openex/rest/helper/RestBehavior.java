package io.openex.rest.helper;

import com.fasterxml.jackson.databind.BeanDescription;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.introspect.BeanPropertyDefinition;
import io.openex.config.OpenexPrincipal;
import io.openex.database.model.Organization;
import io.openex.database.model.User;
import io.openex.database.repository.UserRepository;
import io.openex.rest.exception.InputValidationException;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import org.springframework.beans.factory.annotation.Autowired;
import java.util.*;
import java.util.stream.Collectors;

import static io.openex.config.OpenExAnonymous.ANONYMOUS;
import static io.openex.config.SessionHelper.currentUser;


public class RestBehavior {

  @Autowired
  protected ObjectMapper mapper;

  // Build the mapping between json specific name and the actual database field name
  private Map<String, String> buildJsonMappingFields(MethodArgumentNotValidException ex) {
    Class<?> inputClass = Objects.requireNonNull(ex.getBindingResult().getTarget()).getClass();
    JavaType javaType = mapper.getTypeFactory().constructType(inputClass);
    BeanDescription beanDescription = mapper.getSerializationConfig().introspect(javaType);
    return beanDescription.findProperties().stream()
        .collect(Collectors.toMap(BeanPropertyDefinition::getInternalName, BeanPropertyDefinition::getName));
  }

  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ValidationErrorBag handleValidationExceptions(MethodArgumentNotValidException ex) {
    Map<String, String> jsonFieldsMapping = buildJsonMappingFields(ex);
    ValidationErrorBag bag = new ValidationErrorBag();
    ValidationError errors = new ValidationError();
    Map<String, ValidationContent> errorsBag = new HashMap<>();
    ex.getBindingResult().getAllErrors().forEach((error) -> {
      String fieldName = ((FieldError) error).getField();
      String errorMessage = error.getDefaultMessage();
      errorsBag.put(jsonFieldsMapping.get(fieldName), new ValidationContent(errorMessage));
    });
    errors.setChildren(errorsBag);
    bag.setErrors(errors);
    return bag;
  }

  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ExceptionHandler(InputValidationException.class)
  public ValidationErrorBag handleInputValidationExceptions(InputValidationException ex) {
    ValidationErrorBag bag = new ValidationErrorBag();
    ValidationError errors = new ValidationError();
    Map<String, ValidationContent> errorsBag = new HashMap<>();
    errorsBag.put(ex.getField(), new ValidationContent(ex.getMessage()));
    errors.setChildren(errorsBag);
    bag.setErrors(errors);
    return bag;
  }

  @ResponseStatus(HttpStatus.UNAUTHORIZED)
  @ExceptionHandler(AccessDeniedException.class)
  public ValidationErrorBag handleValidationExceptions() {
    ValidationErrorBag bag = new ValidationErrorBag(HttpStatus.UNAUTHORIZED.value(), "ACCESS_DENIED");
    ValidationError errors = new ValidationError();
    Map<String, ValidationContent> errorsBag = new HashMap<>();
    errorsBag.put("username", new ValidationContent("Invalid user or password"));
    errors.setChildren(errorsBag);
    bag.setErrors(errors);
    return bag;
  }

  @ResponseStatus(HttpStatus.CONFLICT)
  @ExceptionHandler(DataIntegrityViolationException.class)
  public ViolationErrorBag handleIntegrityException(DataIntegrityViolationException e) {
    ViolationErrorBag errorBag = new ViolationErrorBag();
    errorBag.setType(DataIntegrityViolationException.class.getSimpleName());
    if (e.getCause() instanceof ConstraintViolationException violationException) {
      errorBag.setType(ConstraintViolationException.class.getSimpleName());
      errorBag.setMessage("Error applying constraint " + violationException.getConstraintName());
      errorBag.setError(violationException.getMessage());
    } else {
      errorBag.setMessage("Database integrity violation");
      errorBag.setError(e.getMessage());
    }
    return errorBag;
  }

  // --- Open media access
  public User impersonateUser(UserRepository userRepository, Optional<String> userId) {
    if (currentUser().getId().equals(ANONYMOUS)) {
      if (userId.isPresent()) {
        return userRepository.findById(userId.get()).orElseThrow();
      }
      throw new UnsupportedOperationException("User must be logged or dynamic player is required");
    }
    return userRepository.findById(currentUser().getId()).orElseThrow();
  }

  public void checkUserAccess(UserRepository userRepository, String userId) {
    User askedUser = userRepository.findById(userId).orElseThrow();
    if (askedUser.getOrganization() != null) {
      OpenexPrincipal currentUser = currentUser();
      if (!currentUser.isAdmin()) {
        User local = userRepository.findById(currentUser.getId()).orElseThrow();
        List<String> localOrganizationIds = local.getGroups().stream()
            .flatMap(group -> group.getOrganizations().stream())
            .map(Organization::getId)
            .toList();
        if (!localOrganizationIds.contains(askedUser.getOrganization().getId())) {
          throw new UnsupportedOperationException("User is restricted");
        }
      }
    }
  }

  public void checkOrganizationAccess(UserRepository userRepository, String organizationId) {
    if (organizationId != null) {
      OpenexPrincipal currentUser = currentUser();
      if (!currentUser.isAdmin()) {
        User local = userRepository.findById(currentUser.getId()).orElseThrow();
        List<String> localOrganizationIds = local.getGroups().stream()
            .flatMap(group -> group.getOrganizations().stream())
            .map(Organization::getId)
            .toList();
        if (!localOrganizationIds.contains(organizationId)) {
          throw new UnsupportedOperationException("User is restricted");
        }
      }
    }
  }
}
