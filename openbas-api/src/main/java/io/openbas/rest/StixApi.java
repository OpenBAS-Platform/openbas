package io.openbas.rest;

import io.openbas.rest.helper.RestBehavior;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stix")
@RequiredArgsConstructor
public class StixApi extends RestBehavior {

  private final StixService stixService;

}
