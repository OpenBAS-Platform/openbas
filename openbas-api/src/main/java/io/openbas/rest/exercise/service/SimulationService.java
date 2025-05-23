package io.openbas.rest.exercise.service;

import io.openbas.database.model.Article;
import io.openbas.database.model.Document;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.rest.document.DocumentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Log
@Service
@RequiredArgsConstructor
@Transactional
public class SimulationService {
  private final DocumentService documentService;

  public List<Document> getExercisePlayerDocuments(Exercise exercise) {
    List<Article> articles = exercise.getArticles();
    List<Inject> injects = exercise.getInjects();
    return documentService.getPlayerDocuments(articles, injects);
  }
}
