package io.openex;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class AppTests {
	@Test
	void dummyTest() {
		assertThat("test").isEqualTo("test");
	}
}
