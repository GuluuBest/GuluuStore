document.addEventListener("DOMContentLoaded", function () {
  initializeDateRangePicker();
  initializeCharts();
  initializeEventListeners();
  initializeModals();
});

function initializeDateRangePicker() {
  const dateRangeInput = document.getElementById("dateRange");

  if (dateRangeInput) {
    const ranges = {
      "Hari ini": [moment(), moment()],
      Kemarin: [moment().subtract(1, "days"), moment().subtract(1, "days")],
      "7 hari terakhir": [moment().subtract(6, "days"), moment()],
      "30 hari terakhir": [moment().subtract(29, "days"), moment()],
      "Bulan ini": [moment().startOf("month"), moment().endOf("month")],
      "Bulan lalu": [
        moment().subtract(1, "month").startOf("month"),
        moment().subtract(1, "month").endOf("month"),
      ],
    };

    $(dateRangeInput).daterangepicker(
      {
        startDate: moment(),
        endDate: moment(),
        ranges: ranges,
        locale: {
          format: "DD MMM YYYY",
          separator: " - ",
          applyLabel: "Terapkan",
          cancelLabel: "Batal",
          customRangeLabel: "Kustom",
          daysOfWeek: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
          monthNames: [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
          ],
        },
        opens: "left",
        alwaysShowCalendars: true,
      },
      function (start, end, label) {
        updateAnalyticsData(start, end, label);
      },
    );
  }
}

function initializeCharts() {
  const revenueCtx = document.getElementById("revenueChart");
  if (revenueCtx) {
    window.revenueChart = new Chart(revenueCtx, {
      type: "line",
      data: {
        labels: ["1 Mar", "2 Mar", "3 Mar", "4 Mar", "5 Mar", "6 Mar", "7 Mar"],
        datasets: [
          {
            label: "Pendapatan",
            data: [
              3200000, 4200000, 5100000, 5800000, 5200000, 6100000, 7300000,
            ],
            borderColor: "#4caf50",
            backgroundColor: "rgba(76, 175, 80, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
          {
            label: "Order",
            data: [12, 15, 18, 20, 16, 22, 25],
            borderColor: "#2196f3",
            backgroundColor: "rgba(33, 150, 243, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            labels: {
              color: "#fff",
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: "rgba(25, 30, 45, 0.95)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "#4caf50",
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label === "Pendapatan") {
                  if (context.parsed.y !== null) {
                    label += ": Rp " + context.parsed.y.toLocaleString();
                  }
                } else if (label === "Order") {
                  if (context.parsed.y !== null) {
                    label += ": " + context.parsed.y + " order";
                  }
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#fff",
            },
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Pendapatan (Rp)",
              color: "#4caf50",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#fff",
              callback: function (value) {
                if (value >= 1000000) {
                  return "Rp " + (value / 1000000).toFixed(1) + " Jt";
                }
                return "Rp " + value;
              },
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Jumlah Order",
              color: "#2196f3",
            },
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: "#fff",
            },
          },
        },
      },
    });
  }

  const categoryCtx = document.getElementById("categoryChart");
  if (categoryCtx) {
    window.categoryChart = new Chart(categoryCtx, {
      type: "doughnut",
      data: {
        labels: ["Periferal", "Aksesoris", "Video", "Furnitur", "Lainnya"],
        datasets: [
          {
            data: [45, 25, 15, 10, 5],
            backgroundColor: [
              "rgba(76, 175, 80, 0.8)",
              "rgba(33, 150, 243, 0.8)",
              "rgba(255, 193, 7, 0.8)",
              "rgba(156, 39, 176, 0.8)",
              "rgba(158, 158, 158, 0.8)",
            ],
            borderColor: [
              "rgba(76, 175, 80, 1)",
              "rgba(33, 150, 243, 1)",
              "rgba(255, 193, 7, 1)",
              "rgba(156, 39, 176, 1)",
              "rgba(158, 158, 158, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#fff",
              padding: 20,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(25, 30, 45, 0.95)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "#4caf50",
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value}% (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }
}

function initializeEventListeners() {
  const chartButtons = document.querySelectorAll(".chart-btn");
  chartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      chartButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      updateMainChartMetric(this.dataset.metric);
    });
  });

  const metricsPeriod = document.getElementById("metricsPeriod");
  if (metricsPeriod) {
    metricsPeriod.addEventListener("change", function () {
      updatePerformanceMetrics(this.value);
    });
  }

  const timePeriod = document.getElementById("timePeriod");
  if (timePeriod) {
    timePeriod.addEventListener("change", function () {
      updateTimeStats(this.value);
    });
  }

  const viewAllProductsBtn = document.getElementById("viewAllProducts");
  if (viewAllProductsBtn) {
    viewAllProductsBtn.addEventListener("click", function () {
      viewAllProducts();
    });
  }

  const exportReportBtn = document.getElementById("exportReportBtn");
  if (exportReportBtn) {
    exportReportBtn.addEventListener("click", function () {
      showExportModal();
    });
  }

  const printReportBtn = document.getElementById("printReportBtn");
  if (printReportBtn) {
    printReportBtn.addEventListener("click", function () {
      showPrintModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "e") {
      e.preventDefault();
      showExportModal();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "p") {
      e.preventDefault();
      showPrintModal();
    }

    if (e.key === "Escape") {
      const modals = document.querySelectorAll(".modal");
      modals.forEach((modal) => {
        if (modal.style.display === "flex") {
          modal.style.display = "none";
        }
      });
    }
  });
}

function initializeModals() {
  const modalCloseButtons = document.querySelectorAll(".modal-close");
  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal");
      modal.style.display = "none";
    });
  });

  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });
  });

  const cancelExportBtn = document.getElementById("cancelExport");
  if (cancelExportBtn) {
    cancelExportBtn.addEventListener("click", function () {
      document.getElementById("exportReportModal").style.display = "none";
    });
  }

  const cancelPrintBtn = document.getElementById("cancelPrint");
  if (cancelPrintBtn) {
    cancelPrintBtn.addEventListener("click", function () {
      document.getElementById("printReportModal").style.display = "none";
    });
  }

  const confirmPrintBtn = document.getElementById("confirmPrint");
  if (confirmPrintBtn) {
    confirmPrintBtn.addEventListener("click", function () {
      printReport();
    });
  }

  const exportForm = document.getElementById("exportReportForm");
  if (exportForm) {
    exportForm.addEventListener("submit", function (e) {
      e.preventDefault();
      exportReport();
    });
  }
}

