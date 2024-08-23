package io.openbas.service;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.inject.service.InjectDuplicateService;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

@SpringBootTest
public class ScenarioServiceTest {

    @Autowired
    ScenarioRepository scenarioRepository;
    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private ScenarioTeamUserRepository scenarioTeamUserRepository;
    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    InjectRepository injectRepository;

    @Mock
    GrantService grantService;
    @Mock
    VariableService variableService;
    @Mock
    ChallengeService challengeService;
    @Autowired
    private TeamService teamService;
    @Mock
    FileService fileService;
    @Autowired
    private InjectDuplicateService injectDuplicateService;


    @InjectMocks
    private ScenarioService scenarioService;

    @BeforeEach
    void setUp() {
        scenarioService = new ScenarioService(scenarioRepository, teamRepository, userRepository, documentRepository,
                scenarioTeamUserRepository, articleRepository, grantService, variableService, challengeService,
                teamService, fileService, injectDuplicateService
        );
    }

    @DisplayName("Should create new contextual teams during scenario duplication")
    @Test
    @Transactional(rollbackOn = Exception.class)
    void createNewContextualTeamsDuringScenarioDuplication(){
        // -- PREPARE --
        List<Team> scenarioTeams = new ArrayList<>();;
        Team contextualTeam = createTeam("fakeTeamName1", true);
        scenarioTeams.add(contextualTeam);
        Team noContextualTeam = createTeam("fakeTeamName2",false);
        scenarioTeams.add(noContextualTeam);

        Scenario scenario = createScenario(scenarioTeams);

        // -- EXECUTE --
        Scenario scenarioDuplicated = scenarioService.getDuplicateScenario(scenario.getId());

        // -- ASSERT --
        assertNotEquals(scenario.getId(), scenarioDuplicated.getId());
        assertEquals(scenario.getFrom(), scenarioDuplicated.getFrom());
        assertEquals(2, scenarioDuplicated.getTeams().size());
        scenarioDuplicated.getTeams().forEach(team -> {
            if (team.getContextual()){
                assertNotEquals(contextualTeam.getId(), team.getId());
                assertEquals(contextualTeam.getName(), team.getName());
            } else {
                assertEquals(noContextualTeam.getId(), team.getId());
            }
        });
        assertEquals(1, scenarioDuplicated.getInjects().size());
        assertEquals(2, scenario.getInjects().get(0).getTeams().size());
        scenarioDuplicated.getInjects().get(0).getTeams().forEach(injectTeam -> {
            if (injectTeam.getContextual()){
                assertNotEquals(contextualTeam.getId(), injectTeam.getId());
                assertEquals(
                        scenarioDuplicated.getTeams().stream().filter(team -> team.getContextual().equals(true)).findFirst().orElse(new Team()).getId(),
                        injectTeam.getId()
                );
            } else {
                assertEquals(noContextualTeam.getId(), injectTeam.getId());
            }
        });
    }

    private Team createTeam(@NotBlank String name, Boolean isContextualTeam){
        Team team = new Team();
        team.setName(name);
        team.setContextual(isContextualTeam);
        return this.teamRepository.save(team);
    }

    private Scenario createScenario(List<Team> scenarioTeams){
        Scenario scenario = new Scenario();
        scenario.setName("Scenario name");
        scenario.setFrom("test@mail.fr");
        scenario.setTeams(scenarioTeams);
        Inject inject = new Inject();
        inject.setTeams(scenarioTeams);
        Set<Inject> injects = new HashSet<>();
        injects.add(this.injectRepository.save(inject));
        scenario.setInjects(injects);
        return this.scenarioRepository.save(scenario);
    }
}
