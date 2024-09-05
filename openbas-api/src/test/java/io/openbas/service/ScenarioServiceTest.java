package io.openbas.service;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.inject.service.InjectDuplicateService;
import io.openbas.utils.fixtures.ScenarioFixture;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static io.openbas.utils.fixtures.TeamFixture.getTeam;
import static io.openbas.utils.fixtures.ScenarioFixture.getScenario;

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
        Team contextualTeam = this.teamRepository.save(getTeam(null, "fakeTeamName1", true));
        scenarioTeams.add(contextualTeam);
        Team noContextualTeam = this.teamRepository.save(getTeam(null, "fakeTeamName2",false));
        scenarioTeams.add(noContextualTeam);

        Inject inject = new Inject();
        inject.setTeams(scenarioTeams);
        Set<Inject> scenarioInjects = new HashSet<>();
        scenarioInjects.add(this.injectRepository.save(inject));
        Scenario scenario = this.scenarioRepository.save(ScenarioFixture.getScenario(scenarioTeams, scenarioInjects));

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
}
