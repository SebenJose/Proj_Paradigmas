package utfpr.com.Proj_Paradigmas.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateListPrivacyRequest(
        @NotNull(message = "O estado de privacidade é obrigatório")
        Boolean isPrivate
) {}
