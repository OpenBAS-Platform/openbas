package io.openex.service;

import io.openex.config.SessionHelper;
import io.openex.contract.Contract;
import io.openex.contract.ContractConfig;
import io.openex.contract.Contractor;
import io.openex.contract.fields.ContractElement;
import io.openex.database.model.Inject;
import io.openex.helper.SupportedLanguage;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class ContractService {

    private static final Logger LOGGER = Logger.getLogger(ContractService.class.getName());
    private SupportedLanguage supportedLanguage;

    @Getter
    private final Map<String, Contract> contracts = new HashMap<>();
    private List<Contractor> baseContracts;

    @Autowired
    public void setBaseContracts(List<Contractor> baseContracts) {
        this.baseContracts = baseContracts;
    }

    // Build the contracts every minute
    @Scheduled(fixedDelay = 60000, initialDelay = 0)
    public void buildContracts() {
        this.baseContracts.stream().parallel().forEach(helper -> {
            try {
                Map<String, Contract> contractInstances = helper.contracts()
                        .stream()
                        .filter(Objects::nonNull)
                        .distinct()
                        .collect(Collectors.toMap(Contract::getId, Function.identity()));
                this.contracts.putAll(contractInstances);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, e.getMessage(), e);
            }
        });
    }

    public Contract contract(@NotNull final String contractId) {
        return this.contracts.get(contractId);
    }

    public List<ContractConfig> getContractConfigs() {
        return this.contracts.values()
                .stream()
                .map(Contract::getConfig)
                .distinct()
                .toList();
    }

    public String getContractType(@NotNull final String contractId) {
        Contract contractInstance = this.contracts.get(contractId);
        return contractInstance != null ? contractInstance.getConfig().getType() : null;
    }

    public Contract resolveContract(Inject inject) {
        return this.contracts.get(inject.getContract());
    }


    /**
     * Retrieves a paginated list of contracts.
     *
     * @param pageable the pagination information
     * @return a {@link Page} containing the contracts for the requested page
     */
    public Page<Contract> searchContracts(String type,
                                          boolean exposedContractsOnly,
                                          String textSearch,
                                          Pageable pageable) {

        supportedLanguage = SupportedLanguage.valueOf(SessionHelper.currentUser().getLang());

        List<Contract> exposedContracts = searchContracts(type, exposedContractsOnly, textSearch, pageable.getSort());

        int currentPage = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();
        int totalContracts = exposedContracts.size();
        int startItem = currentPage * pageSize;

        if (startItem >= totalContracts) {
            return new PageImpl<>(Collections.emptyList(), pageable, totalContracts);
        }

        int toIndex = Math.min(startItem + pageSize, totalContracts);
        List<Contract> paginatedContracts = exposedContracts.subList(startItem, toIndex);
        return new PageImpl<>(paginatedContracts, pageable, totalContracts);
    }

    /**
     * Searches for contracts based on specified criteria.
     *
     * @param type                 The type of contract to search for. Can be {@code null}.
     * @param exposedContractsOnly Whether to include only contracts that are exposed.
     * @param textSearch           The text to search for within contracts. Can be {@code null}.
     * @return A list of contracts matching the search criteria.
     */
    private List<Contract> searchContracts(String type, boolean exposedContractsOnly, String textSearch, Sort sort) {
        return getContracts().values().stream()
                .filter(contract -> (!exposedContractsOnly || contract.getConfig().isExpose())
                        && Optional.ofNullable(type).map(t -> contractContainsType(contract, t)).orElse(true)
                        && Optional.ofNullable(textSearch).map(ts -> contractContainsText(contract, ts)).orElse(true))
                .sorted(Comparator.comparing(c -> c.getConfig().getLabel().get(supportedLanguage)))
                .toList();
    }

    /**
     * Checks if the specified type is contained within the given Contract.
     *
     * @param contract The Contract object to search within.
     * @param type     The type to check for within the Contract.
     * @return {@code true} if the type is found within the Contract, {@code false} otherwise.
     */
    private boolean contractContainsType(Contract contract, String type) {
        return contract.getConfig().getLabel().get(supportedLanguage).equals(type);
    }

    /**
     * Checks if the given contract contains the specified text.
     *
     * @param contract The contract to search within.
     * @param text     The text to search for.
     * @return {@code true} if the contract contains the text, {@code false} otherwise.
     */
    private boolean contractContainsText(Contract contract, String text) {
        return containsTextInLabel(contract.getLabel().get(supportedLanguage), text) ||
                containsTextInLabel(contract.getConfig().getLabel().get(supportedLanguage), text) ||
                containsTextInFields(contract.getFields(), text);
    }

    /**
     * Checks if the given label contains the specified text.
     *
     * @param label The label to search within.
     * @param text  The text to search for.
     * @return {@code true} if the label contains the text, {@code false} otherwise.
     */
    private boolean containsTextInLabel(String label, String text) {
        return label.contains(text);
    }

    /**
     * Checks if any of the contract elements in the given list contain the specified text.
     *
     * @param fields The list of contract elements to search within.
     * @param text   The text to search for.
     * @return {@code true} if any contract element contains the text, {@code false} otherwise.
     */
    private boolean containsTextInFields(List<ContractElement> fields, String text) {
        return fields.stream().anyMatch(field -> field.getLabel().contains(text));
    }
}