function updateAnalyticsData(startDate, endDate, label) {
  const daysDiff = endDate.diff(startDate, "days") + 1;

  let revenueMultiplier = 1;
  let ordersMultiplier = 1;
  let customersMultiplier = 1;

  if (daysDiff === 1) {
    revenueMultiplier = 0.14;
    ordersMultiplier = 0.14;
    customersMultiplier = 0.14;
  } else if (daysDiff === 7) {
    revenueMultiplier = 1;
    ordersMultiplier = 1;
    customersMultiplier = 1;
  } else if (daysDiff === 30) {
    revenueMultiplier = 4.3;
    ordersMultiplier = 4.3;
    customersMultiplier = 4.3;
  }

  updateStats(revenueMultiplier, ordersMultiplier, customersMultiplier);
  updateChartsData(daysDiff);
  showLoadingAnimation();

  setTimeout(() => {
    hideLoadingAnimation();
    showNotification(
      "success",
      `Data analitik diperbarui untuk periode: ${label}`,
    );
  }, 1500);
}

function updateStats(revenueMult, ordersMult, customersMult) {
  const baseRevenue = 24500000;
  const baseOrders = 148;
  const baseCustomers = 48;
  const baseAvgOrder = 165500;

  const newRevenue = Math.round(baseRevenue * revenueMult);
  const newOrders = Math.round(baseOrders * ordersMult);
  const newCustomers = Math.round(baseCustomers * customersMult);
  const newAvgOrder = Math.round(baseAvgOrder * (revenueMult / ordersMult));

  const formattedRevenue = formatCurrency(newRevenue);
  const formattedAvgOrder = formatCurrency(newAvgOrder);

  const totalRevenue = document.getElementById("totalRevenue");
  const totalOrders = document.getElementById("totalOrders");
  const totalCustomers = document.getElementById("totalCustomers");
  const avgOrderValue = document.getElementById("avgOrderValue");

  if (totalRevenue) totalRevenue.textContent = formattedRevenue;
  if (totalOrders) totalOrders.textContent = newOrders;
  if (totalCustomers) totalCustomers.textContent = newCustomers;
  if (avgOrderValue) avgOrderValue.textContent = formattedAvgOrder;

  updateGoalProgress(newRevenue);
}

