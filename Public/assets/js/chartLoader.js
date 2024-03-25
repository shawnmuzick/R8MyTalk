//load the chart data
document.addEventListener("DOMContentLoaded", async () => {
  try {
    var dbEventInfo;
    const eventNameElement = document.getElementById("eventNameDisplay");
    const eventName = eventNameElement.getAttribute("data-event-name"); //get the eventname from the title
    var actChart = document.getElementById("actionable")?.getContext("2d");
    var engChart = document.getElementById("engaging")?.getContext("2d");
    var insChart = document.getElementById("inspiring")?.getContext("2d");
    var intChart = document.getElementById("interactive")?.getContext("2d");
    var relChart = document.getElementById("relevant")?.getContext("2d");

    const response = await fetch("/getData", {
      method: "POST",
      body: JSON.stringify({ eventName }), //send the name to get the right data
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log("error response");
      throw new Error("Failed to fetch data");
    }

    /**
     * if any of the canvases are missing, the template didn't render them
     * because there was no feedback, abort this handler.
     */
    if (!actChart || !engChart || !insChart || !intChart || !relChart) {
      return;
    }

    dbEventInfo = await response.json();
    createDoughnut(actChart, dbEventInfo.Actionable);
    createDoughnut(engChart, dbEventInfo.Engaging);
    createDoughnut(insChart, dbEventInfo.Inspiring);
    createDoughnut(intChart, dbEventInfo.Interactive);
    createDoughnut(relChart, dbEventInfo.Relevant);

    // Event listener attached to button on eventPage.ejs to download CSV report
    document
      .getElementById("downloadReportButton")
      .addEventListener("click", () => {
        downloadCSV(dbEventInfo);
      });
  } catch (error) {
    // Message will show up in error-message div on eventPage.ejs if caught
    const errorMessageElement = document.getElementById("error-message");
    errorMessageElement.textContent = "An error occurred: " + error.message;
  }
});

function createDoughnut(canvasElement, data) {
  return new Chart(canvasElement, {
    type: "doughnut",
    data: {
      //labels: ['Hate', 'Sad', 'Ok', 'Liked', 'Loved'],
      datasets: [
        {
          label: "# of Votes",
          data: Object.values(data),
          backgroundColor: [
            "rgb(255, 0, 0)",
            "rgb(255, 167, 0)",
            "rgb(255, 244, 0)",
            "rgb(163, 255, 0)",
            "rgb(44, 186, 0)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      cutoutPercentage: 50, //idk if this is doing anything
    },
  });
}

// functions used for downloadable report
function downloadCSV(data) {
  // Prepare CSV content
  let csvContent = "Category,Hate,Sad,Ok,Liked,Loved\n";
  csvContent += prepareCSVRow("Actionable", data.Actionable);
  csvContent += prepareCSVRow("Engaging", data.Engaging);
  csvContent += prepareCSVRow("Inspiring", data.Inspiring);
  csvContent += prepareCSVRow("Interactive", data.Interactive);
  csvContent += prepareCSVRow("Relevant", data.Relevant);

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
}

function prepareCSVRow(label, data) {
  return `${label},${Object.values(data).join(",")}\n`;
}
