package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Channel;
import io.openbas.database.repository.ChannelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ChannelComposer {
    @Autowired
    private ChannelRepository channelRepository;

    public class Composer {
        private Channel channel;

        public Composer(Channel channel) {
            this.channel = channel;
        }

        public Composer persist() {
            channelRepository.save(channel);
            return this;
        }

        public Channel get() {
            return channel;
        }
    }

    public Composer withChannel(Channel channel) {
        return new Composer(channel);
    }
}