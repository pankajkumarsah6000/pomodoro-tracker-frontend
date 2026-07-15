import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function minutesBetween(start, end) {
  return Math.max(0, (new Date(end) - new Date(start)) / 60000);
}

export function exportSessionsCSV(sessions, tasks) {
  const taskTitle = (id) => tasks.find((t) => t.id === id)?.title || "";
  const header = [
    "Date",
    "Mode",
    "Task",
    "Start Time",
    "End Time",
    "Planned Minutes",
    "Actual Minutes",
    "Completed",
  ];
  const rows = sessions.map((s) => [
    new Date(s.startTime).toLocaleDateString(),
    s.mode,
    taskTitle(s.taskId),
    new Date(s.startTime).toLocaleTimeString(),
    new Date(s.endTime).toLocaleTimeString(),
    s.plannedMinutes,
    Math.round(minutesBetween(s.startTime, s.endTime)),
    s.completed ? "Yes" : "No",
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `embers-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAnalyticsPDF({ summary, daily, weekly, streaks, userName }) {
  const doc = new jsPDF();
  const marginX = 14;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Embers — Productivity Report", marginX, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(
    `${userName ? userName + " · " : ""}Generated ${new Date().toLocaleString()}`,
    marginX,
    y
  );
  y += 10;

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Summary", marginX, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    head: [["Metric", "Value"]],
    body: [
      ["Total focus sessions", summary?.totalSessions ?? "—"],
      ["Total focus hours", `${summary?.totalFocusHours ?? "—"}h`],
      ["Today's focus minutes", summary?.todaysFocusMinutes ?? "—"],
      ["Tasks completed", `${summary?.completedTasks ?? "—"} / ${summary?.totalTasks ?? "—"}`],
      ["Current streak", `${streaks?.currentStreak ?? "—"} day(s)`],
      ["Longest streak", `${streaks?.longestStreak ?? "—"} day(s)`],
    ],
    theme: "striped",
    headStyles: { fillColor: [242, 103, 61] },
    styles: { fontSize: 10 },
  });

  y = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Daily Sessions (last 7 days)", marginX, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    head: [["Day", "Sessions", "Focus Minutes"]],
    body: (daily || []).map((d) => [d.label, d.sessions, d.focusMinutes]),
    theme: "striped",
    headStyles: { fillColor: [242, 103, 61] },
    styles: { fontSize: 10 },
  });

  y = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Weekly Report", marginX, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    head: [["Week", "Sessions", "Focus Hours"]],
    body: (weekly || []).map((w) => [w.week, w.sessions, w.focusHours]),
    theme: "striped",
    headStyles: { fillColor: [242, 103, 61] },
    styles: { fontSize: 10 },
  });

  if (streaks?.badges?.length) {
    y = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Achievements", marginX, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      margin: { left: marginX },
      head: [["Badge", "Description", "Earned"]],
      body: streaks.badges.map((b) => [b.label, b.desc, b.earned ? "Yes" : "No"]),
      theme: "striped",
      headStyles: { fillColor: [242, 103, 61] },
      styles: { fontSize: 10 },
    });
  }

  doc.save(`embers-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
