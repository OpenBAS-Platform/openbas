package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Group;
import io.openbas.database.repository.GroupRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class GroupComposer extends ComposerBase<Group> {

  @Autowired private GroupRepository groupRepository;

  public class Composer extends InnerComposerBase<Group> {

    private final Group group;

    private final List<RoleComposer.Composer> roleComposers = new ArrayList<>();
    private final List<GrantComposer.Composer> grantComposers = new ArrayList<>();

    public Composer(Group group) {
      this.group = group;
    }

    public GroupComposer.Composer withRole(RoleComposer.Composer roleComposer) {
      this.roleComposers.add(roleComposer);
      this.group.getRoles().add(roleComposer.get());
      return this;
    }

    public GroupComposer.Composer withGrant(GrantComposer.Composer grantComposer) {
      this.grantComposers.add(grantComposer);
      this.group.getGrants().add(grantComposer.get());
      return this;
    }

    @Override
    public GroupComposer.Composer persist() {
      roleComposers.forEach(RoleComposer.Composer::persist);
      groupRepository.save(this.group);
      return this;
    }

    @Override
    public GroupComposer.Composer delete() {
      groupRepository.delete(this.group);
      roleComposers.forEach(RoleComposer.Composer::delete);
      return this;
    }

    @Override
    public Group get() {
      return this.group;
    }
  }

  public GroupComposer.Composer forGroup(Group group) {
    generatedItems.add(group);
    return new GroupComposer.Composer(group);
  }
}
