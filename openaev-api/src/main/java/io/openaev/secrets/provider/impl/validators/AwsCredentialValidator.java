package io.openaev.secrets.provider.impl.validators;

import io.openaev.database.model.AwsAccessKeySecret;
import io.openaev.database.model.AwsAssumeRoleSecret;
import io.openaev.database.model.AwsAssumeRoleSecret.AWS_SOURCE_IDENTITY_TYPE;
import io.openaev.database.model.AwsRegion;
import io.openaev.database.model.Secret;
import io.openaev.service.connector_instances.NativeEncryptionService;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest;
import software.amazon.awssdk.services.sts.model.AssumeRoleResponse;
import software.amazon.awssdk.services.sts.model.Credentials;
import software.amazon.awssdk.services.sts.model.StsException;

/**
 * Performs a real, live call against the AWS Security Token Service to check whether a stored AWS
 * credential is currently usable. This is intentionally a lightweight, read-only, side-effect-free
 * call ({@code sts:GetCallerIdentity}), which every valid AWS principal is allowed to call
 * regardless of its attached policies.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AwsCredentialValidator {

  private static final Duration ASSUME_ROLE_SESSION_DURATION = Duration.ofMinutes(15);
  private static final String ASSUME_ROLE_SESSION_NAME = "openaev-credential-test";

  private final NativeEncryptionService nativeEncryptionService;

  /**
   * @return {@code true} if the credential can currently authenticate against AWS, {@code false}
   *     otherwise. Never throws: any AWS/network error is treated as "inactive".
   */
  public boolean isActive(Secret secret) {
    try {
      if (secret instanceof AwsAccessKeySecret awsAccessKeySecret) {
        return checkAccessKey(awsAccessKeySecret);
      }
      if (secret instanceof AwsAssumeRoleSecret awsAssumeRoleSecret) {
        return checkAssumeRole(awsAssumeRoleSecret);
      }
      throw new IllegalArgumentException(
          "Unsupported secret type for AWS verification: " + secret.getClass().getSimpleName());
    } catch (StsException | software.amazon.awssdk.core.exception.SdkClientException e) {
      log.info("AWS credential test failed: {}", e.getMessage());
      return false;
    }
  }

  private boolean checkAccessKey(AwsAccessKeySecret secret) {
    AwsBasicCredentials credentials = decryptBasicCredentials(secret);
    software.amazon.awssdk.auth.credentials.AwsCredentials awsCredentials =
        secret.getAwsSessionToken() != null
            ? AwsSessionCredentials.create(
                credentials.accessKeyId(),
                credentials.secretAccessKey(),
                nativeEncryptionService.decrypt(secret.getAwsSessionToken()))
            : credentials;
    try (StsClient stsClient = buildStsClient(secret.getAwsDefaultRegion(), awsCredentials)) {
      stsClient.getCallerIdentity();
      return true;
    }
  }

  private boolean checkAssumeRole(AwsAssumeRoleSecret secret) {
    if (secret.getAwsSourceIdentityType() != AWS_SOURCE_IDENTITY_TYPE.STATIC_ACCESS_KEY) {
      // INSTANCE_DEFAULT relies on the ambient instance/task role of the OpenAEV host itself,
      // which is not something this on-demand test can meaningfully validate from here.
      throw new IllegalArgumentException(
          "AWS assume-role credentials using INSTANCE_DEFAULT cannot be tested on demand");
    }

    AwsBasicCredentials sourceCredentials =
        AwsBasicCredentials.create(
            secret.getAwsSourceProfileAccessKeyId(),
            nativeEncryptionService.decrypt(secret.getAwsSourceProfileSecretAccessKey()));

    try (StsClient sourceClient = buildStsClient(secret.getAwsDefaultRegion(), sourceCredentials)) {
      AssumeRoleRequest.Builder assumeRoleRequest =
          AssumeRoleRequest.builder()
              .roleArn(secret.getAwsRoleArn())
              .roleSessionName(ASSUME_ROLE_SESSION_NAME)
              .durationSeconds((int) ASSUME_ROLE_SESSION_DURATION.toSeconds());
      if (secret.getAwsExternalId() != null) {
        assumeRoleRequest.externalId(nativeEncryptionService.decrypt(secret.getAwsExternalId()));
      }
      AssumeRoleResponse assumeRoleResponse = sourceClient.assumeRole(assumeRoleRequest.build());
      Credentials assumedCredentials = assumeRoleResponse.credentials();
      AwsSessionCredentials sessionCredentials =
          AwsSessionCredentials.create(
              assumedCredentials.accessKeyId(),
              assumedCredentials.secretAccessKey(),
              assumedCredentials.sessionToken());
      try (StsClient assumedClient =
          buildStsClient(secret.getAwsDefaultRegion(), sessionCredentials)) {
        assumedClient.getCallerIdentity();
        return true;
      }
    }
  }

  private AwsBasicCredentials decryptBasicCredentials(AwsAccessKeySecret secret) {
    return AwsBasicCredentials.create(
        secret.getAwsAccessKeyId(),
        nativeEncryptionService.decrypt(secret.getAwsSecretAccessKey()));
  }

  private StsClient buildStsClient(
      AwsRegion region, software.amazon.awssdk.auth.credentials.AwsCredentials credentials) {
    return StsClient.builder()
        .region(Region.of(region.code()))
        .credentialsProvider(StaticCredentialsProvider.create(credentials))
        .build();
  }
}
