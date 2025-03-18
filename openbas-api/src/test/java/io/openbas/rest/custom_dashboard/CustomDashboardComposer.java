package io.openbas.rest.custom_dashboard;

import io.openbas.database.model.CustomDashboard;
import io.openbas.database.repository.CustomDashboardRepository;
import io.openbas.utils.fixtures.composers.ComposerBase;
import io.openbas.utils.fixtures.composers.InnerComposerBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CustomDashboardComposer extends ComposerBase<CustomDashboard> {

  @Autowired private CustomDashboardRepository customDashboardRepository;

  public class Composer extends InnerComposerBase<CustomDashboard> {

    private final CustomDashboard customDashboard;

    public Composer(CustomDashboard customDashboard) {
      this.customDashboard = customDashboard;
    }

    @Override
    public CustomDashboardComposer.Composer persist() {
      customDashboardRepository.save(this.customDashboard);
      return this;
    }

    @Override
    public CustomDashboardComposer.Composer delete() {
      customDashboardRepository.delete(this.customDashboard);
      return this;
    }

    @Override
    public CustomDashboard get() {
      return this.customDashboard;
    }
  }

  public CustomDashboardComposer.Composer forCustomDashboard(CustomDashboard customDashboard) {
    generatedItems.add(customDashboard);
    return new CustomDashboardComposer.Composer(customDashboard);
  }
}
