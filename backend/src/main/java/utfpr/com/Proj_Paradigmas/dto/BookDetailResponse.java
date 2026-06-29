package utfpr.com.Proj_Paradigmas.dto;

import java.util.List;

public record BookDetailResponse(
        String googleBooksId,
        String title,
        List<String> authors,
        String description,
        String coverUrl,
        String publishedDate,
        Integer pageCount,
        Boolean embeddable) {

    public BookDetailResponse(
            String googleBooksId,
            String title,
            List<String> authors,
            String description,
            String coverUrl,
            String publishedDate,
            Integer pageCount) {
        this(googleBooksId, title, authors, description, coverUrl, publishedDate, pageCount, null);
    }
}
