package io.openbas.utils.fixtures;

import io.openbas.database.model.Endpoint;
import io.openbas.rest.asset.endpoint.form.EndpointInput;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;

public class EndpointFixture {

  public static final String[] IPS = {"192.168.1.1"};
  public static final String[] MAC_ADDRESSES = {"00:1B:44:11:3A:B7"};
  public static final Instant REFERENCE_TIME =
      Instant.now(Clock.fixed(Instant.parse("2024-12-17T10:30:45Z"), ZoneId.of("UTC")));

  public static EndpointInput createWindowsEndpointInput(List<String> tagIds) {
    EndpointInput input = new EndpointInput();
    input.setName("Windows asset");
    input.setDescription("Description of Windows asset");
    input.setTagIds(tagIds);
    input.setIps(IPS);
    input.setHostname("Windows Hostname");
    input.setAgentVersion("1.8.2");
    input.setMacAddresses(MAC_ADDRESSES);
    input.setPlatform(Endpoint.PLATFORM_TYPE.Windows);
    input.setArch(Endpoint.PLATFORM_ARCH.x86_64);
    input.setLastSeen(REFERENCE_TIME);
    return input;
  }
}
