package utfpr.com.Proj_Paradigmas.dto;

import java.util.List;

public record BookReviewsResponse(
        Double averageRating,
        Long reviewCount,
        List<ReviewResponse> reviews
) {}
