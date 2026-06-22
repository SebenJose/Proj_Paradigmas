package utfpr.com.Proj_Paradigmas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Usuário é obrigatório")
                @Size(min = 3, max = 50, message = "Usuário deve ter entre 3 e 50 caracteres")
                String username,
        @NotBlank(message = "E-mail é obrigatório") @Email(message = "E-mail inválido") String email,
        @NotBlank(message = "Senha é obrigatória")
                @Size(min = 6, message = "Senha deve ter ao menos 6 caracteres")
                String password) {}
