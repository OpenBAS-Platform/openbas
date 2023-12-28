package io.openex.service;

import io.openex.database.model.Endpoint;
import io.openex.service.asset.EndpointService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.TransactionSystemException;

import java.util.List;
import java.util.NoSuchElementException;

import static io.openex.database.model.Endpoint.OS_TYPE.LINUX;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class EndpointServiceTest {

  @Autowired
  private EndpointService endpointService;

  static String ENDPOINT_ID;

  @DisplayName("Create endpoint")
  @Test
  @Order(1)
  void createEndpointTest() {
    // -- PREPARE --
    Endpoint endpoint = new Endpoint();
    String name = "Personal PC";
    endpoint.setName(name);
    endpoint.setIp("wrong ip");
    endpoint.setHostname("hostname");
    endpoint.setOs(LINUX);
    endpoint.setHostname("hostname");
    endpoint.setOs(LINUX);

    // -- EXECUTE --
    assertThrows(TransactionSystemException.class, () -> this.endpointService.createEndpoint(endpoint));

    // -- PREPARE --
    endpoint.setIp("127.0.0.1");

    // -- EXECUTE --
    Endpoint endpointCreated = this.endpointService.createEndpoint(endpoint);
    ENDPOINT_ID = endpointCreated.getId();
    assertNotNull(endpointCreated);
    assertNotNull(endpointCreated.getId());
    assertNotNull(endpointCreated.getCreatedAt());
    assertNotNull(endpointCreated.getUpdatedAt());
    assertEquals(name, endpointCreated.getName());
  }

  @DisplayName("Retrieve endpoint")
  @Test
  @Order(2)
  void retrieveEndpointTest() {
    Endpoint endpoint = this.endpointService.endpoint(ENDPOINT_ID);
    assertNotNull(endpoint);

    List<Endpoint> endpoints = this.endpointService.endpoints();
    assertNotNull(endpoints);
    assertEquals(ENDPOINT_ID, endpoints.get(0).getId());
  }

  @DisplayName("Update endpoint")
  @Test
  @Order(3)
  void updateEndpointTest() {
    // -- PREPARE --
    Endpoint endpoint = this.endpointService.endpoint(ENDPOINT_ID);
    String value = "Professional PC";
    endpoint.setName(value);

    // -- EXECUTE --
    Endpoint endpointUpdated = this.endpointService.updateEndpoint(endpoint);
    assertNotNull(endpoint);
    assertEquals(value, endpointUpdated.getName());
  }

  @DisplayName("Delete endpoint")
  @Test
  @Order(4)
  void deleteEndpointTest() {
    this.endpointService.deleteEndpoint(ENDPOINT_ID);
    assertThrows(NoSuchElementException.class, () -> this.endpointService.endpoint(ENDPOINT_ID));
  }

}
