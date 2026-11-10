$(document).ready(function () {
    let currentCategory = 'all';

    $('.filter-buttons .btn').on('click', function () {
        $('.filter-buttons .btn').removeClass('active');
        $(this).addClass('active');

        currentCategory = $(this).data('category');
        filterContent();
    });

    $('#searchInput').on('input', function () {
        filterContent();
    });

    function filterContent() {
        const searchQuery = $('#searchInput').val().toLowerCase().trim();
        let visibleCount = 0;

        $('.course-item').each(function () {
            const $item = $(this);
            const itemCategory = $item.data('category');
            const itemText = $item.text().toLowerCase();

            const matchesCategory = (currentCategory === 'all' || itemCategory === currentCategory);
            const matchesSearch = itemText.includes(searchQuery);

            if (matchesCategory && matchesSearch) {
                $item.show();
                visibleCount++;
            } else {
                $item.hide();
            }
        });

        if (visibleCount === 0) {
            $('#noResults').show();
        } else {
            $('#noResults').hide();
        }
    }
});
