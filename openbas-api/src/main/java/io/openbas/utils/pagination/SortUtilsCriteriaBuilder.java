package io.openbas.utils.pagination;

import io.openbas.database.model.Scenario;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Root;
import org.flywaydb.core.internal.util.StringUtils;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;

public class SortUtilsCriteriaBuilder {

  public static List<Order> toSortCriteriaBuilder(CriteriaBuilder cb, Root<Scenario> root, Sort sort) {
    List<Order> orders = new ArrayList<>();
    if (sort.isSorted()) {
      sort.forEach(order -> {
        if (StringUtils.hasText(order.getProperty())) {
          if (order.isAscending()) {
            orders.add(cb.asc(root.get(order.getProperty())));
          } else {
            orders.add(cb.desc(root.get(order.getProperty())));
          }
        }
      });
    } else {
      orders.add(cb.asc(root.get("id"))); // Default order by scenario_id
    }
    return orders;
  }

}
