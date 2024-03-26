package io.openbas.rest.injector;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.openbas.database.model.Injector;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.injector.form.InjectorContractInput;
import io.openbas.rest.injector.form.InjectorCreateInput;
import io.openbas.rest.injector.form.InjectorUpdateInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static io.openbas.database.model.User.ROLE_ADMIN;

@RestController
public class InjectorApi extends RestBehavior {

    private InjectorRepository injectorRepository;

    private InjectorContractRepository injectorContractRepository;

    @Autowired
    public void setInjectorRepository(InjectorRepository injectorRepository) {
        this.injectorRepository = injectorRepository;
    }

    @Autowired
    public void setInjectorContractRepository(InjectorContractRepository injectorContractRepository) {
        this.injectorContractRepository = injectorContractRepository;
    }

    @GetMapping("/api/injectors")
    public Iterable<Injector> injectors() {
        return injectorRepository.findAll();
    }

    private InjectorContract convertInjectorFromInput(InjectorContractInput in, Injector injector) {
        InjectorContract injectorContract = new InjectorContract();
        injectorContract.setId(in.getId());
        injectorContract.setManual(in.isManual());
        injectorContract.setLabels(in.getLabels());
        injectorContract.setInjector(injector);
        injectorContract.setContent(in.getContent());
        return injectorContract;
    }

    private Injector updateInjector(Injector injector, String name, List<InjectorContractInput> contracts) {
        injector.setUpdatedAt(Instant.now());
        injector.setName(name);
        List<String> existing = new ArrayList<>();
        List<String> toDeletes = new ArrayList<>();
        injector.getContracts().forEach(contract -> {
            Optional<InjectorContractInput> current = contracts.stream()
                    .filter(c -> c.getId().equals(contract.getId())).findFirst();
            if (current.isPresent()) {
                existing.add(contract.getId());
                contract.setManual(current.get().isManual());
                contract.setLabels(current.get().getLabels());
                contract.setContent(current.get().getContent());
            } else {
                toDeletes.add(contract.getId());
            }
        });
        List<InjectorContract> toCreates = contracts.stream()
                .filter(c -> !existing.contains(c.getId()))
                .map(in -> convertInjectorFromInput(in, injector)).toList();
        injectorContractRepository.deleteAllById(toDeletes);
        injectorContractRepository.saveAll(toCreates);
        return injectorRepository.save(injector);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/injectors/{injectorId}")
    public Injector updateInjector(@PathVariable String injectorId, @Valid @RequestBody InjectorUpdateInput input) {
        Injector injector = injectorRepository.findById(injectorId).orElseThrow();
        return updateInjector(injector, input.getName(), input.getContracts());
    }

    @Secured(ROLE_ADMIN)
    @GetMapping("/api/injectors/{injectorId}")
    public Injector injector(@PathVariable String injectorId) {
        return injectorRepository.findById(injectorId).orElseThrow();
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/injectors")
    @Transactional
    public Injector registerInjector(@Valid @RequestBody InjectorCreateInput input) {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("192.168.2.36");
        try {
            Connection connection = factory.newConnection();
            Channel channel = connection.createChannel();
            String queueName = "openbas_injector_" + input.getType();
            String exchangeName = "openbas_amqp.connector.exchange";
            channel.exchangeDeclare(exchangeName, "direct", true);
            channel.queueDeclare(queueName, true, false, false, null);
            channel.queueBind(queueName, exchangeName, "openbas_push_routing_" + input.getType());

            // We need to support upsert for registration
            Injector injector = injectorRepository.findById(input.getId()).orElse(null);
            if (injector != null) {
                return updateInjector(injector, input.getName(), input.getContracts());
            } else {
                // save the injector
                Injector newInjector = new Injector();
                newInjector.setId(input.getId());
                newInjector.setName(input.getName());
                newInjector.setType(input.getType());
                Injector savedInjector = injectorRepository.save(newInjector);
                // Save the contracts
                List<InjectorContract> injectorContracts = input.getContracts().stream()
                        .map(in -> convertInjectorFromInput(in, savedInjector)).toList();
                injectorContractRepository.saveAll(injectorContracts);
                return savedInjector;
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
