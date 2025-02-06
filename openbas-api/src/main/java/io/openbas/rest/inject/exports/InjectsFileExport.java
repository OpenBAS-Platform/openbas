package io.openbas.rest.inject.exports;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.export.FileExportBase;
import io.openbas.service.ChallengeService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import lombok.Getter;

@JsonInclude(NON_NULL)
public class InjectsFileExport extends FileExportBase {
  @JsonProperty("export_version")
  private int version = 1;

  @JsonProperty("inject_information")
  @Getter
  private List<Inject> injects;

  @JsonProperty("inject_documents")
  private List<Document> getDocuments() {
    return injects.stream()
        .flatMap(inject -> inject.getDocuments().stream().map(InjectDocument::getDocument))
        .toList();
  }

  @JsonProperty("inject_tags")
  private List<Tag> getTags() {
    List<Tag> allTags = new ArrayList<>();
    allTags.addAll(this.getTeams().stream().flatMap(team -> team.getTags().stream()).toList());
    allTags.addAll(this.getUsers().stream().flatMap(user -> user.getTags().stream()).toList());
    allTags.addAll(
        this.getOrganizations().stream()
            .flatMap(organization -> organization.getTags().stream())
            .toList());
    allTags.addAll(this.getDocuments().stream().flatMap(doc -> doc.getTags().stream()).toList());
    allTags.addAll(
        this.getChallenges().stream().flatMap(challenge -> challenge.getTags().stream()).toList());
    this.injects.forEach(
        inject -> {
          allTags.addAll(inject.getTags());
          inject
              .getInjectorContract()
              .ifPresent(
                  injectorContract -> {
                    if (injectorContract.getPayload() != null) {
                      allTags.addAll(injectorContract.getPayload().getTags());
                    }
                  });
        });

    return allTags;
  }

  @JsonProperty("inject_articles")
  private List<Article> getArticles() {
    return injects.stream()
        .flatMap(
            inject ->
                inject.getExercise() != null
                    ? inject.getExercise().getArticles().stream()
                    : inject.getScenario() != null
                        ? inject.getScenario().getArticles().stream()
                        : Stream.of())
        .toList();
  }

  @JsonProperty("inject_channels")
  private List<Channel> getChannels() {
    return this.getArticles().stream().map(Article::getChannel).toList();
  }

  @JsonProperty("inject_teams")
  private List<Team> getTeams() {
    return injects.stream().flatMap(inject -> inject.getTeams().stream()).toList();
  }

  @JsonProperty("inject_users")
  private List<User> getUsers() {
    return this.getTeams().stream().flatMap(team -> team.getUsers().stream()).toList();
  }

  @JsonProperty("inject_organizations")
  private List<Organization> getOrganizations() {
    return this.getUsers().stream().map(User::getOrganization).toList();
  }

  @JsonProperty("inject_challenges")
  private List<Challenge> getChallenges() {
    return injects.stream()
        .flatMap(
            inject ->
                inject.getExercise() != null
                    ? StreamSupport.stream(
                        this.challengeService
                            .getExerciseChallenges(inject.getExercise().getId())
                            .spliterator(),
                        false)
                    : inject.getScenario() != null
                        ? StreamSupport.stream(
                            this.challengeService
                                .getScenarioChallenges(inject.getScenario())
                                .spliterator(),
                            false)
                        : Stream.of())
        .toList();
  }

  private InjectsFileExport(
      List<Inject> injects, ObjectMapper objectMapper, ChallengeService challengeService) {
    super(objectMapper, challengeService);
    this.injects = injects;
  }

  public static InjectsFileExport fromInjects(
      List<Inject> injects, ObjectMapper objectMapper, ChallengeService challengeService) {
    return new InjectsFileExport(injects, objectMapper, challengeService);
  }

  @Override
  public InjectsFileExport withOptions(int exportOptionsMask) {
      return (InjectsFileExport) super.withOptions(exportOptionsMask);
  }
}
