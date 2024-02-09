//load the chart data
document.addEventListener("DOMContentLoaded", async () => {
  const eventName = document
    .getElementById("eventNameDisplay")
    .getAttribute("data-event-name"); //get the eventName from the title

  var actChart = document.getElementById("actionable").getContext("2d");
  var engChart = document.getElementById("engaging").getContext("2d");
  var insChart = document.getElementById("inspiring").getContext("2d");
  var intChart = document.getElementById("interactive").getContext("2d");
  var relChart = document.getElementById("relevant").getContext("2d");

  var dbEventInfo;

  fetch("/getData", {
    method: "POST",
    body: JSON.stringify({ eventName }), //send the name to get the right data
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      dbEventInfo = data;
      createDoughnut(actChart, dbEventInfo.Actionable);
      createDoughnut(engChart, dbEventInfo.Engaging);
      createDoughnut(insChart, dbEventInfo.Inspiring);
      createDoughnut(intChart, dbEventInfo.Interactive);
      createDoughnut(relChart, dbEventInfo.Relevant);
    })
    .catch((error) => {
      console.error(error);
    });
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
