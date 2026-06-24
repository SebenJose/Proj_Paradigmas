package utfpr.com.Proj_Paradigmas.dto;

public record BookRatingSummary(
        String googleBooksId,
        String title,
        String coverUrl,
        Double averageRating,
        Long reviewCount
) {}
