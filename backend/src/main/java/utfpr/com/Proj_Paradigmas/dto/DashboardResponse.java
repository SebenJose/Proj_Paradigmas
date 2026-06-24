package utfpr.com.Proj_Paradigmas.dto;

import java.util.List;

public record DashboardResponse(
        List<BookRatingSummary> topRated,
        List<BookRatingSummary> mostReviewed,
        List<ReviewResponse> recentReviews
) {}
