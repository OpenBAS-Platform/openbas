package io.openbas.database.model;

import java.util.Set;

public class TeamTarget extends InjectTarget {
    public TeamTarget(String id, String name, Set<String> tags) {
        this.setId(id);
        this.setName(name);
        this.setTags(tags);
        this.setTargetType("TEAMS");
    }

    @Override
    protected String getTargetSubtype() {
        return this.getTargetType();
    }
}
