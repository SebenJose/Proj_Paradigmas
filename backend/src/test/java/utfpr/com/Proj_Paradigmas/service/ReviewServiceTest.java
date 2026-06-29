package utfpr.com.Proj_Paradigmas.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import utfpr.com.Proj_Paradigmas.dto.ReviewRequest;
import utfpr.com.Proj_Paradigmas.dto.ReviewResponse;
import utfpr.com.Proj_Paradigmas.exception.ConflictException;
import utfpr.com.Proj_Paradigmas.model.Book;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.repository.BookRepository;
import utfpr.com.Proj_Paradigmas.repository.UserRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@org.springframework.transaction.annotation.Transactional
public class ReviewServiceTest {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Test
    public void testCreateReviewWorkflow() {
        User user = User.builder()
                .username("testuser")
                .email("testuser@email.com")
                .passwordHash("hashedpassword")
                .build();
        userRepository.save(user);

        Book book = Book.builder()
                .googleBooksId("mockId123")
                .title("Livro de Teste")
                .authors(List.of("Autor Teste"))
                .build();
        bookRepository.save(book);

        ReviewRequest request = new ReviewRequest("mockId123", 4.5, "Comentário de teste");
        ReviewResponse response = reviewService.createReview("testuser", request);

        assertNotNull(response);
        assertEquals(4.5, response.rating());
        assertEquals("Comentário de teste", response.comment());

        assertThrows(ConflictException.class, () -> {
            reviewService.createReview("testuser", request);
        });

        ReviewRequest invalidRequest = new ReviewRequest("mockId123", 4.3, "Inválido");
        assertThrows(IllegalArgumentException.class, () -> {
            reviewService.createReview("testuser", invalidRequest);
        });
    }
}