function updateChartsData(daysDiff) {
  if (!window.revenueChart || !window.categoryChart) return;

  let labels = [];
  let revenueData = [];
  let ordersData = [];

  if (daysDiff === 1) {
    labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
    revenueData = [120000, 180000, 850000, 1250000, 980000, 720000, 250000];
    ordersData = [2, 3, 12, 18, 14, 10, 4];
  } else if (daysDiff === 7) {
    labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    revenueData = [
      3200000, 4200000, 5100000, 5800000, 5200000, 6100000, 7300000,
    ];
    ordersData = [12, 15, 18, 20, 16, 22, 25];
  } else if (daysDiff === 30) {
    labels = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];
    revenueData = [12500000, 14500000, 13800000, 16500000];
    ordersData = [48, 56, 52, 62];
  } else {
    labels = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];
    revenueData = [12500000, 14500000, 13800000, 16500000];
    ordersData = [48, 56, 52, 62];
  }

  window.revenueChart.data.labels = labels;
  window.revenueChart.data.datasets[0].data = revenueData;
  window.revenueChart.data.datasets[1].data = ordersData;
  window.revenueChart.update();

  const newCategoryData = window.categoryChart.data.datasets[0].data.map(
    (value) => {
      const change = (Math.random() - 0.5) * 10;
      return Math.max(5, Math.round(value + (value * change) / 100));
    },
  );

  const total = newCategoryData.reduce((a, b) => a + b, 0);
  const normalizedData = newCategoryData.map((value) =>
    Math.round((value / total) * 100),
  );

  window.categoryChart.data.datasets[0].data = normalizedData;
  window.categoryChart.update();
}

function updateMainChartMetric(metric) {
  if (!window.revenueChart) return;

  const chart = window.revenueChart;

  let newData = [];
  let newLabel = "";
  let newColor = "";
  let newYAxis = "y";

  switch (metric) {
    case "revenue":
      return;

    case "orders":
      newData = [15, 18, 22, 25, 20, 28, 32];
      newLabel = "Order";
      newColor = "#2196f3";
      newYAxis = "y1";
      break;

    case "customers":
      newData = [8, 12, 15, 18, 14, 20, 22];
      newLabel = "Pelanggan Baru";
      newColor = "#ff9800";
      newYAxis = "y";
      break;
  }

  chart.data.datasets[0].data = newData;
  chart.data.datasets[0].label = newLabel;
  chart.data.datasets[0].borderColor = newColor;
  chart.data.datasets[0].backgroundColor = hexToRgba(newColor, 0.1);
  chart.data.datasets[0].yAxisID = newYAxis;

  chart.data.datasets[1].hidden = true;

  updateYAxisLabel(chart, metric);

  chart.update();
}

function updateYAxisLabel(chart, metric) {
  const yAxis = chart.options.scales.y;

  switch (metric) {
    case "orders":
      yAxis.title.text = "Jumlah Order";
      yAxis.ticks.callback = function (value) {
        return value;
      };
      break;

    case "customers":
      yAxis.title.text = "Pelanggan Baru";
      yAxis.ticks.callback = function (value) {
        return value;
      };
      break;
  }

  chart.options.scales.y1.display = false;
}

