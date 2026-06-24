package utfpr.com.Proj_Paradigmas.dto;

import jakarta.validation.constraints.NotBlank;

public record AddBookToListRequest(
        @NotBlank(message = "O ID do Google Books é obrigatório")
        String googleBooksId,

        String title,

        String coverUrl
) {}
