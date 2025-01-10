package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Channel;
import io.openbas.database.repository.ChannelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ChannelComposer extends ComposerBase<Channel> {
  @Autowired private ChannelRepository channelRepository;

  public class Composer extends InnerComposerBase<Channel> {
    private final Channel channel;

    public Composer(Channel channel) {
      this.channel = channel;
    }

    @Override
    public Composer persist() {
      channelRepository.save(channel);
      return this;
    }

    @Override
    public Channel get() {
      return channel;
    }
  }

  public Composer forChannel(Channel channel) {
    generatedItems.add(channel);
    return new Composer(channel);
  }
}
