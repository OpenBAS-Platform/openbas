package io.openbas.service;

import static io.openbas.database.model.Grant.GRANT_TYPE.LAUNCHER;
import static io.openbas.database.model.Grant.GRANT_TYPE.OBSERVER;
import static io.openbas.database.model.Grant.GRANT_TYPE.PLANNER;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import io.openbas.IntegrationTest;
import io.openbas.database.model.User;
import io.openbas.database.repository.GrantRepository;
import io.openbas.utils.fixtures.UserFixture;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class GrantServiceTest extends IntegrationTest {

  private static final String USER_ID = "userid";
  private static final String RESOURCE_ID = "resourceid";

  @Mock private GrantRepository grantRepository;

  @InjectMocks private GrantService grantService;

  @Test
  public void test_hasReadGrant_WHEN_has_read_grant() {
    User user = UserFixture.getUser();
    user.setId(USER_ID);

    when(grantRepository.existsByUserIdAndResourceIdAndNameIn(
            RESOURCE_ID, USER_ID, OBSERVER.andHigher()))
        .thenReturn(true);

    assertTrue(grantService.hasReadGrant(RESOURCE_ID, user));
  }

  @Test
  public void test_hasReadGrant_WHEN_has_no_grant() {
    User user = UserFixture.getUser();
    user.setId(USER_ID);
    when(grantRepository.existsByUserIdAndResourceIdAndNameIn(
            RESOURCE_ID, USER_ID, OBSERVER.andHigher()))
        .thenReturn(false);

    assertFalse(grantService.hasReadGrant(RESOURCE_ID, user));
  }

  @Test
  public void test_hasLaunchGrant_WHEN_has_read_grant() {
    User user = UserFixture.getUser();
    user.setId(USER_ID);
    when(grantRepository.existsByUserIdAndResourceIdAndNameIn(
            RESOURCE_ID, USER_ID, LAUNCHER.andHigher()))
        .thenReturn(false);

    assertFalse(grantService.hasLaunchGrant(RESOURCE_ID, user));
  }

  @Test
  public void test_hasWriteGrant_WHEN_has_read_grant() {
    User user = UserFixture.getUser();
    user.setId(USER_ID);
    when(grantRepository.existsByUserIdAndResourceIdAndNameIn(
            RESOURCE_ID, USER_ID, PLANNER.andHigher()))
        .thenReturn(false);

    assertFalse(grantService.hasWriteGrant(RESOURCE_ID, user));
  }

  @Test
  public void test_hasLaunchGrant_WHEN_has_launch_grant() {
    User user = UserFixture.getUser();
    user.setId(USER_ID);
    when(grantRepository.existsByUserIdAndResourceIdAndNameIn(
            RESOURCE_ID, USER_ID, LAUNCHER.andHigher()))
        .thenReturn(true);

    assertTrue(grantService.hasLaunchGrant(RESOURCE_ID, user));
  }

  @Test
  public void test_hasWriteGrant_WHEN_has_write_grant() {
    User user = UserFixture.getUser();
    user.setId(USER_ID);
    when(grantRepository.existsByUserIdAndResourceIdAndNameIn(
            RESOURCE_ID, USER_ID, PLANNER.andHigher()))
        .thenReturn(true);

    assertTrue(grantService.hasWriteGrant(RESOURCE_ID, user));
  }
}
