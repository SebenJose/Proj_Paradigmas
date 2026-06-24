package utfpr.com.Proj_Paradigmas.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import utfpr.com.Proj_Paradigmas.dto.BookReviewsResponse;
import utfpr.com.Proj_Paradigmas.dto.ReviewRequest;
import utfpr.com.Proj_Paradigmas.dto.ReviewResponse;
import utfpr.com.Proj_Paradigmas.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/book/{googleBooksId}")
    public ResponseEntity<BookReviewsResponse> getBookReviews(@PathVariable String googleBooksId) {
        return ResponseEntity.ok(reviewService.getBookReviews(googleBooksId));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(authentication.getName(), request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReviewResponse>> getUserReviews(Authentication authentication) {
        return ResponseEntity.ok(reviewService.getUserReviews(authentication.getName()));
    }
}
