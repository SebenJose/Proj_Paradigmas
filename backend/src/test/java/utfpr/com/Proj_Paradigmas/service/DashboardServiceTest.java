package utfpr.com.Proj_Paradigmas.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import utfpr.com.Proj_Paradigmas.dto.BookRatingSummary;
import utfpr.com.Proj_Paradigmas.dto.DashboardResponse;
import utfpr.com.Proj_Paradigmas.model.Book;
import utfpr.com.Proj_Paradigmas.model.Review;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.repository.ReviewRepository;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private NytService nytService;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void testGetDashboardData_NytReturnsBooks() {
        // Arrange
        PageRequest limitFive = PageRequest.of(0, 5);
        List<BookRatingSummary> nytBooks = List.of(
                new BookRatingSummary("nyt-id-1", "NYT Book 1", "cover1.jpg", 4.5, 0L)
        );
        List<BookRatingSummary> mostReviewed = List.of(
                new BookRatingSummary("id-2", "Most Reviewed Book", "cover2.jpg", 4.0, 10L)
        );
        
        User user = User.builder().username("john_doe").build();
        Book book = Book.builder().googleBooksId("id-3").title("Recent Book").build();
        Review recentReview = Review.builder()
                .id(1L)
                .user(user)
                .book(book)
                .rating(5.0)
                .comment("Excellent!")
                .createdAt(Instant.now())
                .build();
        List<Review> recentReviews = List.of(recentReview);

        when(nytService.getAcclaimedBooks()).thenReturn(nytBooks);
        when(reviewRepository.findMostReviewedBooks(limitFive)).thenReturn(mostReviewed);
        when(reviewRepository.findRecentReviews(limitFive)).thenReturn(recentReviews);

        // Act
        DashboardResponse response = dashboardService.getDashboardData();

        // Assert
        assertNotNull(response);
        assertEquals(nytBooks, response.topRated());
        assertEquals(mostReviewed, response.mostReviewed());
        assertEquals(1, response.recentReviews().size());
        assertEquals("john_doe", response.recentReviews().get(0).username());
        assertEquals("Recent Book", response.recentReviews().get(0).bookTitle());
        assertEquals(5.0, response.recentReviews().get(0).rating());

        verify(nytService, times(1)).getAcclaimedBooks();
        verify(reviewRepository, never()).findTopRatedBooks(any());
        verify(reviewRepository, times(1)).findMostReviewedBooks(limitFive);
        verify(reviewRepository, times(1)).findRecentReviews(limitFive);
    }

    @Test
    void testGetDashboardData_NytReturnsEmpty_FallbackToRepository() {
        // Arrange
        PageRequest limitFive = PageRequest.of(0, 5);
        List<BookRatingSummary> topRatedRepo = List.of(
                new BookRatingSummary("repo-id-1", "Repo Top Book", "cover1.jpg", 4.8, 5L)
        );
        List<BookRatingSummary> mostReviewed = List.of(
                new BookRatingSummary("id-2", "Most Reviewed Book", "cover2.jpg", 4.0, 10L)
        );
        
        User user = User.builder().username("john_doe").build();
        Book book = Book.builder().googleBooksId("id-3").title("Recent Book").build();
        Review recentReview = Review.builder()
                .id(1L)
                .user(user)
                .book(book)
                .rating(5.0)
                .comment("Excellent!")
                .createdAt(Instant.now())
                .build();
        List<Review> recentReviews = List.of(recentReview);

        when(nytService.getAcclaimedBooks()).thenReturn(List.of());
        when(reviewRepository.findTopRatedBooks(limitFive)).thenReturn(topRatedRepo);
        when(reviewRepository.findMostReviewedBooks(limitFive)).thenReturn(mostReviewed);
        when(reviewRepository.findRecentReviews(limitFive)).thenReturn(recentReviews);

        // Act
        DashboardResponse response = dashboardService.getDashboardData();

        // Assert
        assertNotNull(response);
        assertEquals(topRatedRepo, response.topRated());
        assertEquals(mostReviewed, response.mostReviewed());
        assertEquals(1, response.recentReviews().size());

        verify(nytService, times(1)).getAcclaimedBooks();
        verify(reviewRepository, times(1)).findTopRatedBooks(limitFive);
        verify(reviewRepository, times(1)).findMostReviewedBooks(limitFive);
        verify(reviewRepository, times(1)).findRecentReviews(limitFive);
    }

    @Test
    void testGetDashboardData_NytReturnsNull_FallbackToRepository() {
        // Arrange
        PageRequest limitFive = PageRequest.of(0, 5);
        List<BookRatingSummary> topRatedRepo = List.of(
                new BookRatingSummary("repo-id-1", "Repo Top Book", "cover1.jpg", 4.8, 5L)
        );
        List<BookRatingSummary> mostReviewed = List.of(
                new BookRatingSummary("id-2", "Most Reviewed Book", "cover2.jpg", 4.0, 10L)
        );
        
        User user = User.builder().username("john_doe").build();
        Book book = Book.builder().googleBooksId("id-3").title("Recent Book").build();
        Review recentReview = Review.builder()
                .id(1L)
                .user(user)
                .book(book)
                .rating(5.0)
                .comment("Excellent!")
                .createdAt(Instant.now())
                .build();
        List<Review> recentReviews = List.of(recentReview);

        when(nytService.getAcclaimedBooks()).thenReturn(null);
        when(reviewRepository.findTopRatedBooks(limitFive)).thenReturn(topRatedRepo);
        when(reviewRepository.findMostReviewedBooks(limitFive)).thenReturn(mostReviewed);
        when(reviewRepository.findRecentReviews(limitFive)).thenReturn(recentReviews);

        // Act
        DashboardResponse response = dashboardService.getDashboardData();

        // Assert
        assertNotNull(response);
        assertEquals(topRatedRepo, response.topRated());
        assertEquals(mostReviewed, response.mostReviewed());
        assertEquals(1, response.recentReviews().size());

        verify(nytService, times(1)).getAcclaimedBooks();
        verify(reviewRepository, times(1)).findTopRatedBooks(limitFive);
        verify(reviewRepository, times(1)).findMostReviewedBooks(limitFive);
        verify(reviewRepository, times(1)).findRecentReviews(limitFive);
    }
}
