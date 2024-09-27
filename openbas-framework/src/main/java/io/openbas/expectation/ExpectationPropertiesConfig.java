package io.openbas.expectation;

import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import static java.util.Optional.ofNullable;

@Component
@Setter
public class ExpectationPropertiesConfig {

  public static long DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME = 21600L;
  public static long DEFAULT_HUMAN_EXPECTATION_EXPIRATION_TIME = 3600L;

  @Value("${openbas.expectation.technical.expiration-time}")
  private Long technicalExpirationTime;
  @Value("${openbas.expectation.detection.expiration-time}")
  private Long detectionExpirationTime;
  @Value("${openbas.expectation.prevention.expiration-time}")
  private Long preventionExpirationTime;

  @Value("${openbas.expectation.human.expiration-time}")
  private Long humanExpirationTime;
  @Value("${openbas.expectation.challenge.expiration-time}")
  private Long challengeExpirationTime;
  @Value("${openbas.expectation.article.expiration-time}")
  private Long articleExpirationTime;
  @Value("${openbas.expectation.manual.expiration-time}")
  private Long manualExpirationTime;

  public long getDetectionExpirationTime() {
    return ofNullable(this.detectionExpirationTime)
        .orElse(
            ofNullable(this.technicalExpirationTime)
                .orElse(DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME)
        );
  }

  public long getPreventionExpirationTime() {
    return ofNullable(this.preventionExpirationTime)
        .orElse(
            ofNullable(this.technicalExpirationTime)
                .orElse(DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME)
        );
  }

  public long getChallengeExpirationTime() {
    return ofNullable(this.challengeExpirationTime)
        .orElse(
            ofNullable(this.humanExpirationTime)
                .orElse(DEFAULT_HUMAN_EXPECTATION_EXPIRATION_TIME)
        );
  }

  public long getArticleExpirationTime() {
    return ofNullable(this.articleExpirationTime)
        .orElse(
            ofNullable(this.humanExpirationTime)
                .orElse(DEFAULT_HUMAN_EXPECTATION_EXPIRATION_TIME)
        );
  }

  public long getManualExpirationTime() {
    return ofNullable(this.manualExpirationTime)
        .orElse(
            ofNullable(this.humanExpirationTime)
                .orElse(DEFAULT_HUMAN_EXPECTATION_EXPIRATION_TIME)
        );
  }

}
