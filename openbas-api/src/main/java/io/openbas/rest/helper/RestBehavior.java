package io.openbas.rest.helper;

import com.fasterxml.jackson.databind.BeanDescription;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.introspect.BeanPropertyDefinition;
import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.Organization;
import io.openbas.database.model.User;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.exception.*;
import jakarta.annotation.Resource;
import lombok.extern.java.Log;
import org.hibernate.exception.ConstraintViolationException;
import org.springdoc.api.ErrorMessage;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.UnsupportedMediaTypeException;

import java.util.*;
import java.util.stream.Collectors;

import static io.openbas.config.OpenBASAnonymous.ANONYMOUS;
import static io.openbas.config.SessionHelper.currentUser;

@RestControllerAdvice
@Log
public class RestBehavior {

  @Resource
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

  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ExceptionHandler(ImportException.class)
  public ValidationErrorBag handleBadRequestExceptions(ImportException ex) {
    ValidationErrorBag bag = new ValidationErrorBag(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
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

  @ExceptionHandler(ElementNotFoundException.class)
  public ResponseEntity<ErrorMessage> handleElementNotFoundException(ElementNotFoundException ex) {
    ErrorMessage message = new ErrorMessage("Element not found: " + ex.getMessage());
    log.warning("ElementNotFoundException: " + ex.getMessage());
    return new ResponseEntity<>(message, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(UnsupportedMediaTypeException.class)
  public ResponseEntity<ErrorMessage> handleUnsupportedMediaTypeException(UnsupportedMediaTypeException ex) {
    ErrorMessage message = new ErrorMessage(ex.getMessage());
    log.warning("UnsupportedMediaTypeException: " + ex.getMessage());
    return new ResponseEntity<>(message, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
  }

  @ExceptionHandler(FileTooBigException.class)
  public ResponseEntity<ErrorMessage> handleFileTooBigException(FileTooBigException ex) {
    ErrorMessage message = new ErrorMessage(ex.getMessage());
    log.warning("FileTooBigException: " + ex.getMessage());
    return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(AlreadyExistingException.class)
  public ResponseEntity<ErrorMessage> handleAlreadyExistingException(AlreadyExistingException ex) {
    ErrorMessage message = new ErrorMessage(ex.getMessage());
    log.warning("AlreadyExistingException: " + ex.getMessage());
    return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
  }

  // --- Open channel access
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
      OpenBASPrincipal currentUser = currentUser();
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
      OpenBASPrincipal currentUser = currentUser();
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
