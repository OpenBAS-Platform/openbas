package io.openbas.utils.fixtures;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectorContract;
import io.openbas.injectors.challenge.model.ChallengeContent;
import io.openbas.rest.inject.form.InjectExecutionInput;
import java.util.List;

public class InjectFixture {

  public static final String INJECT_EMAIL_NAME = "Test email inject";
  public static final String INJECT_CHALLENGE_NAME = "Test challenge inject";

  public static Inject getInjectForEmailContract(InjectorContract injectorContract) {
    Inject inject = new Inject();
    inject.setTitle(INJECT_EMAIL_NAME);
    inject.setInjectorContract(injectorContract);
    inject.setEnabled(true);
    inject.setDependsDuration(0L);
    return inject;
  }

  public static Inject createDefaultInjectChallenge(
      InjectorContract injectorContract, ObjectMapper objectMapper, List<String> challengeIds) {
    Inject inject = new Inject();
    inject.setTitle(INJECT_CHALLENGE_NAME);
    inject.setInjectorContract(injectorContract);
    inject.setEnabled(true);
    inject.setDependsDuration(0L);

    ChallengeContent content = new ChallengeContent();
    content.setChallenges(challengeIds);
    inject.setContent(objectMapper.valueToTree(content));
    return inject;
  }

  public static InjectExecutionInput getInjectExecutionInput() {
    InjectExecutionInput input = new InjectExecutionInput();
    input.setMessage("Response from implant");
    input.setStatus("SUCCESS");
    input.setDuration(15);
    input.setIdentifiers(List.of("obas-implant-test"));
    return input;
  }
}
