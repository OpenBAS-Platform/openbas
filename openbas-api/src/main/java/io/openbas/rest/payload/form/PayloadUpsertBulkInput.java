package io.openbas.rest.payload.form;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class PayloadUpsertBulkInput {

  List<PayloadUpsertInput> payloads;

}
