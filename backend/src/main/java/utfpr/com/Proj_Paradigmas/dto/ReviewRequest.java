package utfpr.com.Proj_Paradigmas.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReviewRequest(
        @NotBlank(message = "O ID do Google Books é obrigatório")
        String googleBooksId,

        @NotNull(message = "A nota é obrigatória")
        @Min(value = 1, message = "A nota deve ser no mínimo 1")
        @Max(value = 5, message = "A nota deve ser no máximo 5")
        Double rating,

        String comment
) {}
