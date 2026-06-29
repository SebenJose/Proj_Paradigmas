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

    @Test
    public void testSearchFiltersNullVolumeInfo() {
        // Arrange
        String query = "some query";
        GoogleBookVolumeDto validDto = new GoogleBookVolumeDto(
                "valid-id",
                new GoogleBookVolumeDto.VolumeInfo("Valid Title", List.of("Author"), "Desc", "2026", 100, null),
                new GoogleBookVolumeDto.AccessInfo(true)
        );
        GoogleBookVolumeDto invalidDto = new GoogleBookVolumeDto(
                "invalid-id",
                null,
                new GoogleBookVolumeDto.AccessInfo(true)
        );

        when(googleBooksClient.search(query)).thenReturn(List.of(validDto, invalidDto));

        // Act
        var results = bookService.search(query);

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("valid-id", results.get(0).googleBooksId());
        assertEquals("Valid Title", results.get(0).title());
    }

    @Test
    public void testFindOrCreateThrowsResourceNotFoundExceptionWhenVolumeInfoIsNull() {
        // Arrange
        String googleId = "null_volume_info_id";
        GoogleBookVolumeDto mockDto = new GoogleBookVolumeDto(googleId, null, new GoogleBookVolumeDto.AccessInfo(true));

        when(googleBooksClient.findById(googleId)).thenReturn(Optional.of(mockDto));

        // Act & Assert
        assertThrows(utfpr.com.Proj_Paradigmas.exception.ResourceNotFoundException.class, () -> {
            bookService.findOrCreate(googleId);
        });
    }
}
