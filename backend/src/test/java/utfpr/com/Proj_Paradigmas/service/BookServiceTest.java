package utfpr.com.Proj_Paradigmas.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import utfpr.com.Proj_Paradigmas.dto.BookDetailResponse;
import utfpr.com.Proj_Paradigmas.dto.GoogleBookVolumeDto;
import utfpr.com.Proj_Paradigmas.model.Book;
import utfpr.com.Proj_Paradigmas.repository.BookRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class BookServiceTest {

    @Autowired
    private BookService bookService;

    @Autowired
    private BookRepository bookRepository;

    @MockitoBean
    private GoogleBooksClient googleBooksClient;

    @Test
    public void testFindOrCreateSavesEmbeddable() {
        String googleId = "test_embeddable_id";
        
        GoogleBookVolumeDto.VolumeInfo volumeInfo = new GoogleBookVolumeDto.VolumeInfo(
                "Test Title",
                List.of("Author Name"),
                "Description",
                "2026-06-28",
                120,
                null
        );
        GoogleBookVolumeDto.AccessInfo accessInfo = new GoogleBookVolumeDto.AccessInfo(true);
        GoogleBookVolumeDto mockDto = new GoogleBookVolumeDto(googleId, volumeInfo, accessInfo);

        when(googleBooksClient.findById(googleId)).thenReturn(Optional.of(mockDto));

        BookDetailResponse response = bookService.getDetail(googleId);

        assertNotNull(response);
        assertEquals(googleId, response.googleBooksId());
        assertTrue(response.embeddable());

        Book savedBook = bookRepository.findByGoogleBooksId(googleId).orElse(null);
        assertNotNull(savedBook);
        assertTrue(savedBook.getEmbeddable());
    }
}
