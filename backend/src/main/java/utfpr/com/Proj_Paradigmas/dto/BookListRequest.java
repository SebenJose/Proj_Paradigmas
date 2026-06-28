package utfpr.com.Proj_Paradigmas.dto;

import jakarta.validation.constraints.NotBlank;

public record BookListRequest(
        @NotBlank(message = "O nome da lista é obrigatório")
        String name,
        boolean isPrivate
) {}
