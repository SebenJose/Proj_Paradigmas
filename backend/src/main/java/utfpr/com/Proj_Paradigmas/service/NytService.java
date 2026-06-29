package utfpr.com.Proj_Paradigmas.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import utfpr.com.Proj_Paradigmas.dto.BookRatingSummary;
import utfpr.com.Proj_Paradigmas.dto.GoogleBookVolumeDto;
import utfpr.com.Proj_Paradigmas.dto.NytBestsellersResponseDto.NytBookDto;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NytService {
    private final NytClient nytClient;
    private final GoogleBooksClient googleBooksClient;
    
    private List<BookRatingSummary> cache = Collections.synchronizedList(new ArrayList<>());
    private LocalDateTime lastUpdated = LocalDateTime.MIN;
    private boolean isUpdating = false;
    
    public List<BookRatingSummary> getAcclaimedBooks() {
        if (cache.isEmpty() || lastUpdated.isBefore(LocalDateTime.now().minusHours(24))) {
            triggerAsyncUpdate();
        }
        return cache;
    }
    
    private synchronized void triggerAsyncUpdate() {
        if (isUpdating) return;
        isUpdating = true;
        new Thread(this::updateCache).start();
    }
    
    private void updateCache() {
        try {
            List<NytBookDto> nytBooks = nytClient.getHardcoverFictionBestsellers();
            if (nytBooks.isEmpty()) {
                isUpdating = false;
                return;
            }
            
            List<BookRatingSummary> mappedBooks = new ArrayList<>();
            for (NytBookDto nytBook : nytBooks) {
                Optional<GoogleBookVolumeDto> optGoogleBook = resolveToGoogleBook(nytBook);
                if (optGoogleBook.isPresent()) {
                    GoogleBookVolumeDto gBook = optGoogleBook.get();
                    GoogleBookVolumeDto.VolumeInfo info = gBook.volumeInfo();
                    String thumbnail = info.imageLinks() != null ? info.imageLinks().thumbnail() : null;
                    mappedBooks.add(new BookRatingSummary(gBook.id(), info.title(), thumbnail, 4.5, 0L));
                }
            }
            
            if (!mappedBooks.isEmpty()) {
                cache.clear();
                cache.addAll(mappedBooks);
                lastUpdated = LocalDateTime.now();
            }
        } catch (Exception e) {
            log.error("Erro ao atualizar cache do NYT", e);
        } finally {
            isUpdating = false;
        }
    }
    
    private Optional<GoogleBookVolumeDto> resolveToGoogleBook(NytBookDto nytBook) {
        if (nytBook.isbn13() != null && !nytBook.isbn13().isBlank()) {
            List<GoogleBookVolumeDto> items = googleBooksClient.search("isbn:" + nytBook.isbn13());
            if (!items.isEmpty()) {
                return Optional.of(items.get(0));
            }
        }
        String fallbackQuery = "intitle:\"" + nytBook.title() + "\" inauthor:\"" + nytBook.author() + "\"";
        List<GoogleBookVolumeDto> items = googleBooksClient.search(fallbackQuery);
        if (!items.isEmpty()) {
            return Optional.of(items.get(0));
        }
        return Optional.empty();
    }
}
