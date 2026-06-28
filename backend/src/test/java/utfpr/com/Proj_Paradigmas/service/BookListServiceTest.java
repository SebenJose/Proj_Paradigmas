package utfpr.com.Proj_Paradigmas.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import utfpr.com.Proj_Paradigmas.dto.BookListRequest;
import utfpr.com.Proj_Paradigmas.dto.BookListResponse;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@org.springframework.transaction.annotation.Transactional
public class BookListServiceTest {

    @Autowired
    private BookListService bookListService;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testCreatePrivateList() {
        User user = User.builder()
                .username("listuser")
                .email("listuser@email.com")
                .passwordHash("hashedpassword")
                .build();
        userRepository.save(user);

        BookListRequest request = new BookListRequest("Lista Privada de Teste", true);
        BookListResponse response = bookListService.createList("listuser", request);

        assertNotNull(response);
        assertTrue(response.isPrivate());
        assertEquals("Lista Privada de Teste", response.name());
    }

    @Test
    public void testCreatePublicListByDefault() {
        User user = User.builder()
                .username("publiclistuser")
                .email("publiclistuser@email.com")
                .passwordHash("hashedpassword")
                .build();
        userRepository.save(user);

        BookListRequest request = new BookListRequest("Lista Pública de Teste", false);
        BookListResponse response = bookListService.createList("publiclistuser", request);

        assertNotNull(response);
        assertFalse(response.isPrivate());
        assertEquals("Lista Pública de Teste", response.name());
    }
}
