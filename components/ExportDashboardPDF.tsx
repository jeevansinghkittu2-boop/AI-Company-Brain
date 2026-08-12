"use client";

import jsPDF from "jspdf";

interface Props {
  totalDocuments: number;
  pdfCount: number;
  docxCount: number;
  txtCount: number;
  totalWords: number;
  storageMB: string;
  positive: number;
  neutral: number;
  negative: number;
  averageWords: number;
}

export default function ExportDashboardPDF({
  totalDocuments,
  pdfCount,
  docxCount,
  txtCount,
  totalWords,
  storageMB,
  positive,
  neutral,
  negative,
  averageWords,
}: Props) {
  function exportPDF() {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("AI Company Brain Report", 20, 20);

    doc.setFontSize(12);

    let y = 40;

    const rows = [
      ["Total Documents", totalDocuments],
      ["PDF Files", pdfCount],
      ["DOCX Files", docxCount],
      ["TXT Files", txtCount],
      ["Total Words", totalWords],
      ["Average Words / Document", averageWords],
      ["Storage Used", `${storageMB} MB`],
      ["Positive Documents", positive],
      ["Neutral Documents", neutral],
      ["Negative Documents", negative],
      ["Generated", new Date().toLocaleString()],
    ];

    rows.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 20, y);
      y += 10;
    });

    doc.save("AI-Company-Brain-Report.pdf");
  }

  return (
    <button
      onClick={exportPDF}
      className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl"
    >
      Export Dashboard PDF
    </button>
  );
}