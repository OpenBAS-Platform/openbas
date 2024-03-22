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
                "SELECT * FROM assets WHERE to_tsvector('simple', asset_name) @@ to_tsquery('simple', concat(:searchTerm, ':*'))"
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
            "SELECT * FROM asset_groups WHERE to_tsvector('simple', asset_group_name) @@ to_tsquery('simple', concat(:searchTerm, ':*'))"
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
            "SELECT * FROM users WHERE to_tsvector('simple', user_email) @@ to_tsquery('simple', concat(:searchTerm, ':*'))"
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
            "SELECT * FROM teams WHERE to_tsvector('simple', team_name) @@ to_tsquery('simple', concat(:searchTerm, ':*'))"
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
            "SELECT * FROM organizations WHERE to_tsvector('simple', organization_name) @@ to_tsquery('simple', concat(:searchTerm, ':*'))"
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
