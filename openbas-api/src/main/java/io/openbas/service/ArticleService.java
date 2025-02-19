package io.openbas.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Article;
import io.openbas.database.model.Inject;
import io.openbas.database.repository.ArticleRepository;
import java.io.IOException;
import java.util.List;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ArticleService {

  private final ArticleRepository articleRepository;
  private final ObjectMapper objectMapper;

  public List<Article> getInjectsArticles(List<Inject> injects) {
    return injects.stream()
        .flatMap(
            inject -> {
              if (!inject.getContent().has("articles")) {
                return Stream.of();
              }

              try {
                List<String> articleIds =
                    objectMapper.readValue(
                        inject.getContent().get("articles").traverse(),
                        new TypeReference<List<String>>() {});
                return StreamSupport.stream(
                    articleRepository.findAllById(articleIds).spliterator(), false);
              } catch (IOException e) {
                throw new RuntimeException(e);
              }
            })
        .toList();
  }
}