function updatePerformanceMetrics(period) {
  const metrics = document.querySelectorAll(".metric-item");
  metrics.forEach((metric) => {
    metric.classList.add("loading");
  });

  setTimeout(() => {
    metrics.forEach((metric) => {
      metric.classList.remove("loading");

      const valueElement = metric.querySelector(".metric-value");
      const changeElement = metric.querySelector(".metric-change");

      if (valueElement && changeElement) {
        const currentValue = valueElement.textContent;
        let newValue = currentValue;
        let newChange = changeElement.querySelector("span").textContent;

        if (period === "week") {
          if (valueElement.textContent.includes("%")) {
            const numValue = parseFloat(currentValue);
            newValue = (numValue * 0.8).toFixed(1) + "%";
          } else {
            const numValue = parseFloat(currentValue);
            newValue = (numValue * 0.8).toFixed(1);
          }
        } else if (period === "quarter") {
          if (valueElement.textContent.includes("%")) {
            const numValue = parseFloat(currentValue);
            newValue = (numValue * 1.2).toFixed(1) + "%";
          } else {
            const numValue = parseFloat(currentValue);
            newValue = (numValue * 1.2).toFixed(1);
          }
        }

        animateValueChange(valueElement, currentValue, newValue);

        const changeNum = parseFloat(newChange);
        const newChangeNum = Math.max(
          -10,
          Math.min(10, changeNum + (Math.random() - 0.5) * 2),
        );
        const newChangeText = newChangeNum.toFixed(1) + "%";

        changeElement.querySelector("span").textContent = newChangeText;

        if (newChangeNum >= 0) {
          changeElement.className = "metric-change positive";
          changeElement.querySelector("i").className = "fas fa-arrow-up";
        } else {
          changeElement.className = "metric-change negative";
          changeElement.querySelector("i").className = "fas fa-arrow-down";
        }
      }
    });

    showNotification(
      "info",
      `Metrik kinerja diperbarui untuk ${getPeriodText(period)}`,
    );
  }, 1000);
}

function updateTimeStats(period) {
  const timeItems = document.querySelectorAll(".time-item");
  timeItems.forEach((item) => {
    const fillElement = item.querySelector(".time-fill");
    const valueElement = item.querySelector(".time-value");

    if (fillElement && valueElement) {
      const currentWidth = parseFloat(fillElement.style.width);
      const currentValue = parseFloat(valueElement.textContent);

      let newWidth, newValue;

      if (period === "day") {
        newWidth = Math.max(
          10,
          Math.min(80, currentWidth + (Math.random() - 0.5) * 20),
        );
        newValue = Math.round(newWidth) + "%";
      } else if (period === "month") {
        newWidth =
          [25, 45, 30, 50][Array.from(timeItems).indexOf(item)] || currentWidth;
        newValue = newWidth + "%";
      } else {
        newWidth =
          [25, 45, 30, 40][Array.from(timeItems).indexOf(item)] || currentWidth;
        newValue = newWidth + "%";

        if (
          item.querySelector(".time-label").textContent === "Weekend vs Weekday"
        ) {
          const weekendFill = item.querySelector(".time-fill.weekend");
          const weekdayFill = item.querySelector(".time-fill.weekday");
          if (weekendFill && weekdayFill) {
            weekendFill.style.width = "40%";
            weekdayFill.style.width = "60%";
            valueElement.textContent = "40% / 60%";
            return;
          }
        }
      }

      fillElement.style.width = newWidth + "%";
      valueElement.textContent = newValue;
    }
  });

  showNotification(
    "info",
    `Statistik waktu diperbarui untuk tampilan ${getPeriodText(period)}`,
  );
}

function viewAllProducts() {
  showNotification("info", "Membuka halaman produk dengan filter penjualan");
}

function showExportModal() {
  const modal = document.getElementById("exportReportModal");
  if (modal) {
    modal.style.display = "flex";

    const dateRangeInput = document.getElementById("dateRange");
    if (dateRangeInput) {
      const currentRange = dateRangeInput.value;
      const exportPeriod = document.getElementById("exportPeriod");

      if (exportPeriod) {
        if (currentRange === "Hari ini") {
          exportPeriod.value = "today";
        } else if (currentRange === "7 hari terakhir") {
          exportPeriod.value = "week";
        } else if (currentRange === "Bulan ini") {
          exportPeriod.value = "month";
        } else {
          exportPeriod.value = "custom";
        }
      }
    }
  }
}

function showPrintModal() {
  const modal = document.getElementById("printReportModal");
  if (modal) {
    modal.style.display = "flex";

    const dateRangeInput = document.getElementById("dateRange");
    const previewPeriod = modal.querySelector(".preview-header p");

    if (dateRangeInput && previewPeriod) {
      previewPeriod.textContent = `Periode: ${dateRangeInput.value}`;
    }
  }
}

