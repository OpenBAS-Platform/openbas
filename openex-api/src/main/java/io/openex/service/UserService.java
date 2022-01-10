package io.openex.service;

import io.openex.config.OpenExConfig;
import io.openex.database.model.Group;
import io.openex.database.model.Token;
import io.openex.database.model.User;
import io.openex.database.repository.*;
import io.openex.database.specification.GroupSpecification;
import io.openex.rest.user.form.user.CreateUserInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.annotation.Nullable;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

import static io.openex.helper.DatabaseHelper.updateRelation;
import static io.openex.rest.helper.RestBehavior.fromIterable;
import static java.time.Instant.now;

@Component
public class UserService {

    private final Argon2PasswordEncoder passwordEncoder = new Argon2PasswordEncoder();
    private UserRepository userRepository;
    private TokenRepository tokenRepository;
    private TagRepository tagRepository;
    private GroupRepository groupRepository;
    private OrganizationRepository organizationRepository;
    private OpenExConfig openExConfig;

    @Autowired
    public void setOrganizationRepository(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Autowired
    public void setGroupRepository(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    @Autowired
    public void setOpenExConfig(OpenExConfig openExConfig) {
        this.openExConfig = openExConfig;
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setTokenRepository(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    // region cookies
    private ResponseCookie buildCookie(String value, @Nullable String duration) {
        return ResponseCookie
                .from(openExConfig.getCookieName(), value)
                .secure(openExConfig.isCookieSecure())
                .path("/")
                .maxAge(duration != null ? Duration.parse(duration).getSeconds() : 0)
                .httpOnly(true).sameSite(null).build();
    }

    public String buildLoginCookie(String value) {
        return buildCookie(value, openExConfig.getCookieDuration()).toString();
    }

    public String buildLogoutCookie() {
        return buildCookie("logout", null).toString();
    }
    // endregion

    // region users
    public boolean isUserPasswordValid(User user, String password) {
        return passwordEncoder.matches(password, user.getPassword());
    }

    public String encodeUserPassword(String password) {
        return passwordEncoder.encode(password);
    }

    public void createUserToken(User user) {
        Token token = new Token();
        token.setUser(user);
        token.setCreated(now());
        token.setValue(UUID.randomUUID().toString());
        tokenRepository.save(token);
    }

    public User createUser(CreateUserInput input, int status) {
        User user = new User();
        user.setUpdateAttributes(input);
        user.setStatus((short) status);
        if (StringUtils.hasLength(input.getPassword())) {
            user.setPassword(encodeUserPassword(input.getPassword()));
        }
        user.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        user.setOrganization(updateRelation(input.getOrganizationId(), user.getOrganization(), organizationRepository));
        // Find automatic groups to assign
        List<Group> assignableGroups = groupRepository.findAll(GroupSpecification.defaultUserAssignable());
        user.setGroups(assignableGroups);
        // Save the user
        User savedUser = userRepository.save(user);
        createUserToken(savedUser);
        return savedUser;
    }
    // endregion
}
