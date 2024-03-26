package io.openbas.database;

import io.openbas.database.model.*;
import jakarta.persistence.EntityManager;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.util.StringUtils.hasText;

@Component
@RequiredArgsConstructor
public class GlobalSearch {

  private final EntityManager entityManager;

  public List<GlobalSearchResult> globalSearch(@NotBlank final String searchTerm) {
    if (!hasText(searchTerm)) {
      return List.of();
    }

    List<GlobalSearchResult> results = new ArrayList<>();

    // Search on assets
    results.addAll(
        this.entityManager.createNativeQuery(
                "SELECT * FROM assets WHERE asset_name ILIKE concat('%', concat(:searchTerm, '%'))"
            )
            .setParameter("searchTerm", searchTerm)
            .getResultList()
            .stream()
            .map((r) -> {
              GlobalSearchResult searchResult = new GlobalSearchResult();
              Object[] list = (Object[]) r;
              searchResult.setId((String) list[0]);
              searchResult.setEntity(Asset.class.getSimpleName());
              searchResult.setName((String) list[4]);
              return searchResult;
            })
            .toList()
    );

    // Search on asset groups
    results.addAll(
        this.entityManager.createNativeQuery(
                "SELECT * FROM asset_groups WHERE asset_group_name ILIKE concat('%', concat(:searchTerm, '%'))"
        )
        .setParameter("searchTerm", searchTerm)
        .getResultList()
            .stream()
            .map((r) -> {
              GlobalSearchResult searchResult = new GlobalSearchResult();
              Object[] list = (Object[]) r;
              searchResult.setId((String) list[0]);
              searchResult.setEntity(AssetGroup.class.getSimpleName());
              searchResult.setName((String) list[1]);
              return searchResult;
            })
            .toList()
    );

    // Search on users
    results.addAll(
        this.entityManager.createNativeQuery(
                "SELECT * FROM users WHERE user_email ILIKE concat('%', concat(:searchTerm, '%'))"
        )
        .setParameter("searchTerm", searchTerm)
        .getResultList()
        .stream()
        .map((r) -> {
          GlobalSearchResult searchResult = new GlobalSearchResult();
          Object[] list = (Object[]) r;
          searchResult.setId((String) list[0]);
          searchResult.setEntity(User.class.getSimpleName());
          searchResult.setName((String) list[4]);
          return searchResult;
        })
        .toList()
    );

    // Search on teams
    results.addAll(
        this.entityManager.createNativeQuery(
                "SELECT * FROM teams WHERE team_name ILIKE concat('%', concat(:searchTerm, '%'))"
        )
        .setParameter("searchTerm", searchTerm)
            .getResultList()
            .stream()
            .map((r) -> {
              GlobalSearchResult searchResult = new GlobalSearchResult();
              Object[] list = (Object[]) r;
              searchResult.setId((String) list[0]);
              searchResult.setEntity(Team.class.getSimpleName());
              searchResult.setName((String) list[1]);
              return searchResult;
            })
            .toList()
    );

    // Search on organizations
    results.addAll(
        this.entityManager.createNativeQuery(
                "SELECT * FROM organizations WHERE organization_name ILIKE concat('%', concat(:searchTerm, '%'))"
        )
        .setParameter("searchTerm", searchTerm)
        .getResultList()
        .stream()
        .map((r) -> {
          GlobalSearchResult searchResult = new GlobalSearchResult();
          Object[] list = (Object[]) r;
          searchResult.setId((String) list[0]);
          searchResult.setEntity(Organization.class.getSimpleName());
          searchResult.setName((String) list[1]);
          return searchResult;
        })
        .toList()
    );

    // Search on scenarios
    results.addAll(
        this.entityManager.createNativeQuery(
                "SELECT * FROM scenarios WHERE scenario_name ILIKE concat('%', concat(:searchTerm, '%'))"
            )
            .setParameter("searchTerm", searchTerm)
            .getResultList()
            .stream()
            .map((r) -> {
              GlobalSearchResult searchResult = new GlobalSearchResult();
              Object[] list = (Object[]) r;
              searchResult.setId((String) list[0]);
              searchResult.setEntity(Scenario.class.getSimpleName());
              searchResult.setName((String) list[1]);
              return searchResult;
            })
            .toList()
    );

    // Search on simulations
    results.addAll(
        this.entityManager.createNativeQuery(
                "SELECT * FROM exercises WHERE exercise_name ILIKE concat('%', concat(:searchTerm, '%'))"
            )
            .setParameter("searchTerm", searchTerm)
            .getResultList()
            .stream()
            .map((r) -> {
              GlobalSearchResult searchResult = new GlobalSearchResult();
              Object[] list = (Object[]) r;
              searchResult.setId((String) list[0]);
              searchResult.setEntity(Exercise.class.getSimpleName());
              searchResult.setName((String) list[1]);
              return searchResult;
            })
            .toList()
    );

    return results;
  }

  @Data
  public static class GlobalSearchResult {

    @NotBlank
    private String id;
    @NotBlank
    private String entity;
    @NotBlank
    private String name;

  }


}
