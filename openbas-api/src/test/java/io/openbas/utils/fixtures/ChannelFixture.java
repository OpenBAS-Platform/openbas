package io.openbas.utils.fixtures;

import io.openbas.database.model.Channel;

public class ChannelFixture {
  public static final String CHANNEL_NAME = "Very respected publication";

  public static Channel getChannel() {
    Channel channel = new Channel();
    channel.setName(CHANNEL_NAME);
    channel.setType("Journal");
    channel.setDescription("This is a very respected publication and very serious");
    return channel;
  }
}
