package utfpr.com.Proj_Paradigmas.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utfpr.com.Proj_Paradigmas.dto.AddBookToListRequest;
import utfpr.com.Proj_Paradigmas.dto.BookListRequest;
import utfpr.com.Proj_Paradigmas.dto.BookListResponse;
import utfpr.com.Proj_Paradigmas.dto.BookSummaryResponse;
import utfpr.com.Proj_Paradigmas.exception.ConflictException;
import utfpr.com.Proj_Paradigmas.exception.ResourceNotFoundException;
import utfpr.com.Proj_Paradigmas.model.Book;
import utfpr.com.Proj_Paradigmas.model.BookList;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.repository.BookListRepository;
import utfpr.com.Proj_Paradigmas.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class BookListService {

    private final BookListRepository bookListRepository;
    private final UserRepository userRepository;
    private final BookService bookService;

    @Transactional(readOnly = true)
    public List<BookListResponse> getUserLists(String username) {
        return bookListRepository.findByUserUsername(username)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BookListResponse createList(String username, BookListRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (bookListRepository.existsByUserUsernameAndName(username, request.name())) {
            throw new ConflictException("Você já possui uma lista com esse nome");
        }

        BookList bookList = BookList.builder()
                .name(request.name())
                .user(user)
                .build();

        BookList savedList = bookListRepository.save(bookList);
        return toResponse(savedList);
    }

    @Transactional
    public BookListResponse addBookToList(String username, Long listId, AddBookToListRequest request) {
        BookList bookList = bookListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Lista não encontrada"));

        if (!bookList.getUser().getUsername().equals(username)) {
            throw new ResourceNotFoundException("Lista não encontrada");
        }

        Book book = bookService.findOrCreate(request.googleBooksId());

        if (bookList.getBooks().stream().anyMatch(b -> b.getId().equals(book.getId()))) {
            throw new ConflictException("O livro já está nesta lista");
        }

        bookList.getBooks().add(book);
        BookList savedList = bookListRepository.save(bookList);
        return toResponse(savedList);
    }

    @Transactional
    public BookListResponse removeBookFromList(String username, Long listId, Long bookId) {
        BookList bookList = bookListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Lista não encontrada"));

        if (!bookList.getUser().getUsername().equals(username)) {
            throw new ResourceNotFoundException("Lista não encontrada");
        }

        boolean removed = bookList.getBooks().removeIf(book -> book.getId().equals(bookId));
        if (!removed) {
            throw new ResourceNotFoundException("Livro não encontrado nesta lista");
        }

        BookList savedList = bookListRepository.save(bookList);
        return toResponse(savedList);
    }

    private BookListResponse toResponse(BookList list) {
        List<BookSummaryResponse> books = list.getBooks().stream()
                .map(this::toSummaryResponse)
                .toList();
        return new BookListResponse(list.getId(), list.getName(), books);
    }

    private BookSummaryResponse toSummaryResponse(Book book) {
        return new BookSummaryResponse(book.getId(), book.getGoogleBooksId(), book.getTitle(), book.getCoverUrl());
    }
}
