package io.openbas.rest.document;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Article;
import io.openbas.database.model.Document;
import io.openbas.database.model.Inject;
import io.openbas.database.repository.*;
import io.openbas.injectors.challenge.model.ChallengeContent;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.service.FileService;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DocumentService {

  @Resource private ObjectMapper mapper;

  private final DocumentRepository documentRepository;
  private final ChallengeRepository challengeRepository;
  private final FileService fileService;

  // -- CRUD --

  public Document document(@NotBlank final String documentId) {
    return documentRepository
        .findById(documentId)
        .orElseThrow(() -> new ElementNotFoundException("Document not found"));
  }

  public List<Document> getPlayerDocuments(List<Article> articles, List<Inject> injects) {
    Stream<Document> channelsDocs =
        articles.stream().map(Article::getChannel).flatMap(channel -> channel.getLogos().stream());
    Stream<Document> articlesDocs =
        articles.stream().flatMap(article -> article.getDocuments().stream());
    List<String> challenges =
        injects.stream()
            .filter(
                inject ->
                    inject
                        .getInjectorContract()
                        .map(contract -> contract.getId().equals(CHALLENGE_PUBLISH))
                        .orElse(false))
            .filter(inject -> inject.getContent() != null)
            .flatMap(
                inject -> {
                  try {
                    ChallengeContent content =
                        mapper.treeToValue(inject.getContent(), ChallengeContent.class);
                    return content.getChallenges().stream();
                  } catch (JsonProcessingException e) {
                    return Stream.empty();
                  }
                })
            .toList();
    Stream<Document> challengesDocs =
        fromIterable(challengeRepository.findAllById(challenges)).stream()
            .flatMap(challenge -> challenge.getDocuments().stream());
    return Stream.of(channelsDocs, articlesDocs, challengesDocs)
        .flatMap(documentStream -> documentStream)
        .distinct()
        .toList();
  }

  public void deleteDocument(String documentId) {
    if (isDocumentInUse(documentId)) {
      throw new BadRequestException("Document is still in use and cannot be deleted.");
    }
    List<Document> documents = documentRepository.removeById(documentId);
    documents.forEach(
        document -> {
          try {
            fileService.deleteFile(document.getTarget());
          } catch (Exception e) {
            // Fail no longer available in the storage.
          }
        });
  }

  public boolean isDocumentInUse(String documentId) {
    // Check all FKs
    return documentRepository.isUsedInExercise(documentId)
        || documentRepository.isUsedInPayload(documentId)
        || documentRepository.isUsedInAsset(documentId)
        || documentRepository.isUsedInChannel(documentId)
        || documentRepository.isUsedInExerciseDocument(documentId)
        || documentRepository.isUsedInInjectDocument(documentId)
        || documentRepository.isUsedInArticleDocument(documentId)
        || documentRepository.isUsedInDocumentTag(documentId)
        || documentRepository.isUsedInScenarioDocument(documentId)
        || documentRepository.isUsedInChallengeDocument(documentId);
  }
}
