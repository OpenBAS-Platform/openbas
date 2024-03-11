package io.openbas.rest.injector;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.openbas.database.model.Injector;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.injector.form.InjectorCreateInput;
import io.openbas.rest.injector.form.InjectorUpdateInput;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

import static io.openbas.database.model.User.ROLE_ADMIN;

@RestController
public class InjectorApi extends RestBehavior {

    private InjectorRepository injectorRepository;

    @Autowired
    public void setInjectorRepository(InjectorRepository injectorRepository) {
        this.injectorRepository = injectorRepository;
    }

    @GetMapping("/api/injectors")
    public Iterable<Injector> injectors() {
        return injectorRepository.findAll();
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/injectors/{injectorId}")
    public Injector updateInjector(@PathVariable String injectorId,
                         @Valid @RequestBody InjectorUpdateInput input) {
        Injector injector = injectorRepository.findById(injectorId).orElseThrow();
        injector.setUpdateAttributes(input);
        injector.setUpdatedAt(Instant.now());
        injector.setState(input.getState());
        injector.setContracts(input.getContracts());
        return injectorRepository.save(injector);
    }

    @Secured(ROLE_ADMIN)
    @GetMapping("/api/injectors/{injectorId}")
    public Injector injector(@PathVariable String injectorId) {
        return injectorRepository.findById(injectorId).orElseThrow();
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/injectors")
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
                injector.setUpdatedAt(Instant.now());
                injector.setName(input.getName());
                injector.setContracts(input.getContracts());
                // injector.setState();
                return injectorRepository.save(injector);
            }
            Injector newInjector = new Injector();
            newInjector.setUpdateAttributes(input);
            return injectorRepository.save(newInjector);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
