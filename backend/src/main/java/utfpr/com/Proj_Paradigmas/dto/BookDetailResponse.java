package utfpr.com.Proj_Paradigmas.dto;

import java.util.List;

public record BookDetailResponse(
        String googleBooksId,
        String title,
        List<String> authors,
        String description,
        String coverUrl,
        String publishedDate,
        Integer pageCount) {}
