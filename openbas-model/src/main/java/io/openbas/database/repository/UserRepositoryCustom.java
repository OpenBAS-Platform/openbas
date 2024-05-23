package io.openbas.database.repository;

import io.openbas.database.raw.BasicUser;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepositoryCustom {

  List<BasicUser> rawAll();
}
