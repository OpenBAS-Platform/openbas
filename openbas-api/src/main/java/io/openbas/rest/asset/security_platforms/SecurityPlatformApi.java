package io.openbas.rest.asset.security_platforms;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.asset.security_platforms.form.SecurityPlatformInput;
import io.openbas.rest.asset.security_platforms.form.SecurityPlatformUpsertInput;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class SecurityPlatformApi {

  public static final String SECURITY_PLATFORM_URI = "/api/security_platforms";

  @Value("${info.app.version:unknown}")
  String version;

  private final SecurityPlatformRepository securityPlatformRepository;
  private final DocumentRepository documentRepository;
  private final TagRepository tagRepository;

  @GetMapping(SECURITY_PLATFORM_URI)
  public Iterable<SecurityPlatform> securityPlatforms() {
    return securityPlatformRepository.findAll();
  }

  @PostMapping(SECURITY_PLATFORM_URI)
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public SecurityPlatform createSecurityPlatform(
      @Valid @RequestBody final SecurityPlatformInput input) {
    SecurityPlatform securityPlatform = new SecurityPlatform();
    securityPlatform.setUpdateAttributes(input);
    securityPlatform.setSecurityPlatformType(input.getSecurityPlatformType());
    if (input.getLogoDark() != null) {
      securityPlatform.setLogoDark(documentRepository.findById(input.getLogoDark()).orElse(null));
    } else {
      securityPlatform.setLogoDark(null);
    }
    if (input.getLogoLight() != null) {
      securityPlatform.setLogoLight(documentRepository.findById(input.getLogoLight()).orElse(null));
    } else {
      securityPlatform.setLogoLight(null);
    }
    securityPlatform.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
    return this.securityPlatformRepository.save(securityPlatform);
  }

  @PostMapping(SECURITY_PLATFORM_URI + "/upsert")
  @PreAuthorize("isPlanner()")
  @org.springframework.transaction.annotation.Transactional(rollbackFor = Exception.class)
  public SecurityPlatform upsertSecurityPlatform(
      @Valid @RequestBody SecurityPlatformUpsertInput input) {
    Optional<SecurityPlatform> securityPlatform =
        securityPlatformRepository.findByExternalReference(input.getExternalReference());
    if (securityPlatform.isPresent()) {
      SecurityPlatform existingSecurityPlatform = securityPlatform.get();
      existingSecurityPlatform.setUpdateAttributes(input);
      existingSecurityPlatform.setSecurityPlatformType(input.getSecurityPlatformType());
      if (input.getLogoDark() != null) {
        existingSecurityPlatform.setLogoDark(
            documentRepository.findById(input.getLogoDark()).orElse(null));
      } else {
        existingSecurityPlatform.setLogoDark(null);
      }
      if (input.getLogoLight() != null) {
        existingSecurityPlatform.setLogoLight(
            documentRepository.findById(input.getLogoLight()).orElse(null));
      } else {
        existingSecurityPlatform.setLogoLight(null);
      }
      existingSecurityPlatform.setTags(
          iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
      return this.securityPlatformRepository.save(existingSecurityPlatform);
    } else {
      SecurityPlatform newSecurityPlatform = new SecurityPlatform();
      newSecurityPlatform.setUpdateAttributes(input);
      newSecurityPlatform.setSecurityPlatformType(input.getSecurityPlatformType());
      if (input.getLogoDark() != null) {
        newSecurityPlatform.setLogoDark(
            documentRepository.findById(input.getLogoDark()).orElse(null));
      } else {
        newSecurityPlatform.setLogoDark(null);
      }
      if (input.getLogoLight() != null) {
        newSecurityPlatform.setLogoLight(
            documentRepository.findById(input.getLogoLight()).orElse(null));
      } else {
        newSecurityPlatform.setLogoLight(null);
      }
      newSecurityPlatform.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
      return this.securityPlatformRepository.save(newSecurityPlatform);
    }
  }

  @GetMapping(SECURITY_PLATFORM_URI + "/{securityPlatformId}")
  @PreAuthorize("isPlanner()")
  public SecurityPlatform securityPlatform(
      @PathVariable @NotBlank final String securityPlatformId) {
    return this.securityPlatformRepository
        .findById(securityPlatformId)
        .orElseThrow(ElementNotFoundException::new);
  }

  @PostMapping(SECURITY_PLATFORM_URI + "/search")
  public Page<SecurityPlatform> securityPlatforms(
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        this.securityPlatformRepository::findAll, searchPaginationInput, SecurityPlatform.class);
  }

  @PutMapping(SECURITY_PLATFORM_URI + "/{securityPlatformId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public SecurityPlatform updateSecurityPlatform(
      @PathVariable @NotBlank final String securityPlatformId,
      @Valid @RequestBody final SecurityPlatformInput input) {
    SecurityPlatform securityPlatform =
        this.securityPlatformRepository.findById(securityPlatformId).orElseThrow();
    securityPlatform.setUpdateAttributes(input);
    if (input.getLogoDark() != null) {
      securityPlatform.setLogoDark(documentRepository.findById(input.getLogoDark()).orElse(null));
    } else {
      securityPlatform.setLogoDark(null);
    }
    if (input.getLogoLight() != null) {
      securityPlatform.setLogoLight(documentRepository.findById(input.getLogoLight()).orElse(null));
    } else {
      securityPlatform.setLogoLight(null);
    }
    securityPlatform.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
    return this.securityPlatformRepository.save(securityPlatform);
  }

  @DeleteMapping(SECURITY_PLATFORM_URI + "/{securityPlatformId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public void deleteSecurityPlatform(@PathVariable @NotBlank final String securityPlatformId) {
    this.securityPlatformRepository.deleteById(securityPlatformId);
  }
}
