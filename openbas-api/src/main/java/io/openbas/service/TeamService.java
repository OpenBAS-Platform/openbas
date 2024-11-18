package io.openbas.service;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.criteria.GenericCriteria.countQuery;
import static io.openbas.database.specification.TeamSpecification.teamsAccessibleFromOrganizations;
import static io.openbas.rest.team.TeamQueryHelper.execution;
import static io.openbas.rest.team.TeamQueryHelper.select;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;
import static io.openbas.utils.pagination.SortUtilsCriteriaBuilder.toSortCriteriaBuilder;

import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.Organization;
import io.openbas.database.model.Tag;
import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.team.output.TeamOutput;
import io.openbas.telemetry.Tracing;
import io.openbas.utils.CopyObjectListUtils;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.function.TriFunction;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeamService {

  @PersistenceContext private EntityManager entityManager;

  private final UserRepository userRepository;

  public Team copyContextualTeam(Team teamToCopy) {
    Team newTeam = new Team();
    newTeam.setName(teamToCopy.getName());
    newTeam.setDescription(teamToCopy.getDescription());
    newTeam.setTags(CopyObjectListUtils.copy(teamToCopy.getTags(), Tag.class));
    newTeam.setOrganization(teamToCopy.getOrganization());
    newTeam.setUsers(CopyObjectListUtils.copy(teamToCopy.getUsers(), User.class));
    newTeam.setContextual(teamToCopy.getContextual());
    return newTeam;
  }

  @Tracing(name = "Paginate teams", layer = "service")
  public Page<TeamOutput> teamPagination(
      @NotNull SearchPaginationInput searchPaginationInput,
      @NotNull final Specification<Team> teamSpecification) {
    TriFunction<Specification<Team>, Specification<Team>, Pageable, Page<TeamOutput>> teamsFunction;
    OpenBASPrincipal currentUser = currentUser();
    if (currentUser.isAdmin()) {
      teamsFunction =
          (Specification<Team> specification,
              Specification<Team> specificationCount,
              Pageable pageable) ->
              this.paginate(
                  teamSpecification.and(specification),
                  teamSpecification.and(specificationCount),
                  pageable);
    } else {
      User user =
          this.userRepository
              .findById(currentUser.getId())
              .orElseThrow(ElementNotFoundException::new);
      List<String> organizationIds =
          user.getGroups().stream()
              .flatMap(group -> group.getOrganizations().stream())
              .map(Organization::getId)
              .toList();
      teamsFunction =
          (Specification<Team> specification,
              Specification<Team> specificationCount,
              Pageable pageable) ->
              this.paginate(
                  teamSpecification
                      .and(teamsAccessibleFromOrganizations(organizationIds))
                      .and(specification),
                  teamSpecification
                      .and(teamsAccessibleFromOrganizations(organizationIds))
                      .and(specificationCount),
                  pageable);
    }
    return buildPaginationCriteriaBuilder(teamsFunction, searchPaginationInput, Team.class);
  }

  private Page<TeamOutput> paginate(
      Specification<Team> specification,
      Specification<Team> specificationCount,
      Pageable pageable) {
    try {
      CriteriaBuilder cb = this.entityManager.getCriteriaBuilder();

      CriteriaQuery<Tuple> cq = cb.createTupleQuery();
      Root<Team> teamRoot = cq.from(Team.class);
      select(cb, cq, teamRoot);

      // -- Specification --
      if (specification != null) {
        Predicate predicate = specification.toPredicate(teamRoot, cq, cb);
        if (predicate != null) {
          cq.where(predicate);
        }
      }

      // -- Sorting --
      List<Order> orders = toSortCriteriaBuilder(cb, teamRoot, pageable.getSort());
      cq.orderBy(orders);

      // Type Query
      TypedQuery<Tuple> query = entityManager.createQuery(cq);

      // -- Pagination --
      query.setFirstResult((int) pageable.getOffset());
      query.setMaxResults(pageable.getPageSize());

      // -- EXECUTION --
      List<TeamOutput> teams = execution(query);

      // -- Count Query --
      Long total = countQuery(cb, this.entityManager, Team.class, specificationCount);

      return new PageImpl<>(teams, pageable, total);
    } finally {
      if (entityManager != null && entityManager.isOpen()) {
        entityManager.close();
      }
    }
  }

  public List<TeamOutput> find(Specification<Team> specification) {
    try {
      CriteriaBuilder cb = this.entityManager.getCriteriaBuilder();

      CriteriaQuery<Tuple> cq = cb.createTupleQuery();
      Root<Team> teamRoot = cq.from(Team.class);
      select(cb, cq, teamRoot);

      if (specification != null) {
        Predicate predicate = specification.toPredicate(teamRoot, cq, cb);
        if (predicate != null) {
          cq.where(predicate);
        }
      }

      TypedQuery<Tuple> query = entityManager.createQuery(cq);
      return execution(query);

    } finally {
      if (entityManager != null && entityManager.isOpen()) {
        entityManager.close();
      }
    }
  }
}
