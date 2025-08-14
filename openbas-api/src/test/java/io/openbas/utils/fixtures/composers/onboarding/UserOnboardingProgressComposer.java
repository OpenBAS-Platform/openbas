package io.openbas.utils.fixtures.composers.onboarding;

import io.openbas.database.model.UserOnboardingProgress;
import io.openbas.database.repository.UserOnboardingProgressRepository;
import io.openbas.utils.fixtures.composers.ComposerBase;
import io.openbas.utils.fixtures.composers.ExecutorComposer;
import io.openbas.utils.fixtures.composers.InnerComposerBase;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserOnboardingProgressComposer extends ComposerBase<UserOnboardingProgress> {

  @Autowired private UserOnboardingProgressRepository userOnboardingProgressRepository;

  public class Composer extends InnerComposerBase<UserOnboardingProgress> {

    private final UserOnboardingProgress userOnboardingProgress;
    private Optional<ExecutorComposer.Composer> executorComposer = Optional.empty();

    public Composer(UserOnboardingProgress userOnboardingProgress) {
      this.userOnboardingProgress = userOnboardingProgress;
    }

    @Override
    public UserOnboardingProgressComposer.Composer persist() {
      executorComposer.ifPresent(ExecutorComposer.Composer::persist);
      userOnboardingProgressRepository.save(userOnboardingProgress);
      return this;
    }

    @Override
    public UserOnboardingProgressComposer.Composer delete() {
      executorComposer.ifPresent(ExecutorComposer.Composer::delete);
      userOnboardingProgressRepository.delete(userOnboardingProgress);
      return this;
    }

    @Override
    public UserOnboardingProgress get() {
      return this.userOnboardingProgress;
    }
  }

  public UserOnboardingProgressComposer.Composer forUserOnboardingProgress(
      UserOnboardingProgress userOnboardingProgress) {
    generatedItems.add(userOnboardingProgress);
    return new UserOnboardingProgressComposer.Composer(userOnboardingProgress);
  }
}
