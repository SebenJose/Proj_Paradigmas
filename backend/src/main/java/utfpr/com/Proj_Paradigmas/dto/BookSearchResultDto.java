package utfpr.com.Proj_Paradigmas.dto;

import java.util.List;

public record BookSearchResultDto(
        String googleBooksId, String title, List<String> authors, String coverUrl, String publishedDate) {}
