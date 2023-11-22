package io.openex.model;

import io.openex.database.model.Base;

public interface RepositoryClass<T extends Base> {

  Class<T> repositoryClass();

}
