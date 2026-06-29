package utfpr.com.Proj_Paradigmas.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.task.TaskExecutor;
import utfpr.com.Proj_Paradigmas.dto.BookRatingSummary;
import utfpr.com.Proj_Paradigmas.dto.GoogleBookVolumeDto;
import utfpr.com.Proj_Paradigmas.dto.NytBestsellersResponseDto.NytBookDto;

@ExtendWith(MockitoExtension.class)
public class NytServiceTest {

    @Mock
    private NytClient nytClient;

    @Mock
    private GoogleBooksClient googleBooksClient;

    @Mock
    private TaskExecutor taskExecutor;

    @InjectMocks
    private NytService nytService;

    private NytBookDto sampleNytBook;
    private GoogleBookVolumeDto sampleGoogleBook;

    @BeforeEach
    void setUp() {
        sampleNytBook = new NytBookDto("Sample Title", "Sample Author", "Sample Description", "9781234567890");
        
        GoogleBookVolumeDto.VolumeInfo volumeInfo = new GoogleBookVolumeDto.VolumeInfo(
                "Sample Title",
                List.of("Sample Author"),
                "Sample Description",
                "2026-06-28",
                300,
                new GoogleBookVolumeDto.ImageLinks("http://example.com/thumbnail.jpg")
        );
        GoogleBookVolumeDto.AccessInfo accessInfo = new GoogleBookVolumeDto.AccessInfo(true);
        sampleGoogleBook = new GoogleBookVolumeDto("google-id-123", volumeInfo, accessInfo);

        // Run taskExecutor runnable synchronously in unit tests
        lenient().doAnswer(invocation -> {
            Runnable runnable = invocation.getArgument(0);
            runnable.run();
            return null;
        }).when(taskExecutor).execute(any(Runnable.class));
    }

    @Test
    void testGetAcclaimedBooks_TriggersAsyncUpdateAndCaches() throws Exception {
        // Arrange
        when(nytClient.getHardcoverFictionBestsellers()).thenReturn(List.of(sampleNytBook));
        when(googleBooksClient.search("isbn:9781234567890")).thenReturn(List.of(sampleGoogleBook));

        // Act
        List<BookRatingSummary> result = nytService.getAcclaimedBooks();
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        BookRatingSummary summary = result.get(0);
        assertEquals("google-id-123", summary.googleBooksId());
        assertEquals("Sample Title", summary.title());
        assertEquals("http://example.com/thumbnail.jpg", summary.coverUrl());
        assertEquals(4.5, summary.averageRating());
        assertEquals(0L, summary.reviewCount());

        // Verify that external clients were called only once
        verify(nytClient, times(1)).getHardcoverFictionBestsellers();
        verify(googleBooksClient, times(1)).search("isbn:9781234567890");

        // Act - Second call should return cached data
        List<BookRatingSummary> cachedResult = nytService.getAcclaimedBooks();

        // Assert cached values
        assertNotNull(cachedResult);
        assertEquals(1, cachedResult.size());
        assertEquals(result, cachedResult);
    }

    @Test
    void testGetAcclaimedBooks_FallbackToTitleAuthorSearch() throws Exception {
        // Arrange
        when(nytClient.getHardcoverFictionBestsellers()).thenReturn(List.of(sampleNytBook));
        when(googleBooksClient.search("isbn:9781234567890")).thenReturn(List.of());
        
        String fallbackQuery = "intitle:\"Sample Title\" inauthor:\"Sample Author\"";
        when(googleBooksClient.search(fallbackQuery)).thenReturn(List.of(sampleGoogleBook));

        // Act
        List<BookRatingSummary> result = nytService.getAcclaimedBooks();

        // Assert
        assertEquals(1, result.size());
        assertEquals("google-id-123", result.get(0).googleBooksId());

        verify(googleBooksClient, times(1)).search("isbn:9781234567890");
        verify(googleBooksClient, times(1)).search(fallbackQuery);
    }

    @Test
    void testGetAcclaimedBooks_NoIsbnUsesFallback() throws Exception {
        // Arrange
        NytBookDto bookWithoutIsbn = new NytBookDto("Sample Title", "Sample Author", "Sample Description", null);
        when(nytClient.getHardcoverFictionBestsellers()).thenReturn(List.of(bookWithoutIsbn));
        
        String fallbackQuery = "intitle:\"Sample Title\" inauthor:\"Sample Author\"";
        when(googleBooksClient.search(fallbackQuery)).thenReturn(List.of(sampleGoogleBook));

        // Act
        List<BookRatingSummary> result = nytService.getAcclaimedBooks();

        // Assert
        assertEquals(1, result.size());
        verify(googleBooksClient, never()).search(startsWith("isbn:"));
        verify(googleBooksClient, times(1)).search(fallbackQuery);
    }

    @Test
    void testGetAcclaimedBooks_BlankIsbnUsesFallback() throws Exception {
        // Arrange
        NytBookDto bookWithBlankIsbn = new NytBookDto("Sample Title", "Sample Author", "Sample Description", "   ");
        when(nytClient.getHardcoverFictionBestsellers()).thenReturn(List.of(bookWithBlankIsbn));
        
        String fallbackQuery = "intitle:\"Sample Title\" inauthor:\"Sample Author\"";
        when(googleBooksClient.search(fallbackQuery)).thenReturn(List.of(sampleGoogleBook));

        // Act
        List<BookRatingSummary> result = nytService.getAcclaimedBooks();

        // Assert
        assertEquals(1, result.size());
        verify(googleBooksClient, never()).search(startsWith("isbn:"));
        verify(googleBooksClient, times(1)).search(fallbackQuery);
    }

    @Test
    void testGetAcclaimedBooks_NoMatchSkipsBook() throws Exception {
        // Arrange
        when(nytClient.getHardcoverFictionBestsellers()).thenReturn(List.of(sampleNytBook));
        when(googleBooksClient.search("isbn:9781234567890")).thenReturn(List.of());
        
        String fallbackQuery = "intitle:\"Sample Title\" inauthor:\"Sample Author\"";
        when(googleBooksClient.search(fallbackQuery)).thenReturn(List.of());

        // Act
        List<BookRatingSummary> result = nytService.getAcclaimedBooks();

        // Assert
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetAcclaimedBooks_NytClientReturnsEmptyList() throws Exception {
        // Arrange
        when(nytClient.getHardcoverFictionBestsellers()).thenReturn(List.of());

        // Act
        List<BookRatingSummary> result = nytService.getAcclaimedBooks();

        // Assert
        assertTrue(result.isEmpty());
        verify(googleBooksClient, never()).search(anyString());
    }

    @Test
    void testGetAcclaimedBooks_NytClientThrowsException() throws Exception {
        // Arrange
        when(nytClient.getHardcoverFictionBestsellers()).thenThrow(new RuntimeException("API error"));

        // Act
        List<BookRatingSummary> result = nytService.getAcclaimedBooks();

        // Assert
        assertTrue(result.isEmpty());
    }
}