function exportReport() {
  const reportType = document.getElementById("reportType").value;
  const exportFormat = document.getElementById("exportFormat").value;
  const exportPeriod = document.getElementById("exportPeriod").value;
  const includeCharts = document.getElementById("includeCharts").checked;

  if (!reportType || !exportFormat) {
    showNotification("error", "Harap pilih jenis laporan dan format file");
    return;
  }

  showLoadingAnimation();

  setTimeout(() => {
    hideLoadingAnimation();
    document.getElementById("exportReportModal").style.display = "none";
    document.getElementById("exportReportForm").reset();
    showNotification(
      "success",
      `Laporan berhasil diekspor dalam format ${exportFormat.toUpperCase()}`,
    );
  }, 2000);
}

function printReport() {
  const printType = document.getElementById("printType").value;
  const orientation = document.querySelector(
    'input[name="orientation"]:checked',
  ).value;
  const includeCharts = document.getElementById("printCharts").checked;
  const includeDate = document.getElementById("printDate").checked;

  if (!printType) {
    showNotification("error", "Harap pilih jenis cetakan");
    return;
  }

  const printContent = generatePrintContent(
    printType,
    orientation,
    includeCharts,
    includeDate,
  );

  const printWindow = window.open("", "_blank");
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();

    document.getElementById("printReportModal").style.display = "none";
    showNotification("success", "Laporan berhasil dicetak");
  }, 1000);
}

// Generate print content
function generatePrintContent(
  printType,
  orientation,
  includeCharts,
  includeDate,
) {
  const dateRangeInput = document.getElementById("dateRange");
  const currentRange = dateRangeInput ? dateRangeInput.value : "Hari ini";
  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Laporan Analitik - Guluu Store</title>
            <style>
                @media print {
                    @page {
                        size: ${orientation === "landscape" ? "landscape" : "portrait"};
                        margin: 20mm;
                    }
                    
                    body {
                        font-family: 'Poppins', Arial, sans-serif;
                        color: #333;
                        line-height: 1.6;
                    }
                    
                    .print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #4caf50;
                    }
                    
                    .print-header h1 {
                        color: #333;
                        margin: 0;
                        font-size: 24px;
                    }
                    
                    .print-header p {
                        color: #666;
                        margin: 5px 0;
                    }
                    
                    .print-date {
                        text-align: right;
                        color: #666;
                        font-size: 14px;
                        margin-bottom: 20px;
                    }
                    
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 15px;
                        margin-bottom: 30px;
                    }
                    
                    .stat-card {
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 15px;
                        text-align: center;
                    }
                    
                    .stat-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #4caf50;
                        margin-bottom: 5px;
                    }
                    
                    .stat-label {
                        font-size: 14px;
                        color: #666;
                    }
                    
                    .section-title {
                        font-size: 18px;
                        color: #333;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 10px;
                        margin-top: 30px;
                        margin-bottom: 20px;
                    }
                    
                    .chart-container {
                        page-break-inside: avoid;
                        margin-bottom: 30px;
                    }
                    
                    .chart-placeholder {
                        height: 300px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #666;
                        font-style: italic;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    
                    th {
                        background-color: #f5f5f5;
                        font-weight: 600;
                        text-align: left;
                        padding: 12px;
                        border-bottom: 2px solid #ddd;
                    }
                    
                    td {
                        padding: 10px 12px;
                        border-bottom: 1px solid #ddd;
                    }
                    
                    .footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        color: #666;
                        font-size: 12px;
                        text-align: center;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>Laporan Analitik Guluu Store</h1>
                <p>Periode: ${currentRange}</p>
            </div>
            
            ${includeDate ? `<div class="print-date">Dicetak pada: ${currentDate}</div>` : ""}
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">Rp 24.5 Jt</div>
                    <div class="stat-label">Total Pendapatan</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">148</div>
                    <div class="stat-label">Total Order</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">48</div>
                    <div class="stat-label">Pelanggan Baru</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">Rp 165.5k</div>
                    <div class="stat-label">Rata-rata Order</div>
                </div>
            </div>
            
            ${
              includeCharts
                ? `
                <h2 class="section-title">Grafik Performa</h2>
                <div class="chart-container">
                    <div class="chart-placeholder">
                        [Grafik Pendapatan & Order]
                    </div>
                </div>
            `
                : ""
            }
            
            <h2 class="section-title">Produk Terlaris</h2>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Produk</th>
                        <th>Kategori</th>
                        <th>Terjual</th>
                        <th>Pendapatan</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>Keyboard Mechanical X1</td>
                        <td>Periferal</td>
                        <td>42</td>
                        <td>Rp 18.9 Jt</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Mouse Wireless Pro</td>
                        <td>Periferal</td>
                        <td>38</td>
                        <td>Rp 12.2 Jt</td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>USB-C Hub 7in1</td>
                        <td>Aksesoris</td>
                        <td>35</td>
                        <td>Rp 9.8 Jt</td>
                    </tr>
                    <tr>
                        <td>4</td>
                        <td>Webcam 4K + Mic</td>
                        <td>Video</td>
                        <td>28</td>
                        <td>Rp 24.9 Jt</td>
                    </tr>
                    <tr>
                        <td>5</td>
                        <td>Monitor Stand Adjustable</td>
                        <td>Furnitur</td>
                        <td>25</td>
                        <td>Rp 16.3 Jt</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="footer">
                Laporan ini dibuat secara otomatis oleh sistem Guluu Store Admin Panel.<br>
                &copy; ${new Date().getFullYear()} Guluu Store. Hak Cipta Dilindungi.
            </div>
        </body>
        </html>
    `;
}

function updateGoalProgress(currentRevenue) {
  const goalTarget = 30000000;
  const progress = Math.min(100, (currentRevenue / goalTarget) * 100);

  const progressFill = document.querySelector(".progress-fill");
  const progressText = document.querySelector(".progress-text");

  if (progressFill && progressText) {
    progressFill.style.width = progress + "%";
    progressText.textContent = progress.toFixed(1) + "%";
  }

  const remaining = Math.max(0, goalTarget - currentRevenue);
  const remainingElement = document.querySelector(".goal-remaining");

  if (remainingElement) {
    remainingElement.textContent = `Sisa: Rp ${(remaining / 1000000).toFixed(1)} Jt`;
  }
}

function formatCurrency(amount) {
  if (amount >= 1000000) {
    return "Rp " + (amount / 1000000).toFixed(1) + " Jt";
  } else if (amount >= 1000) {
    return "Rp " + (amount / 1000).toFixed(1) + " Rb";
  }
  return "Rp " + amount;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getPeriodText(period) {
  const periodMap = {
    day: "Harian",
    week: "Mingguan",
    month: "Bulanan",
    quarter: "Kuartalan",
    year: "Tahunan",
  };
  return periodMap[period] || period;
}

function showLoadingAnimation() {
  const content = document.querySelector(".content-wrapper");
  if (content) {
    content.classList.add("loading");
  }

  const loadingIndicator = document.createElement("div");
  loadingIndicator.className = "loading-overlay";
  loadingIndicator.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat data analitik...</p>
    </div>
  `;

  document.querySelector(".content-area").appendChild(loadingIndicator);
}

