package io.openbas.rest.inject;

import io.openbas.database.model.Inject;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.InjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/injects/atomic_testings")
public class AtomicTestingApi extends RestBehavior {

    private InjectService injectService;

    @Autowired
    public void setInjectService(InjectService injectService) {
        this.injectService = injectService;
    }

    @GetMapping
    public List<Inject> findAllAtomicTestings() {
        return injectService.findAllAtomicTestings(); //todo add pagination, modify repository extends jpaRepository or add specificationQuery, move into a service layer
    }

    @GetMapping("/{injectId}")
    public Inject findAtomicTesting(@PathVariable String injectId) {
        return injectService.findById(injectId).orElseThrow();
    }

}
