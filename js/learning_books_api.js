document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookSearchForm');
    if (!form) return;

    const topicSelect = document.getElementById('bookTopic');
    const keywordInput = document.getElementById('bookKeywords');
    const searchButton = document.getElementById('bookSearchButton');
    const refreshButton = document.getElementById('bookRefreshButton');
    const status = document.getElementById('bookStatus');
    const results = document.getElementById('bookResults');
    const API_URL = 'https://openlibrary.org/search.json';
    const MAX_RESULTS = 9;
    const REQUEST_TIMEOUT_MS = 15000;
    let loading = false;

    function setStatus(message, state = '') {
        status.textContent = message;
        status.className = `learning-status mt-3 mb-3 ${state ? 'is-' + state : ''}`;
        status.setAttribute('role', state === 'error' ? 'alert' : 'status');
    }

    function setLoading(active) {
        loading = active;
        searchButton.disabled = active;
        refreshButton.disabled = active;
        topicSelect.disabled = active;
        keywordInput.disabled = active;
    }

    function coverElement(book) {
        const placeholder = document.createElement('div');
        placeholder.className = 'learning-book-cover learning-book-cover-placeholder';
        placeholder.textContent = 'books';
        placeholder.setAttribute('aria-hidden', 'true');

        const coverId = Number(book.cover_i);
        if (!Number.isSafeInteger(coverId) || coverId <= 0) return placeholder;

        const img = document.createElement('img');
        img.className = 'learning-book-cover';
        img.src = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg?default=false`;
        img.alt = '';
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        img.addEventListener('error', () => img.replaceWith(placeholder), { once: true });
        return img;
    }

    function renderBook(book) {
        const column = document.createElement('div');
        column.className = 'col-md-6 col-xl-4';
        const article = document.createElement('article');
        article.className = 'learning-book-card';
        const content = document.createElement('div');
        content.className = 'learning-book-content';

        const title = document.createElement('h3');
        title.textContent = book.title;

        const author = document.createElement('p');
        author.className = 'text-muted';
        author.textContent = Array.isArray(book.author_name) && book.author_name.length
            ? `By ${book.author_name.slice(0, 2).join(', ')}`
            : 'Author not listed';

        const year = document.createElement('p');
        year.className = 'small text-muted';
        year.textContent = Number.isInteger(book.first_publish_year)
            ? `First published: ${book.first_publish_year}`
            : 'Publication year not listed';

        const link = document.createElement('a');
        link.className = 'btn btn-outline-primary btn-sm mt-2';
        link.href = `https://openlibrary.org${book.key}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'View book';
        link.setAttribute('aria-label', `View ${book.title} on Open Library`);

        content.append(title, author, year, link);
        article.append(coverElement(book), content);
        column.appendChild(article);
        return column;
    }

    async function loadBooks() {
        if (loading) return;

        const topic = topicSelect.value.trim();
        const keywords = keywordInput.value.trim();
        const query = [topic, keywords].filter(Boolean).join(' ') || 'education';

        const params = new URLSearchParams({
            q: query,
            fields: 'key,title,author_name,first_publish_year,cover_i',
            limit: String(MAX_RESULTS)
        });
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        setLoading(true);
        results.replaceChildren();
        setStatus('Loading books from Open Library…', 'loading');

        try {
            const response = await fetch(`${API_URL}?${params.toString()}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Too many requests. Please wait a moment and try again.');
                }
                throw new Error(`Open Library returned HTTP ${response.status}. Please try again.`);
            }

            const data = await response.json();
            if (!data || !Array.isArray(data.docs)) {
                throw new Error('Open Library returned an unexpected data format.');
            }

            const books = data.docs.filter(book =>
                book && typeof book.title === 'string' && book.title.trim() &&
                typeof book.key === 'string' && /^\/works\/OL[0-9]+W$/.test(book.key)
            );

            if (!books.length) {
                setStatus('No books found for this search. Try different keywords or a course topic.');
                return;
            }

            const fragment = document.createDocumentFragment();
            books.forEach(book => fragment.appendChild(renderBook(book)));
            results.replaceChildren(fragment);
            const total = Number.isInteger(data.numFound) ? data.numFound : books.length;
            setStatus(`Showing ${books.length} of ${total.toLocaleString()} results for “${query}”.`, 'success');
        } catch (error) {
            if (controller.signal.aborted) {
                setStatus('The request timed out. Check your connection and click Refresh.', 'error');
            } else if (error instanceof TypeError) {
                setStatus('Could not connect to Open Library. Check your internet connection and try Refresh.', 'error');
            } else {
                setStatus(error.message || 'Unable to load books. Please try Refresh.', 'error');
            }
            results.replaceChildren();
        } finally {
            clearTimeout(timeout);
            setLoading(false);
        }
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        loadBooks();
    });
    topicSelect.addEventListener('change', loadBooks);
    refreshButton.addEventListener('click', loadBooks);

    loadBooks();
});
