package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import io.openbas.database.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class TeamComposer {
    @Autowired
    private TeamRepository teamRepository;

    public class Composer extends InnerComposerBase<Team> {
        private final Team team;
        private final List<UserComposer.Composer> userComposers = new ArrayList<>();

        public Composer(Team team) {
            this.team = team;
        }

        public Composer withUser(UserComposer.Composer userComposer) {
            userComposers.add(userComposer);
            List<User> tempUsers = this.team.getUsers();
            tempUsers.add(userComposer.get());
            this.team.setUsers(tempUsers);
            return this;
        }

        @Override
        public Composer persist() {
            userComposers.forEach(UserComposer.Composer::persist);
            teamRepository.save(team);
            return this;
        }

        @Override
        public Team get() {
            return this.team;
        }
    }

    public Composer withTeam(Team team) {
        return new Composer(team);
    }
}
