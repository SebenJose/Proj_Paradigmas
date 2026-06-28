package utfpr.com.Proj_Paradigmas.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import utfpr.com.Proj_Paradigmas.dto.BookListRequest;
import utfpr.com.Proj_Paradigmas.dto.UserProfileResponse;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookListService bookListService;

    @Test
    public void testUserProfileListsPrivacy() {
        User user = User.builder()
                .username("profileuser")
                .email("profileuser@email.com")
                .passwordHash("hashedpassword")
                .build();
        userRepository.save(user);

        // Criar uma pública e uma privada
        bookListService.createList("profileuser", new BookListRequest("Lista Pública", false));
        bookListService.createList("profileuser", new BookListRequest("Lista Privada", true));

        UserProfileResponse profile = userService.getUserProfile("profileuser");
        assertNotNull(profile);
        assertEquals("profileuser", profile.username());
        assertEquals(1, profile.lists().size());
        assertEquals("Lista Pública", profile.lists().get(0).name());
    }
}
