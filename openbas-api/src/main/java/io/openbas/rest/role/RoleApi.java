package io.openbas.rest.role;

import static io.openbas.database.model.User.ROLE_ADMIN;

import io.openbas.aop.LogExecutionTime;
import io.openbas.aop.UserRoleDescription;
import io.openbas.rest.role.form.RoleInput;
import io.openbas.rest.role.form.RoleMapper;
import io.openbas.rest.role.form.RoleOutput;
import io.openbas.service.RoleService;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@UserRoleDescription
@Tag(name = "Roles management", description = "Endpoints to manage Roles.")
public class RoleApi {

  public static final String ROLE_URI = "/api/roles";

  private final RoleService roleService;
  private final RoleMapper roleMapper;

  public RoleApi(RoleService roleService, RoleMapper roleMapper) {
    super();
    this.roleService = roleService;
    this.roleMapper = roleMapper;
  }

  @LogExecutionTime
  @GetMapping(RoleApi.ROLE_URI + "/{roleId}")
  @Operation(description = "Get Role by Id", summary = "Get Role")
  @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "The Role")})
  public RoleOutput findRole(
      @PathVariable @NotBlank @Schema(description = "ID of the role") final String roleId) {
    return roleService.findById(roleId).map(roleMapper::toRoleOutput).orElse(null);
  }

  @LogExecutionTime
  @GetMapping(RoleApi.ROLE_URI)
  @Operation(description = "Get All Roles", summary = "Get Roles")
  @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "The list of all Roles")})
  public List<RoleOutput> roles() {
    return roleService.findAll().stream().map(roleMapper::toRoleOutput).toList();
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @DeleteMapping(RoleApi.ROLE_URI + "/{roleId}")
  @Transactional(rollbackFor = Exception.class)
  @Operation(summary = "Delete Role", description = "Role needs to exists")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Role deleted"),
        @ApiResponse(responseCode = "404", description = "Role not found")
      })
  public void deleteRole(
      @PathVariable @NotBlank @Schema(description = "ID of the role") final String roleId) {
    roleService.deleteRole(roleId);
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @PostMapping(RoleApi.ROLE_URI)
  @Transactional(rollbackFor = Exception.class)
  @Operation(summary = "Create Role")
  @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Role created")})
  public RoleOutput createRole(@Valid @RequestBody final RoleInput input) {
    return roleMapper.toRoleOutput(
        roleService.createRole(input.getName(), input.getCapabilities()));
  }

  @Secured(ROLE_ADMIN)
  @LogExecutionTime
  @PutMapping(RoleApi.ROLE_URI + "/{roleId}")
  @Transactional(rollbackFor = Exception.class)
  @Operation(summary = "Update Role", description = "Role needs to exists")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Role updated"),
        @ApiResponse(responseCode = "404", description = "Role not found")
      })
  public RoleOutput updateRole(
      @PathVariable @NotBlank @Schema(description = "ID of the role") final String roleId,
      @Valid @RequestBody final RoleInput input) {
    return roleMapper.toRoleOutput(
        roleService.updateRole(roleId, input.getName(), input.getCapabilities()));
  }

  @LogExecutionTime
  @PostMapping(RoleApi.ROLE_URI + "/search")
  @Operation(
      description = "Search Roles corresponding to search criteria",
      summary = "Search Roles")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "The list of all Roles corresponding to the search criteria")
      })
  public Page<RoleOutput> searchRoles(
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return roleService.searchRole(searchPaginationInput).map(roleMapper::toRoleOutput);
  }
}
