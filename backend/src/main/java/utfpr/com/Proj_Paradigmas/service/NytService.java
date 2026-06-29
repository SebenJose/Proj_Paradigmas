package utfpr.com.Proj_Paradigmas.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.core.task.TaskExecutor;
import utfpr.com.Proj_Paradigmas.dto.BookRatingSummary;
import utfpr.com.Proj_Paradigmas.dto.GoogleBookVolumeDto;
import utfpr.com.Proj_Paradigmas.dto.NytBestsellersResponseDto.NytBookDto;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
@Slf4j
public class NytService {
    private final NytClient nytClient;
    private final GoogleBooksClient googleBooksClient;
    private final TaskExecutor taskExecutor;
    
    private volatile List<BookRatingSummary> cache = List.of();
    private volatile LocalDateTime lastUpdated = LocalDateTime.MIN;
    private final AtomicBoolean isUpdating = new AtomicBoolean(false);
    
    public List<BookRatingSummary> getAcclaimedBooks() {
        if (cache.isEmpty() || lastUpdated.isBefore(LocalDateTime.now().minusHours(24))) {
            triggerAsyncUpdate();
        }
        return cache;
    }
    
    private void triggerAsyncUpdate() {
        if (isUpdating.compareAndSet(false, true)) {
            try {
                taskExecutor.execute(this::updateCache);
            } catch (Exception e) {
                log.error("Failed to submit cache update task to executor", e);
                isUpdating.set(false);
            }
        }
    }
    
    private void updateCache() {
        try {
            List<NytBookDto> nytBooks = nytClient.getHardcoverFictionBestsellers();
            if (nytBooks.isEmpty()) {
                this.lastUpdated = LocalDateTime.now().minusHours(24).plusMinutes(15); // Retry in 15 mins
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
                this.cache = List.copyOf(mappedBooks);
                this.lastUpdated = LocalDateTime.now();
            } else {
                this.lastUpdated = LocalDateTime.now().minusHours(24).plusMinutes(15); // Retry in 15 mins
            }
        } catch (Exception e) {
            log.error("Erro ao atualizar cache do NYT", e);
            this.lastUpdated = LocalDateTime.now().minusHours(24).plusMinutes(15); // Retry in 15 mins
        } finally {
            isUpdating.set(false);
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
