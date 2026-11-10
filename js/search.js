$(document).ready(function () {
    let currentCategory = 'all';

    const $filterButtons = $('.filter-buttons .btn');
    const $searchInput = $('#searchInput');
    const $courseItems = $('.course-item');
    const $noResults = $('#noResults');

    $filterButtons.on('click', function () {
        $filterButtons.removeClass('active');
        $(this).addClass('active');

        currentCategory = $(this).data('category');
        filterContent();
    });

    $searchInput.on('input', function () {
        filterContent();
    });

    function filterContent() {
        const searchQuery = $searchInput.val().toLowerCase().trim();
        let visibleCount = 0;

        $courseItems.each(function () {
            const $item = $(this);
            const itemCategory = $item.data('category');
            
            const titleText = $item.find('h2').text().toLowerCase();
            const descText = $item.find('p').text().toLowerCase();

            const matchesCategory = (currentCategory === 'all' || itemCategory === currentCategory);
            const matchesSearch = titleText.includes(searchQuery) || descText.includes(searchQuery);

            if (matchesCategory && matchesSearch) {
                $item.show();
                visibleCount++;
            } else {
                $item.hide();
            }
        });

        if (visibleCount === 0) {
            $noResults.show();
        } else {
            $noResults.hide();
        }
    }
});
