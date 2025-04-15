package io.openbas.rest.inject;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.utils.TargetType;
import io.openbas.utils.fixtures.AssetGroupFixture;
import io.openbas.utils.fixtures.InjectFixture;
import io.openbas.utils.fixtures.InjectorContractFixture;
import io.openbas.utils.fixtures.PayloadFixture;
import io.openbas.utils.fixtures.composers.AssetGroupComposer;
import io.openbas.utils.fixtures.composers.InjectComposer;
import io.openbas.utils.fixtures.composers.InjectorContractComposer;
import io.openbas.utils.fixtures.composers.PayloadComposer;
import io.openbas.utils.mockUser.WithMockObserverUser;
import io.openbas.utils.mockUser.WithMockUnprivilegedUser;
import io.openbas.utils.pagination.SearchPaginationInput;
import org.junit.jupiter.api.*;
import org.mockito.NotExtensible;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static io.openbas.rest.inject.InjectApi.INJECT_URI;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Transactional
@TestInstance(PER_CLASS)
@DisplayName("Searching inject targets tests")
public class InjectTargetSearchTest extends IntegrationTest {
    @Autowired private InjectComposer injectComposer;
    @Autowired private InjectorContractComposer injectContractComposer;
    @Autowired private PayloadComposer payloadComposer;
    @Autowired private AssetGroupComposer assetGroupComposer;
    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper mapper;

    @BeforeEach
    public void beforeEach() {
        injectComposer.reset();
        injectContractComposer.reset();
        payloadComposer.reset();
    }

    private InjectComposer.Composer getInjectWrapper() {
        return injectComposer.forInject(InjectFixture.getInjectWithoutContract())
                .withInjectorContract(
                        injectContractComposer.forInjectorContract(InjectorContractFixture.createDefaultInjectorContract())
                                .withPayload(
                                        payloadComposer.forPayload(PayloadFixture.createDefaultCommand())))
                .withAssetGroup(assetGroupComposer.forAssetGroup(AssetGroupFixture.createDefaultAssetGroup("target asset group")));
    }

    @Nested
    @WithMockObserverUser
    @DisplayName("With asset groups search")
    public class WithAssetGroupsSearch {
        private final TargetType targetType = TargetType.ASSETS_GROUPS;

        @Nested
        @DisplayName("When inject does not exist")
        public class WhenInjectDoesNotExist {
            @Test
            @DisplayName("Returns not found")
            public void returnNotFound() throws Exception {
                String id = UUID.randomUUID().toString();
                mvc.perform(
                        post(INJECT_URI + "/" + id + "/targets/" + targetType + "/search")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsString(new SearchPaginationInput())))
                        .andExpect(status().isNotFound());
            }
        }

        @Nested
        @WithMockUnprivilegedUser
        @DisplayName("Without authorisation")
        public class WhenInjectWithoutAuthorisation {
            @Test
            @DisplayName("Returns not found") // obfuscate lacking privs with NOT_FOUND
            public void returnNotFound() throws Exception {
                String id = UUID.randomUUID().toString();
                mvc.perform(
                        post(INJECT_URI + "/" + id + "/targets/" + targetType + "/search")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsString(new SearchPaginationInput())))
                .andExpect(status().isNotFound());
            }
        }
    }
}
