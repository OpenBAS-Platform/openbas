package io.openbas.service;

import io.openbas.database.model.*;
import io.openbas.utils.CopyObjectListUtils;
import org.springframework.stereotype.Service;

@Service
public class TeamService {

    public Team copyContextualTeam(Team teamToCopy) {
        Team newTeam = new Team();
        newTeam.setName(teamToCopy.getName());
        newTeam.setDescription(teamToCopy.getDescription());
        newTeam.setTags(CopyObjectListUtils.copy(teamToCopy.getTags(), Tag.class));
        newTeam.setOrganization(teamToCopy.getOrganization());
        newTeam.setUsers(CopyObjectListUtils.copy(teamToCopy.getUsers(), User.class));
        newTeam.setContextual(teamToCopy.getContextual());
        return newTeam;
    }

}