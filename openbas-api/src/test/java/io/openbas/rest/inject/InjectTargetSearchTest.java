package io.openbas.rest.inject;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.model.Tag;
import io.openbas.utils.TargetType;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.AssetGroupComposer;
import io.openbas.utils.fixtures.composers.InjectComposer;
import io.openbas.utils.fixtures.composers.InjectorContractComposer;
import io.openbas.utils.fixtures.composers.PayloadComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.mockUser.WithMockObserverUser;
import io.openbas.utils.mockUser.WithMockUnprivilegedUser;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.EntityManager;
import net.javacrumbs.jsonunit.core.Option;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openbas.rest.inject.InjectApi.INJECT_URI;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
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
    @Autowired private EntityManager entityManager;

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
                                        payloadComposer.forPayload(PayloadFixture.createDefaultCommand())));
    }

    @Nested
    @DisplayName("With asset groups search")
    public class WithAssetGroupsSearch {
        private final TargetType targetType = TargetType.ASSETS_GROUPS;

        @Nested
        @WithMockAdminUser
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

        @Nested
        @WithMockAdminUser
        @DisplayName("With existing inject")
        public class WithExistingInject {
            private InjectComposer.Composer addAssetGroupWithName(InjectComposer.Composer injectWrapper, String assetGroupName) {
                injectWrapper.withAssetGroup(assetGroupComposer.forAssetGroup(AssetGroupFixture.createDefaultAssetGroup(assetGroupName)));
                return injectWrapper;
            }

            @Test
            @DisplayName("With no asset group targets, return no items in page")
            public void withNoAssetGroupTargets() throws Exception {
                Inject inject = getInjectWrapper().persist().get();
                entityManager.flush();
                entityManager.clear();

                SearchPaginationInput search = PaginationFixture.simpleFilter("target_name", "target asset group", Filters.FilterOperator.eq);
                String response = mvc.perform(post(INJECT_URI + "/" + inject.getId() + "/targets/" + targetType.name() + "/search")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(mapper.writeValueAsString(search)))
                    .andExpect(status().isOk())
                        .andReturn().getResponse().getContentAsString();

                assertThatJson(response)
                        .node("content")
                        .isEqualTo("[]");
            }

            @Test
            @DisplayName("With some asset group targets, return matching items in page")
            public void withSomeAssetGroupTargets() throws Exception {
                InjectComposer.Composer injectWrapper = getInjectWrapper();
                for(int i = 0; i < 20; i++) {
                    addAssetGroupWithName(injectWrapper, "asset group " + i);
                }
                Inject inject = injectWrapper.persist().get();
                entityManager.flush();
                entityManager.clear();

                SearchPaginationInput search = PaginationFixture.simpleFilter("target_name", "asset group", Filters.FilterOperator.contains);
                String response = mvc.perform(post(INJECT_URI + "/" + inject.getId() + "/targets/" + targetType.name() + "/search")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsString(search)))
                        .andExpect(status().isOk())
                        .andReturn().getResponse().getContentAsString();

                List<AssetGroupTarget> expected = inject.getAssetGroups().stream().limit(10).map(assetGroup -> new AssetGroupTarget(assetGroup.getId(), assetGroup.getName(), assetGroup.getTags().stream().map(Tag::getId).collect(Collectors.toSet()))).toList();

                assertThatJson(response)
                        .when(Option.IGNORING_ARRAY_ORDER)
                        .node("content")
                        .isEqualTo(mapper.writeValueAsString(expected));
            }
        }
    }
}
