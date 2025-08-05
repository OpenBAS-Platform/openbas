package io.openbas.stix.types;

import io.openbas.IntegrationTest;
import io.openbas.stix.objects.DomainObject;
import jakarta.transaction.Transactional;
import java.util.HashMap;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
public class TypesTest extends IntegrationTest {
  @Test
  public void test() {
    BaseType<?> t = new Binary("new byte[0]");
    BaseType<?> t2 = new Boolean(true);

    DomainObject d = new DomainObject();
    HashMap<java.lang.String, BaseType<?>> set = new HashMap<>();
    set.put("a", t);
    set.put("b", t2);
    d.setProperties(set);

    java.lang.Boolean b = (java.lang.Boolean) d.getProperties().get("b").getValue();
    byte[] bytes = (byte[]) d.getProperties().get("a").getValue();
  }
}
