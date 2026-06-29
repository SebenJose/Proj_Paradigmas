package utfpr.com.Proj_Paradigmas.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utfpr.com.Proj_Paradigmas.dto.BookRatingSummary;
import utfpr.com.Proj_Paradigmas.dto.DashboardResponse;
import utfpr.com.Proj_Paradigmas.dto.ReviewResponse;
import utfpr.com.Proj_Paradigmas.model.Review;
import utfpr.com.Proj_Paradigmas.repository.ReviewRepository;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ReviewRepository reviewRepository;
    private final NytService nytService;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardData() {
        PageRequest limitFive = PageRequest.of(0, 5);

        List<BookRatingSummary> topRated = nytService.getAcclaimedBooks();
        if (topRated == null || topRated.isEmpty()) {
            topRated = reviewRepository.findTopRatedBooks(limitFive);
        }
        List<BookRatingSummary> mostReviewed = reviewRepository.findMostReviewedBooks(limitFive);

        List<ReviewResponse> recentReviews = reviewRepository.findRecentReviews(limitFive)
                .stream()
                .map(this::toReviewResponse)
                .toList();

        return new DashboardResponse(topRated, mostReviewed, recentReviews);
    }

    private ReviewResponse toReviewResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getUser().getUsername(),
                review.getBook().getGoogleBooksId(),
                review.getBook().getTitle(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
