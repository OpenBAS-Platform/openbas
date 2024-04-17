package io.openbas.rest.atomic_testing;


import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectDocument;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.repository.*;
import io.openbas.injectExpectation.InjectExpectationService;
import io.openbas.rest.atomic_testing.form.*;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.InjectInput;
import io.openbas.service.AtomicTestingService;
import io.openbas.service.InjectService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import static io.openbas.config.SessionHelper.currentUser;

import java.util.List;

import static io.openbas.helper.DatabaseHelper.resolveOptionalRelation;
import static io.openbas.helper.StreamHelper.fromIterable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/atomic_testings")
public class AtomicTestingApi extends RestBehavior {

  private UserRepository userRepository;
  private InjectService injectService;
  private AtomicTestingService atomicTestingService;
  private InjectExpectationService injectExpectationService;
  private TeamRepository teamRepository;
  private TagRepository tagRepository;
  private DocumentRepository documentRepository;
  private InjectRepository injectRepository;

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Autowired
  public void setInjectService(InjectService injectService) {
    this.injectService = injectService;
  }

  @Autowired
  public void setAtomicTestingService(AtomicTestingService atomicTestingService) {
    this.atomicTestingService = atomicTestingService;
  }

  @Autowired
  public void setInjectExpectationService(InjectExpectationService injectExpectationService) {
    this.injectExpectationService = injectExpectationService;
  }

  @Autowired
  public void setDocumentRepository(DocumentRepository documentRepository) {
    this.documentRepository = documentRepository;
  }

  @Autowired
  public void setTagRepository(TagRepository tagRepository) {
    this.tagRepository = tagRepository;
  }

  @Autowired
  public void setTeamRepository(TeamRepository teamRepository) {
    this.teamRepository = teamRepository;
  }

  @Autowired
  public void setInjectRepository(InjectRepository injectRepository) {
    this.injectRepository = injectRepository;
  }

  @GetMapping()
  public List<AtomicTestingOutput> findAllAtomicTestings() {
    return AtomicTestingMapper.toDto(atomicTestingService.findAllAtomicTestings());
  }

  @GetMapping("/{injectId}")
  public AtomicTestingOutput findAtomicTesting(@PathVariable String injectId) {
    return injectService.findById(injectId).map(AtomicTestingMapper::toDto).orElseThrow();
  }

  @PutMapping("/{injectId}")
  public AtomicTestingOutput updateAtomicTesting(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingSimpleInput input) {
    return null; //todo
  }

  @DeleteMapping("/{injectId}")
  public void deleteAtomicTesting(
      @PathVariable @NotBlank final String injectId) {
    atomicTestingService.deleteAtomicTesting(injectId);
  }

  @GetMapping("/try/{injectId}")
  public InjectStatus tryAtomicTesting(@PathVariable String injectId) {
    return atomicTestingService.tryAtomicTesting(injectId);
  }

  @GetMapping("/target_results/{targetId}")
  public List<SimpleExpectationResultOutput> findTargetResult(@PathVariable String targetId,
      @RequestParam String injectId, @RequestParam String targetType) {
    return AtomicTestingMapper.toTargetResultDto(
        injectExpectationService.findExpectationsByInjectAndTarget(injectId, targetId, targetType), targetId);
  }


  @PostMapping()
  public Inject addAtomicTesting(@Valid @RequestBody AtomicTestingInput input) {
    // Get common attributes
    Inject inject = input.toInject();
    inject.setUser(userRepository.findById(currentUser().getId()).orElseThrow());
    inject.setExercise(null);
    // Set dependencies
    inject.setDependsOn(null);
    inject.setTeams(fromIterable(teamRepository.findAllById(input.getTeams())));
    inject.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    List<InjectDocument> injectDocuments = input.getDocuments().stream()
        .map(i -> {
          InjectDocument injectDocument = new InjectDocument();
          injectDocument.setInject(inject);
          injectDocument.setDocument(documentRepository.findById(i.getDocumentId()).orElseThrow());
          injectDocument.setAttached(i.isAttached());
          return injectDocument;
        }).toList();
    inject.setDocuments(injectDocuments);
    return injectRepository.save(inject);
  }

}
