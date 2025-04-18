package io.openbas.service.challenge;

import static io.openbas.utils.challenge.ChallengeAttemptUtils.challengeAttemptId;

import io.openbas.database.model.ChallengeAttempt;
import io.openbas.database.model.ChallengeAttemptId;
import io.openbas.database.repository.ChallengeAttemptRepository;
import jakarta.validation.constraints.NotBlank;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChallengeAttemptService {

  private final ChallengeAttemptRepository challengeAttemptRepository;

  // -- CRUD --

  public Optional<ChallengeAttempt> challengeAttempt(@NotNull final ChallengeAttemptId id) {
    return this.challengeAttemptRepository.findById(id);
  }

  public Optional<ChallengeAttempt> challengeAttempt(
      @NotBlank final String challengeId,
      @NotBlank final String injectStatusId,
      @NotBlank final String userId) {
    ChallengeAttemptId challengeAttemptId = challengeAttemptId(challengeId, injectStatusId, userId);
    return this.challengeAttemptRepository.findById(challengeAttemptId);
  }

  public ChallengeAttempt saveChallengeAttempt(@NotNull final ChallengeAttempt challengeAttempt) {
    return this.challengeAttemptRepository.save(challengeAttempt);
  }

  public void deleteChallengeAttempt(@NotNull final ChallengeAttemptId id) {
    this.challengeAttemptRepository.deleteById(id);
  }
}
