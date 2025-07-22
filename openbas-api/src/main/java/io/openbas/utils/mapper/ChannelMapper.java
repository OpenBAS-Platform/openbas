package io.openbas.utils.mapper;

import io.openbas.database.model.Channel;
import io.openbas.rest.document.form.RelatedEntityOutput;
import java.util.Set;
import java.util.stream.Collectors;

public class ChannelMapper {

  public static Set<RelatedEntityOutput> toRelatedEntityOutputs(Set<Channel> channels) {
    return channels.stream()
        .map(channel -> toRelatedEntityOutput(channel))
        .collect(Collectors.toSet());
  }

  private static RelatedEntityOutput toRelatedEntityOutput(Channel channel) {
    return RelatedEntityOutput.builder().id(channel.getId()).name(channel.getName()).build();
  }
}
