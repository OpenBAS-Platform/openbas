package io.openbas.service;

import io.openbas.database.model.*;
import io.openbas.database.repository.AgentRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AgentService {

  @PersistenceContext private EntityManager entityManager;

  private final AgentRepository agentRepository;

  public Optional<Agent> getAgentForAnAsset(
      String assetId,
      String user,
      Agent.DEPLOYMENT_MODE deploymentMode,
      Agent.PRIVILEGE privilege,
      String executor) {
    return agentRepository.findByAssetExecutorUserDeploymentAndPrivilege(
        assetId, user, deploymentMode.name(), privilege.name(), executor);
  }

  public List<Agent> getAgentsForExecution() {
    return agentRepository.findForExecution();
  }

  public Agent createOrUpdateAgent(@NotNull final Agent agent) {
    return this.agentRepository.save(agent);
  }

  public void deleteAgent(@NotBlank final String agentId) {
    this.agentRepository.deleteByAgentId(agentId);
  }

  public List<Agent> findByExternalReference(String externalReference) {
    return agentRepository.findByExternalReference(externalReference);
  }

  public Tuple getAgentMetrics(List<Executor> agentExecutors) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    CriteriaQuery<Tuple> cq = cb.createQuery(Tuple.class);

    Root<Agent> root = cq.from(Agent.class);
    List<Selection<?>> selections = new ArrayList<>();

    selections.add(
        cb.count(cb.selectCase().when(cb.isNull(root.get("parent")), 1)).alias("total_agents"));
    selections.add(
        cb.count(
                cb.selectCase()
                    .when(
                        cb.and(
                            cb.isNull(root.get("parent")),
                            cb.equal(root.get("deploymentMode"), "session")),
                        1))
            .alias("session_agents"));
    selections.add(
        cb.count(
                cb.selectCase()
                    .when(
                        cb.and(
                            cb.isNull(root.get("parent")),
                            cb.equal(root.get("deploymentMode"), "service")),
                        1))
            .alias("service_agents"));
    selections.add(
        cb.count(
                cb.selectCase()
                    .when(
                        cb.and(
                            cb.isNull(root.get("parent")),
                            cb.equal(root.get("privilege"), "standard")),
                        1))
            .alias("user_agents"));
    selections.add(
        cb.count(
                cb.selectCase()
                    .when(
                        cb.and(
                            cb.isNull(root.get("parent")),
                            cb.equal(root.get("privilege"), "admin")),
                        1))
            .alias("admin_agents"));

    // Dynamically add COUNT for each Executor
    for (Executor executor : agentExecutors) {
      Predicate executorPredicate =
          cb.and(cb.isNull(root.get("parent")), cb.equal(root.get("executor"), executor));

      Selection<Long> executorCount =
          cb.count(cb.selectCase().when(executorPredicate, 1)).alias("agent_" + executor.getType());
      selections.add(executorCount);
    }

    cq.multiselect(selections);

    // Execute the query
    TypedQuery<Tuple> query = entityManager.createQuery(cq);
    return query.getSingleResult();
  }
}
