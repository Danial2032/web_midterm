$(function () {
    const $questions = $('#eduacademy-faq .faq-question');

    $questions.on('click', function () {
        const $clicked = $(this);
        const wasExpanded = $clicked.attr('aria-expanded') === 'true';

        $questions.not(this).each(function () {
            const $question = $(this);

            if ($question.attr('aria-expanded') === 'true') {
                const panelId = $question.attr('aria-controls');

                $question.attr('aria-expanded', 'false');
                $question.find('.faq-indicator').text('+');

                $('#' + panelId).stop(true, true).slideUp(200);
            }
        });

        const panelId = $clicked.attr('aria-controls');

        $clicked.attr('aria-expanded', String(!wasExpanded));
        $clicked.find('.faq-indicator').text(wasExpanded ? '+' : '−');

        $('#' + panelId).stop(true, true).slideToggle(200);
    });
});
