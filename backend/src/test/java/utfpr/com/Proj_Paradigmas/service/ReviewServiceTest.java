package utfpr.com.Proj_Paradigmas.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import utfpr.com.Proj_Paradigmas.dto.ReviewRequest;
import utfpr.com.Proj_Paradigmas.exception.ConflictException;
import utfpr.com.Proj_Paradigmas.exception.ResourceNotFoundException;
import utfpr.com.Proj_Paradigmas.model.Book;
import utfpr.com.Proj_Paradigmas.model.Review;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.repository.ReviewRepository;
import utfpr.com.Proj_Paradigmas.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock ReviewRepository reviewRepository;
    @Mock UserRepository userRepository;
    @Mock BookService bookService;

    @InjectMocks ReviewService reviewService;

    private User makeUser() {
        return User.builder()
                .id(1L)
                .username("joao")
                .email("joao@email.com")
                .passwordHash("hash")
                .createdAt(Instant.now())
                .build();
    }

    private Book makeBook() {
        return Book.builder().id(1L).googleBooksId("abc123").title("Clean Code").build();
    }

    @Test
    void createReview_success() {
        User user = makeUser();
        Book book = makeBook();
        var request = new ReviewRequest("abc123", 4, "Ótimo livro");

        when(userRepository.findByUsername("joao")).thenReturn(Optional.of(user));
        when(bookService.findOrCreate("abc123")).thenReturn(book);
        when(reviewRepository.existsByUserAndBook(user, book)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(1L);
            r.setCreatedAt(Instant.now());
            return r;
        });

        var response = reviewService.createReview("joao", request);

        assertThat(response.rating()).isEqualTo(4);
        assertThat(response.googleBooksId()).isEqualTo("abc123");
        assertThat(response.username()).isEqualTo("joao");
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void createReview_userNotFound_throwsNotFound() {
        when(userRepository.findByUsername("nobody")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview("nobody", new ReviewRequest("abc123", 4, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createReview_duplicateReview_throwsConflict() {
        User user = makeUser();
        Book book = makeBook();

        when(userRepository.findByUsername("joao")).thenReturn(Optional.of(user));
        when(bookService.findOrCreate("abc123")).thenReturn(book);
        when(reviewRepository.existsByUserAndBook(user, book)).thenReturn(true);

        assertThatThrownBy(() -> reviewService.createReview("joao", new ReviewRequest("abc123", 4, null)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("já avaliou");
    }

    @Test
    void createReview_ratingBelowMin_throwsIllegalArgument() {
        User user = makeUser();
        Book book = makeBook();

        when(userRepository.findByUsername("joao")).thenReturn(Optional.of(user));
        when(bookService.findOrCreate("abc123")).thenReturn(book);
        when(reviewRepository.existsByUserAndBook(user, book)).thenReturn(false);

        assertThatThrownBy(() -> reviewService.createReview("joao", new ReviewRequest("abc123", 0, null)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createReview_ratingAboveMax_throwsIllegalArgument() {
        User user = makeUser();
        Book book = makeBook();

        when(userRepository.findByUsername("joao")).thenReturn(Optional.of(user));
        when(bookService.findOrCreate("abc123")).thenReturn(book);
        when(reviewRepository.existsByUserAndBook(user, book)).thenReturn(false);

        assertThatThrownBy(() -> reviewService.createReview("joao", new ReviewRequest("abc123", 6, null)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getBookReviews_returnsAggregatedData() {
        when(reviewRepository.getAverageRatingByGoogleBooksId("abc123")).thenReturn(4.5);
        when(reviewRepository.getReviewCountByGoogleBooksId("abc123")).thenReturn(2L);
        when(reviewRepository.findByBookGoogleBooksId("abc123")).thenReturn(List.of());

        var response = reviewService.getBookReviews("abc123");

        assertThat(response.averageRating()).isEqualTo(4.5);
        assertThat(response.reviewCount()).isEqualTo(2L);
        assertThat(response.reviews()).isEmpty();
    }
}
