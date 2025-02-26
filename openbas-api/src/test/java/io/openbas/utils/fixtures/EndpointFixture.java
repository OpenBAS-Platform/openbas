package io.openbas.utils.fixtures;

import io.openbas.database.model.Endpoint;
import io.openbas.rest.asset.endpoint.form.EndpointInput;
import io.openbas.rest.asset.endpoint.form.EndpointRegisterInput;
import io.openbas.utils.EndpointMapper;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;

public class EndpointFixture {

  public static final String[] IPS = {"192.168.1.1"};
  public static final String[] MAC_ADDRESSES = {"00:1B:44:11:3A:B7"};
  public static final Instant REFERENCE_TIME =
      Instant.now(Clock.fixed(Instant.parse("2024-12-17T10:30:45Z"), ZoneId.of("UTC")));
  public static final String WINDOWS_ASSET_NAME_INPUT = "Windows asset";

  public static EndpointInput createWindowsEndpointInput(List<String> tagIds) {
    EndpointInput input = new EndpointInput();
    input.setName(WINDOWS_ASSET_NAME_INPUT);
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

  public static EndpointRegisterInput createWindowsEndpointRegisterInput(
      List<String> tagIds, String externalReference) {
    EndpointRegisterInput input = new EndpointRegisterInput();
    input.setName(WINDOWS_ASSET_NAME_INPUT);
    input.setDescription("Description of Windows asset");
    input.setTagIds(tagIds);
    input.setIps(IPS);
    input.setHostname("Windows Hostname");
    input.setAgentVersion("1.8.2");
    input.setMacAddresses(MAC_ADDRESSES);
    input.setPlatform(Endpoint.PLATFORM_TYPE.Windows);
    input.setArch(Endpoint.PLATFORM_ARCH.x86_64);
    input.setLastSeen(REFERENCE_TIME);
    input.setExternalReference(externalReference);
    return input;
  }

  public static Endpoint createEndpoint() {
    Endpoint endpoint = new Endpoint();
    endpoint.setCreatedAt(Instant.now());
    endpoint.setUpdatedAt(Instant.now());
    endpoint.setName("Endpoint test");
    endpoint.setDescription("Endpoint description");
    endpoint.setHostname("Windows Hostname");
    endpoint.setIps(EndpointMapper.setIps(IPS));
    endpoint.setPlatform(Endpoint.PLATFORM_TYPE.Windows);
    endpoint.setArch(Endpoint.PLATFORM_ARCH.x86_64);
    return endpoint;
  }
}
