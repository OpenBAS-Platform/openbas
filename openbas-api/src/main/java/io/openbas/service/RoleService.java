package io.openbas.service;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.Capability;
import io.openbas.database.model.Role;
import io.openbas.database.repository.RoleRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class RoleService {
  private final RoleRepository roleRepository;

  public Optional<Role> findById(String id) {
    return roleRepository.findById(id);
  }

  public List<Role> findAll() {
    return StreamSupport.stream(roleRepository.findAll().spliterator(), false)
        .collect(Collectors.toList());
  }

  public Role createRole(
      @NotBlank final String roleName, @NotNull final Set<Capability> capabilities) {
    Role role = new Role();
    role.setName(roleName);
    role.setCapabilities(capabilities);
    return roleRepository.save(role);
  }

  public Role updateRole(
      @NotBlank final String roleId,
      @NotBlank final String roleName,
      @NotNull final Set<Capability> capabilities) {

    // verify that the role exists
    Role role =
        roleRepository
            .findById(roleId)
            .orElseThrow(() -> new ElementNotFoundException("Role not found with id: " + roleId));

    role.setName(roleName);
    role.setCapabilities(capabilities);

    return roleRepository.save(role);
  }

  public Page<Role> searchRole(SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(roleRepository::findAll, searchPaginationInput, Role.class);
  }

  public void deleteRole(@NotBlank final String roleId) {
    // verify that the role exists
    Role role =
        roleRepository
            .findById(roleId)
            .orElseThrow(() -> new ElementNotFoundException("Role not found with id: " + roleId));

    roleRepository.deleteById(roleId);
  }
}
