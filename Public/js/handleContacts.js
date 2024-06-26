/** An event listener to generate a csv of contact data from the table display
 */
document.getElementById("exportButton").addEventListener("click", () => {
  // Prepare table data
  const tableData = [];
  const rows = document.querySelectorAll("#content table tbody tr");
  for (const row of rows) {
    const rowData = Array.from(row.children).map((cell) =>
      cell.textContent.trim(),
    );
    tableData.push(rowData.join(","));
  }

  // Create CSV content
  const csvContent = ["Event,Email,Name,Phone Number,Role", ...tableData].join(
    "\n",
  );

  // Create a Blob containing the CSV data
  const blob = new Blob([csvContent], {
    type: "text/csv",
  });

  // Create a link element and trigger a download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "exported_data.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
