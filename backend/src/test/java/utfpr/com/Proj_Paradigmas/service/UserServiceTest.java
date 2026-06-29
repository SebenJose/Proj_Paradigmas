package utfpr.com.Proj_Paradigmas.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import utfpr.com.Proj_Paradigmas.dto.BookListRequest;
import utfpr.com.Proj_Paradigmas.dto.UserProfileResponse;
import utfpr.com.Proj_Paradigmas.dto.ReviewRequest;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.model.Book;
import utfpr.com.Proj_Paradigmas.repository.UserRepository;
import utfpr.com.Proj_Paradigmas.repository.BookRepository;

import java.util.List;

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

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private BookRepository bookRepository;

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

    @Test
    public void testUserProfileUserNotFound() {
        assertThrows(utfpr.com.Proj_Paradigmas.exception.ResourceNotFoundException.class, () -> {
            userService.getUserProfile("nonexistentuser");
        });
    }

    @Test
    public void testUserProfileMapping() {
        User user = User.builder()
                .username("mappeduser")
                .email("mappeduser@email.com")
                .passwordHash("hashedpassword")
                .build();
        userRepository.save(user);

        // Criar uma lista pública
        bookListService.createList("mappeduser", new BookListRequest("Minha Lista", false));

        // Criar um livro e uma avaliação
        Book book = Book.builder()
                .googleBooksId("mappedbook123")
                .title("Livro Mapeado")
                .authors(List.of("Autor Mapeado"))
                .build();
        bookRepository.save(book);

        reviewService.createReview("mappeduser", new ReviewRequest("mappedbook123", 5.0, "Excelente livro!"));

        UserProfileResponse profile = userService.getUserProfile("mappeduser");
        assertNotNull(profile);
        assertEquals("mappeduser", profile.username());
        
        // Verificar mapeamento de lista pública
        assertEquals(1, profile.lists().size());
        assertEquals("Minha Lista", profile.lists().get(0).name());
        assertFalse(profile.lists().get(0).isPrivate());

        // Verificar mapeamento de avaliação
        assertEquals(1, profile.reviews().size());
        assertEquals("mappeduser", profile.reviews().get(0).username());
        assertEquals("mappedbook123", profile.reviews().get(0).googleBooksId());
        assertEquals(5.0, profile.reviews().get(0).rating());
        assertEquals("Excelente livro!", profile.reviews().get(0).comment());
    }
}
