package io.openbas.database.repository;

import io.openbas.database.raw.BasicOrganization;
import io.openbas.database.raw.BasicUser;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;

public class UserRepositoryImpl implements UserRepositoryCustom {

  @PersistenceContext
  private EntityManager em;


  @Override
  public List<BasicUser> rawAll() {
    List<Tuple> resultList = em.createNativeQuery("select us.*, org.*, array_remove(array_agg(tg.tag_id), NULL) as user_tags,"
        + "       array_remove(array_agg(grp.group_id), NULL) as user_groups,"
        + "       array_remove(array_agg(tm.team_id), NULL) as user_teams from USERS us"
        + "       left join organizations org on us.user_organization = org.organization_id"
        + "       left join users_groups usr_grp on us.user_id = usr_grp.user_id"
        + "       left join groups grp on usr_grp.group_id = grp.group_id"
        + "       left join users_teams usr_tm on us.user_id = usr_tm.user_id"
        + "       left join teams tm on usr_tm.team_id = tm.team_id"
        + "       left join users_tags usr_tg on us.user_id = usr_tg.user_id"
        + "       left join tags tg on usr_tg.tag_id = tg.tag_id"
        + "      group by us.user_id, org.organization_id;", Tuple.class).getResultList();

    return resultList.stream().map(tuple ->
        BasicUser.builder().user_id(tuple.get("user_id", String.class))
            .user_email(tuple.get("user_email", String.class))
            .user_firstname(tuple.get("user_firstname", String.class))
            .user_lastname(tuple.get("user_lastname", String.class))
            .user_phone(tuple.get("user_phone", String.class))
            .user_created_at(tuple.get("user_created_at", Timestamp.class).toInstant())
            .user_organization(BasicOrganization.builder()
                .organization_id(tuple.get("organization_id", String.class))
                .organization_description(tuple.get("organization_description", String.class))
                .organization_name(tuple.get("organization_name", String.class)).build())
            .user_tags(Arrays.stream(tuple.get("user_tags", String[].class)).toList())
            .user_teams(Arrays.stream(tuple.get("user_teams", String[].class)).toList())
            .user_groups(Arrays.stream(tuple.get("user_groups", String[].class)).toList())
            .build()).toList();
  }
}
