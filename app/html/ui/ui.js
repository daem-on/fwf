$( document ).ready( function() {
    renderPage();
});

function renderPage() {
    $("div[load]").each(function (index) {
        $(this).load($(this).attr("load"));
        $(this).removeAttr("load");
    })
}