function hideLoadingAnimation() {
  const content = document.querySelector(".content-wrapper");
  if (content) {
    content.classList.remove("loading");
  }

  const loadingIndicator = document.querySelector(".loading-overlay");
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
}

function showNotification(type, message) {
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close">
      <i class="fas fa-times"></i>
    </button>
  `;

  document.body.appendChild(notification);

  const closeBtn = notification.querySelector(".notification-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      notification.remove();
    });
  }

  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

function animateValueChange(element, startValue, endValue) {
  const isCurrency = startValue.includes("Rp");
  const isPercentage = startValue.includes("%");

  let startNum, endNum;

  if (isCurrency) {
    startNum = parseFloat(startValue.replace(/[^0-9.]/g, ""));
    endNum = parseFloat(endValue.replace(/[^0-9.]/g, ""));
  } else if (isPercentage) {
    startNum = parseFloat(startValue);
    endNum = parseFloat(endValue);
  } else {
    startNum = parseFloat(startValue);
    endNum = parseFloat(endValue);
  }

  const duration = 1000;
  const startTime = Date.now();

  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOutQuad = (progress) => progress * (2 - progress);

    const current = startNum + (endNum - startNum) * easeOutQuad(progress);

    if (isCurrency) {
      element.textContent = formatCurrency(current);
    } else if (isPercentage) {
      element.textContent = current.toFixed(1) + "%";
    } else {
      element.textContent = current.toFixed(1);
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  update();
}
