$( document ).ready( function() {
    $("div[load]").each(function (index) {
        $(this).load($(this).attr("load"))
    })
});
