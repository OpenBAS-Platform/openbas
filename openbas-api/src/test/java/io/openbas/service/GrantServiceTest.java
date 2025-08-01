package io.openbas.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import io.openbas.IntegrationTest;
import io.openbas.database.model.Grant;
import io.openbas.database.model.User;
import io.openbas.database.raw.RawGrant;
import io.openbas.database.repository.GrantRepository;
import io.openbas.utils.fixtures.UserFixture;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class GrantServiceTest extends IntegrationTest {

  private static final String USER_ID = "userid";
  private static final String RESOURCE_ID = "resourceid";

  @Mock private GrantRepository grantRepository;

  @InjectMocks private GrantService grantService;

  @Test
  public void test_hasReadGrant_WHEN_has_read_grant() {
    User user = UserFixture.getUser();
    user.setId(USER_ID);
    when(grantRepository.rawByResourceIdAndUserId(RESOURCE_ID, USER_ID))
        .thenReturn(List.of(getRawGant(USER_ID, Grant.GRANT_TYPE.OBSERVER)));

    assertTrue(grantService.hasReadGrant(RESOURCE_ID, user));
  }

  @Test
  public void test_hasReadGrant_WHEN_has_no_grant() {
    User user = UserFixture.getUser();
    user.setId(USER_ID);
    when(grantRepository.rawByResourceIdAndUserId(RESOURCE_ID, USER_ID)).thenReturn(List.of());

    assertFalse(grantService.hasReadGrant(RESOURCE_ID, user));
  }

  @Test
  public void test_hasLaunchGrant_WHEN_has_read_grant() {
    User user = UserFixture.getUser();
    user.setId(USER_ID);
    when(grantRepository.rawByResourceIdAndUserId(RESOURCE_ID, USER_ID))
        .thenReturn(List.of(getRawGant(USER_ID, Grant.GRANT_TYPE.OBSERVER)));

    assertFalse(grantService.hasLaunchGrant(RESOURCE_ID, user));
  }

  @Test
  public void test_hasWriteGrant_WHEN_has_read_grant() {
    User user = UserFixture.getUser();
    user.setId(USER_ID);
    when(grantRepository.rawByResourceIdAndUserId(RESOURCE_ID, USER_ID))
        .thenReturn(List.of(getRawGant(USER_ID, Grant.GRANT_TYPE.OBSERVER)));

    assertFalse(grantService.hasWriteGrant(RESOURCE_ID, user));
  }

  @Test
  public void test_hasLaunchGrant_WHEN_has_launch_grant() {
    User user = UserFixture.getUser();
    user.setId(USER_ID);
    when(grantRepository.rawByResourceIdAndUserId(RESOURCE_ID, USER_ID))
        .thenReturn(List.of(getRawGant(USER_ID, Grant.GRANT_TYPE.LAUNCHER)));

    assertTrue(grantService.hasLaunchGrant(RESOURCE_ID, user));
  }

  @Test
  public void test_hasWriteGrant_WHEN_has_write_grant() {
    User user = UserFixture.getUser();
    user.setId(USER_ID);
    when(grantRepository.rawByResourceIdAndUserId(RESOURCE_ID, USER_ID))
        .thenReturn(List.of(getRawGant(USER_ID, Grant.GRANT_TYPE.PLANNER)));

    assertTrue(grantService.hasWriteGrant(RESOURCE_ID, user));
  }

  private RawGrant getRawGant(final String userId, final Grant.GRANT_TYPE grantType) {
    return new RawGrant() {
      @Override
      public String getGrant_id() {
        return "grantId";
      }

      @Override
      public String getGrant_name() {
        return grantType.name();
      }

      @Override
      public String getUser_id() {
        return userId;
      }
    };
  }
}
