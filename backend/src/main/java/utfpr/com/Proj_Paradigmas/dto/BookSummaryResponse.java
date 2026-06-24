package utfpr.com.Proj_Paradigmas.dto;

public record BookSummaryResponse(
        Long id,
        String googleBooksId,
        String title,
        String coverUrl
) {}
