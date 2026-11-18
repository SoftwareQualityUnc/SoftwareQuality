package com.backend.backend;

import org.junit.jupiter.api.Test;
import org.mockito.Answers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.ApplicationContext;

import com.backend.backend.controllers.ProductoController;
import com.backend.backend.firebase.FirebaseInitializer;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(properties = "API_KEY_INSERT=local-test-key")
class BackendApplicationTests {

	@MockBean(answer = Answers.RETURNS_DEEP_STUBS)
	private FirebaseInitializer firebaseInitializer;

	@Autowired
	private ApplicationContext context;

	@Test
	void contextLoads() {
		assertNotNull(context.getBean(ProductoController.class));
	}

}
