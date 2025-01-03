package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Organization;
import io.openbas.database.model.User;
import io.openbas.database.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserComposer {
    @Autowired
    UserRepository userRepository;

    public class Composer extends InnerComposerBase<User> {
        private final User user;
        private OrganizationComposer.Composer organizationComposer;

        public Composer(User user) {
            this.user = user;
        }

        public Composer withOrganization(OrganizationComposer.Composer organizationComposer) {
            this.organizationComposer = organizationComposer;
            this.user.setOrganization(organizationComposer.get());
            return this;
        }

        @Override
        public Composer persist() {
            organizationComposer.persist();
            userRepository.save(user);
            return this;
        }

        @Override
        public User get() {
            return this.user;
        }
    }

    public Composer withUser(User user) {
        return new Composer(user);
    }
}