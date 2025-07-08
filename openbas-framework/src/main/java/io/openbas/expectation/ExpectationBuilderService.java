package io.openbas.expectation;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.*;

import io.openbas.model.inject.form.Expectation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ExpectationBuilderService {

  public static final String PREVENTION_NAME = "Prevention";
  public static final String DETECTION_NAME = "Detection";
  public static final String VULNERABILITY_NAME = "Vulnerability";
  public static final String CHALLENGE_NAME = "Expect targets to complete the challenge(s)";
  public static final String ARTICLE_NAME = "Expect targets to read the article(s)";
  private final ExpectationPropertiesConfig expectationPropertiesConfig;

  public static Double DEFAULT_EXPECTATION_SCORE = 100.0;

  public Expectation buildPreventionExpectation() {
    Expectation preventionExpectation = new Expectation();
    preventionExpectation.setType(PREVENTION);
    preventionExpectation.setName(PREVENTION_NAME);
    preventionExpectation.setScore(DEFAULT_EXPECTATION_SCORE);
    preventionExpectation.setExpirationTime(
        this.expectationPropertiesConfig.getPreventionExpirationTime());
    return preventionExpectation;
  }

  public Expectation buildDetectionExpectation() {
    Expectation detectionExpectation = new Expectation();
    detectionExpectation.setType(DETECTION);
    detectionExpectation.setName(DETECTION_NAME);
    detectionExpectation.setScore(DEFAULT_EXPECTATION_SCORE);
    detectionExpectation.setExpirationTime(
        this.expectationPropertiesConfig.getDetectionExpirationTime());
    return detectionExpectation;
  }

  public Expectation buildVulnerabilityExpectation() {
    Expectation vulnerabilityExpectation = new Expectation();
    vulnerabilityExpectation.setType(VULNERABILITY);
    vulnerabilityExpectation.setName(VULNERABILITY_NAME);
    vulnerabilityExpectation.setScore(DEFAULT_EXPECTATION_SCORE);
    vulnerabilityExpectation.setExpirationTime(
        this.expectationPropertiesConfig.getVulnerabilityExpirationTime());
    return vulnerabilityExpectation;
  }

  public Expectation buildChallengeExpectation() {
    Expectation challengeExpectation = new Expectation();
    challengeExpectation.setType(CHALLENGE);
    challengeExpectation.setName(CHALLENGE_NAME);
    challengeExpectation.setScore(DEFAULT_EXPECTATION_SCORE);
    challengeExpectation.setExpirationTime(
        this.expectationPropertiesConfig.getChallengeExpirationTime());
    return challengeExpectation;
  }

  public Expectation buildArticleExpectation() {
    Expectation articleExpectation = new Expectation();
    articleExpectation.setType(ARTICLE);
    articleExpectation.setName(ARTICLE_NAME);
    articleExpectation.setScore(DEFAULT_EXPECTATION_SCORE);
    articleExpectation.setExpirationTime(
        this.expectationPropertiesConfig.getArticleExpirationTime());
    return articleExpectation;
  }
}
