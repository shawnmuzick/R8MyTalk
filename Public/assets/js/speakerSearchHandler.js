// JavaScript for handling search functionality (current code you see is for testing, not final)
$(document).ready(() => {
  $("#searchInput").on("keyup", function () {
    const value = $(this).val().toLowerCase();
    $("tbody tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});
