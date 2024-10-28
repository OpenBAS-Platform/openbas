package io.openbas.utils.fixtures;

import io.openbas.database.model.Tag;

public class TagFixture {

  public static final String TAG_NAME = "tag";

  public static Tag getTag() {
    Tag tag = new Tag();
    tag.setName(TAG_NAME);
    tag.setColor("#FFFFFF");
    return tag;
  }
}
