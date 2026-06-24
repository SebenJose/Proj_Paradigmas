package utfpr.com.Proj_Paradigmas.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utfpr.com.Proj_Paradigmas.dto.BookReviewsResponse;
import utfpr.com.Proj_Paradigmas.dto.ReviewRequest;
import utfpr.com.Proj_Paradigmas.dto.ReviewResponse;
import utfpr.com.Proj_Paradigmas.exception.ConflictException;
import utfpr.com.Proj_Paradigmas.exception.ResourceNotFoundException;
import utfpr.com.Proj_Paradigmas.model.Book;
import utfpr.com.Proj_Paradigmas.model.Review;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.repository.ReviewRepository;
import utfpr.com.Proj_Paradigmas.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookService bookService;

    @Transactional
    public ReviewResponse createReview(String username, ReviewRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Book book = bookService.findOrCreate(request.googleBooksId());

        if (reviewRepository.existsByUserAndBook(user, book)) {
            throw new ConflictException("Você já avaliou este livro");
        }

        if (request.rating() < 1 || request.rating() > 5) {
            throw new IllegalArgumentException("A nota deve ser entre 1 e 5");
        }

        Review review = Review.builder()
                .user(user)
                .book(book)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        Review savedReview = reviewRepository.save(review);
        return toResponse(savedReview);
    }

    @Transactional(readOnly = true)
    public BookReviewsResponse getBookReviews(String googleBooksId) {
        Double average = reviewRepository.getAverageRatingByGoogleBooksId(googleBooksId);
        Long count = reviewRepository.getReviewCountByGoogleBooksId(googleBooksId);
        if (count == null) {
            count = 0L;
        }

        List<ReviewResponse> reviews = reviewRepository.findByBookGoogleBooksId(googleBooksId)
                .stream()
                .map(this::toResponse)
                .toList();

        return new BookReviewsResponse(average, count, reviews);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviews(String username) {
        return reviewRepository.findByUserUsername(username)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getUser().getUsername(),
                review.getBook().getGoogleBooksId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
