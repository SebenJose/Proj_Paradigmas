package utfpr.com.Proj_Paradigmas.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import utfpr.com.Proj_Paradigmas.dto.AddBookToListRequest;
import utfpr.com.Proj_Paradigmas.dto.BookListRequest;
import utfpr.com.Proj_Paradigmas.exception.ConflictException;
import utfpr.com.Proj_Paradigmas.exception.ResourceNotFoundException;
import utfpr.com.Proj_Paradigmas.model.Book;
import utfpr.com.Proj_Paradigmas.model.BookList;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.repository.BookListRepository;
import utfpr.com.Proj_Paradigmas.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class BookListServiceTest {

    @Mock BookListRepository bookListRepository;
    @Mock UserRepository userRepository;
    @Mock BookService bookService;

    @InjectMocks BookListService bookListService;

    private User makeUser() {
        return User.builder()
                .id(1L)
                .username("joao")
                .email("joao@email.com")
                .passwordHash("hash")
                .createdAt(Instant.now())
                .build();
    }

    private Book makeBook(Long id, String googleBooksId) {
        return Book.builder().id(id).googleBooksId(googleBooksId).title("Livro " + id).build();
    }

    private BookList makeList(User user, List<Book> books) {
        return BookList.builder().id(1L).name("Favoritos").user(user).books(books).build();
    }

    @Test
    void createList_success() {
        User user = makeUser();
        when(userRepository.findByUsername("joao")).thenReturn(Optional.of(user));
        when(bookListRepository.existsByUserUsernameAndName("joao", "Favoritos")).thenReturn(false);
        when(bookListRepository.save(any(BookList.class))).thenAnswer(inv -> {
            BookList list = inv.getArgument(0);
            list.setId(1L);
            return list;
        });

        var response = bookListService.createList("joao", new BookListRequest("Favoritos"));

        assertThat(response.name()).isEqualTo("Favoritos");
        assertThat(response.books()).isEmpty();
        verify(bookListRepository).save(any(BookList.class));
    }

    @Test
    void createList_userNotFound_throwsNotFound() {
        when(userRepository.findByUsername("nobody")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookListService.createList("nobody", new BookListRequest("Favoritos")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createList_duplicateName_throwsConflict() {
        User user = makeUser();
        when(userRepository.findByUsername("joao")).thenReturn(Optional.of(user));
        when(bookListRepository.existsByUserUsernameAndName("joao", "Favoritos")).thenReturn(true);

        assertThatThrownBy(() -> bookListService.createList("joao", new BookListRequest("Favoritos")))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("nome");
    }

    @Test
    void addBookToList_success() {
        User user = makeUser();
        BookList bookList = makeList(user, new ArrayList<>());
        Book book = makeBook(2L, "xyz789");

        when(bookListRepository.findById(1L)).thenReturn(Optional.of(bookList));
        when(bookService.findOrCreate("xyz789")).thenReturn(book);
        when(bookListRepository.save(any(BookList.class))).thenReturn(bookList);

        var response = bookListService.addBookToList("joao", 1L, new AddBookToListRequest("xyz789", null, null));

        assertThat(response.books()).hasSize(1);
        assertThat(response.books().get(0).googleBooksId()).isEqualTo("xyz789");
    }

    @Test
    void addBookToList_listNotFound_throwsNotFound() {
        when(bookListRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookListService.addBookToList("joao", 99L, new AddBookToListRequest("xyz789", null, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void addBookToList_bookAlreadyInList_throwsConflict() {
        User user = makeUser();
        Book book = makeBook(2L, "xyz789");
        BookList bookList = makeList(user, new ArrayList<>(List.of(book)));

        when(bookListRepository.findById(1L)).thenReturn(Optional.of(bookList));
        when(bookService.findOrCreate("xyz789")).thenReturn(book);

        assertThatThrownBy(() -> bookListService.addBookToList("joao", 1L, new AddBookToListRequest("xyz789", null, null)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("já está");
    }

    @Test
    void removeBookFromList_success() {
        User user = makeUser();
        Book book = makeBook(2L, "xyz789");
        BookList bookList = makeList(user, new ArrayList<>(List.of(book)));

        when(bookListRepository.findById(1L)).thenReturn(Optional.of(bookList));
        when(bookListRepository.save(any(BookList.class))).thenReturn(bookList);

        var response = bookListService.removeBookFromList("joao", 1L, 2L);

        assertThat(response.books()).isEmpty();
    }

    @Test
    void removeBookFromList_bookNotInList_throwsNotFound() {
        User user = makeUser();
        BookList bookList = makeList(user, new ArrayList<>());

        when(bookListRepository.findById(1L)).thenReturn(Optional.of(bookList));

        assertThatThrownBy(() -> bookListService.removeBookFromList("joao", 1L, 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Livro não encontrado");
    }
}
