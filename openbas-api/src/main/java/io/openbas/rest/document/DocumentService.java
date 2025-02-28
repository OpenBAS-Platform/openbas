package io.openbas.rest.document;

import io.openbas.database.model.Document;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DocumentService {

  private final DocumentRepository documentRepository;

  // -- CRUD --

  public Document document(@NotBlank final String documentId) {
    return documentRepository
        .findById(documentId)
        .orElseThrow(() -> new ElementNotFoundException("Document not found"));
  }
}
