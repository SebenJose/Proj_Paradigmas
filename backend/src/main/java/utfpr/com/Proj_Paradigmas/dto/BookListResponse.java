package utfpr.com.Proj_Paradigmas.dto;

import java.util.List;

public record BookListResponse(
        Long id,
        String name,
        List<BookSummaryResponse> books,
        boolean isPrivate
) {}
