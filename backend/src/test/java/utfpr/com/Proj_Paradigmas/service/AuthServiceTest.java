package utfpr.com.Proj_Paradigmas.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import utfpr.com.Proj_Paradigmas.dto.RegisterRequest;
import utfpr.com.Proj_Paradigmas.exception.ConflictException;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.repository.UserRepository;
import utfpr.com.Proj_Paradigmas.security.CustomUserDetailsService;
import utfpr.com.Proj_Paradigmas.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock CustomUserDetailsService userDetailsService;

    @InjectMocks AuthService authService;

    @Test
    void register_success() {
        var request = new RegisterRequest("joao", "joao@email.com", "senha123");
        when(userRepository.existsByUsername("joao")).thenReturn(false);
        when(userRepository.existsByEmail("joao@email.com")).thenReturn(false);
        when(passwordEncoder.encode("senha123")).thenReturn("hashed");

        authService.register(request);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateUsername_throwsConflict() {
        var request = new RegisterRequest("joao", "joao@email.com", "senha123");
        when(userRepository.existsByUsername("joao")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Usuário");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_duplicateEmail_throwsConflict() {
        var request = new RegisterRequest("joao", "joao@email.com", "senha123");
        when(userRepository.existsByUsername("joao")).thenReturn(false);
        when(userRepository.existsByEmail("joao@email.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("E-mail");

        verify(userRepository, never()).save(any());
    }
}
