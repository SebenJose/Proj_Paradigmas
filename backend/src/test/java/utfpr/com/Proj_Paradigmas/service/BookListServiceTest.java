package utfpr.com.Proj_Paradigmas.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import utfpr.com.Proj_Paradigmas.dto.BookListRequest;
import utfpr.com.Proj_Paradigmas.dto.BookListResponse;
import utfpr.com.Proj_Paradigmas.exception.ResourceNotFoundException;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
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

    @Test
    public void testUpdatePrivacy() {
        // Nota: listuser já é criado em @BeforeEach ou podemos recuperá-lo/criá-lo isoladamente.
        // Como a classe agora é @Transactional, podemos criar um usuário localmente no teste para garantir isolação total.
        User user = User.builder()
                .username("updateuser")
                .email("updateuser@email.com")
                .passwordHash("hashedpassword")
                .build();
        userRepository.save(user);
        
        BookListRequest createReq = new BookListRequest("Lista Mutável", false);
        BookListResponse created = bookListService.createList("updateuser", createReq);
        assertFalse(created.isPrivate());

        BookListResponse updated = bookListService.updatePrivacy("updateuser", created.id(), true);
        assertTrue(updated.isPrivate());
    }

    @Test
    public void testUpdatePrivacyListNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> {
            bookListService.updatePrivacy("updateuser", 9999L, true);
        });
    }

    @Test
    public void testUpdatePrivacyUnauthorizedUser() {
        User userA = User.builder()
                .username("usera")
                .email("usera@email.com")
                .passwordHash("hashedpassword")
                .build();
        userRepository.save(userA);

        User userB = User.builder()
                .username("userb")
                .email("userb@email.com")
                .passwordHash("hashedpassword")
                .build();
        userRepository.save(userB);

        BookListRequest createReq = new BookListRequest("Lista do User A", false);
        BookListResponse created = bookListService.createList("usera", createReq);

        assertThrows(ResourceNotFoundException.class, () -> {
            bookListService.updatePrivacy("userb", created.id(), true);
        });
    }
}
