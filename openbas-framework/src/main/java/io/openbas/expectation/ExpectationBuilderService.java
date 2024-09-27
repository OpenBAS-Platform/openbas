package io.openbas.expectation;

import io.openbas.model.inject.form.Expectation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.*;

@RequiredArgsConstructor
@Service
public class ExpectationBuilderService {

  private final ExpectationPropertiesConfig expectationPropertiesConfig;

  public static Double DEFAULT_TECHNICAL_EXPECTATION_SCORE = 100.0;
  public static Double DEFAULT_HUMAN_EXPECTATION_SCORE = 0.0;

  public Expectation buildPreventionExpectation() {
    Expectation preventionExpectation = new Expectation();
    preventionExpectation.setType(PREVENTION);
    preventionExpectation.setName("Expect inject to be prevented");
    preventionExpectation.setScore(DEFAULT_TECHNICAL_EXPECTATION_SCORE);
    preventionExpectation.setExpirationTime(this.expectationPropertiesConfig.getPreventionExpirationTime());
    return preventionExpectation;
  }

  public Expectation buildDetectionExpectation() {
    Expectation detectionExpectation = new Expectation();
    detectionExpectation.setType(DETECTION);
    detectionExpectation.setName("Expect inject to be detected");
    detectionExpectation.setScore(DEFAULT_TECHNICAL_EXPECTATION_SCORE);
    detectionExpectation.setExpirationTime(this.expectationPropertiesConfig.getDetectionExpirationTime());
    return detectionExpectation;
  }

  public Expectation buildChallengeExpectation() {
    Expectation challengeExpectation = new Expectation();
    challengeExpectation.setType(CHALLENGE);
    challengeExpectation.setName("Expect targets to complete the challenge(s)");
    challengeExpectation.setScore(DEFAULT_HUMAN_EXPECTATION_SCORE);
    challengeExpectation.setExpirationTime(this.expectationPropertiesConfig.getChallengeExpirationTime());
    return challengeExpectation;
  }

  public Expectation buildArticleExpectation() {
    Expectation articleExpectation = new Expectation();
    articleExpectation.setType(ARTICLE);
    articleExpectation.setName("Expect targets to read the article(s)");
    articleExpectation.setScore(DEFAULT_HUMAN_EXPECTATION_SCORE);
    articleExpectation.setExpirationTime(this.expectationPropertiesConfig.getArticleExpirationTime());
    return articleExpectation;
  }

}
