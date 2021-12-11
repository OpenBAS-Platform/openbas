package io.openex.player.service;

import io.openex.player.model.database.Token;
import io.openex.player.model.database.User;
import io.openex.player.repository.TokenRepository;
import io.openex.player.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

@Component
public class UserService {

    private UserRepository userRepository;
    private TokenRepository tokenRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setTokenRepository(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    public User createUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setLogin(email);
        user.setFirstname(email);
        user.setLastname(email);
        user.setStatus((short) 0);
        User savedUser = userRepository.save(user);
        // Create default token
        Token token = new Token();
        token.setUser(savedUser);
        token.setCreated(new Date());
        token.setValue(UUID.randomUUID().toString());
        tokenRepository.save(token);
        return user;
    }
}
