# Spec: Integração do Visualizador de Prévia do Google Books

## Objetivo
Adicionar uma aba interativa com a prévia de leitura do livro usando a API do Google Books Embedded Viewer na página de detalhes do livro, exibindo-a apenas quando a prévia estiver disponível e for incorporável.

## Decisões de Design
- **Posicionamento:** Aba dedicada ("Prévia") ao lado das abas de "Sinopse" e "Críticas".
- **Tratamento de Disponibilidade:** A aba será totalmente ocultada caso o livro não possua uma prévia incorporável cadastrada no Google Books (validado pela propriedade `embeddable` da API).
- **Dimensões:** Altura fixa de `600px` com largura responsiva (`100%`).
- **Arquitetura:** Abordagem híbrida. O backend em Spring Boot consulta a API do Google Books no carregamento/criação do livro, mapeia a propriedade `accessInfo.embeddable`, salva-a no banco de dados e repassa como booleano no payload de detalhes. O frontend Next.js usa essa flag para decidir se exibe ou oculta a aba e carrega o visualizador dinamicamente apenas ao clicar na aba.

## Detalhes Técnicos de Implementação

### 1. Backend (Spring Boot)

- **`GoogleBookVolumeDto.java`**
  - Mapear a propriedade `accessInfo.embeddable` da API do Google Books.
  - Adicionar a estrutura de record aninhada:
    ```java
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AccessInfo(Boolean embeddable) {}
    ```
  - Atualizar o record principal `GoogleBookVolumeDto` para incluir `AccessInfo accessInfo`.

- **`Book.java` (Entidade)**
  - Adicionar o campo `private Boolean embeddable;` na entidade.

- **`BookDetailResponse.java` (DTO de Retorno)**
  - Adicionar o campo `Boolean embeddable` no construtor e record de resposta.

- **`BookService.java`**
  - No mapeamento `toEntity`, preencher `embeddable` a partir de `dto.accessInfo().embeddable()`.
  - No mapeamento `toDetailResponse`, preencher `embeddable` a partir da entidade `Book`.

### 2. Frontend (Next.js / React)

- **`frontend/src/features/books/types.ts`**
  - Adicionar `embeddable?: boolean;` na interface `BookDetail`.

- **`frontend/src/features/books/components/BookPreview.tsx` [NEW]**
  - Criar um componente de cliente (`"use client"`) para encapsular o visualizador.
  - Injetar dinamicamente o script `https://www.google.com/books/jsapi.js` no corpo do documento se ele já não estiver presente.
  - Exibir um estado de carregamento (Spinner) enquanto o script e o visualizador carregam.
  - Tratar possíveis erros de inicialização exibindo uma mensagem amigável no lugar do canvas caso o carregamento falhe.
  - Limpar qualquer referência ou escuta assíncrona ao desmontar o componente (`useEffect` cleanup).

- **`frontend/src/features/books/components/BookDetailView.tsx`**
  - Refatorar a visualização para adicionar navegação por abas (`synopsis` | `reviews` | `preview`).
  - Renderizar a aba `preview` condicionalmente com base em `book.embeddable`.
  - Carregar preguiçosamente o componente `<BookPreview googleBooksId={book.googleBooksId} />` somente quando a aba de prévia estiver ativa.

## Plano de Verificação

### Testes Manuais
1. **Com Prévia Disponível:** Acessar um livro conhecido por ter prévia disponível (ex: buscar "Clean Code" ou "Java"). Verificar se a aba "Prévia" aparece, e se ao clicar nela o visualizador renderiza perfeitamente com a altura de 600px.
2. **Sem Prévia Disponível:** Buscar um livro obscuro ou que sabidamente não possua prévia liberada pelo Google. Verificar se a aba "Prévia" não é exibida na tela.
3. **Persistência de Dados:** Verificar se a coluna `embeddable` é criada corretamente no banco de dados e populada de forma persistente após a primeira consulta de detalhes do livro.
