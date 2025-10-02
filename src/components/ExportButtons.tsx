import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Movement, CATEGORY_LABELS, SETTORE_LABELS, METODO_LABELS } from "@/types/movement";

interface ExportButtonsProps {
  movements: Movement[];
  totalEntrate: number;
  totalUscite: number;
  saldo: number;
}

export const ExportButtons = ({ movements, totalEntrate, totalUscite, saldo }: ExportButtonsProps) => {
  const { toast } = useToast();

  const exportToCSV = () => {
    const headers = ["Data", "Tipo", "Settore", "Metodo Pagamento", "Descrizione", "Categoria", "Importo"];
    const rows = movements.map((m) => [
      new Date(m.data).toLocaleDateString("it-IT"),
      m.tipo === "entrata" ? "Entrata" : "Uscita",
      SETTORE_LABELS[m.settore] || m.settore,
      METODO_LABELS[m.metodo_pagamento] || m.metodo_pagamento,
      m.descrizione,
      CATEGORY_LABELS[m.categoria],
      `€${m.importo.toFixed(2)}`,
    ]);

    const separator = ";";
    const csvContent =
      headers.join(separator) +
      "\n" +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(separator)).join("\n") +
      `\n\n${separator}${separator}${separator}${separator}${separator}"Totale Entrate";"€${totalEntrate.toFixed(2)}"` +
      `\n${separator}${separator}${separator}${separator}${separator}"Totale Uscite";"€${totalUscite.toFixed(2)}"` +
      `\n${separator}${separator}${separator}${separator}${separator}"Saldo";"€${saldo.toFixed(2)}"`;

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ebenezer_movimenti_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "Export CSV completato",
      description: "Il file è stato scaricato con successo",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Ebenezer - Report Movimenti", 14, 20);

    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString("it-IT")}`, 14, 28);

    const tableData = movements.map((m) => [
      new Date(m.data).toLocaleDateString("it-IT"),
      m.tipo === "entrata" ? "Entrata" : "Uscita",
      SETTORE_LABELS[m.settore] || m.settore,
      METODO_LABELS[m.metodo_pagamento] || m.metodo_pagamento,
      m.descrizione,
      CATEGORY_LABELS[m.categoria],
      `€${m.importo.toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [["Data", "Tipo", "Settore", "Pagamento", "Descrizione", "Categoria", "Importo"]],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 40 },
        5: { cellWidth: 25 },
        6: { cellWidth: 23, halign: "right" },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 35;

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("Riepilogo:", 14, finalY + 10);

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Totale Entrate: €${totalEntrate.toFixed(2)}`, 14, finalY + 18);
    doc.text(`Totale Uscite: €${totalUscite.toFixed(2)}`, 14, finalY + 25);

    doc.setFont(undefined, "bold");
    doc.text(`Saldo: €${saldo.toFixed(2)}`, 14, finalY + 32);

    doc.save(`ebenezer_movimenti_${new Date().toISOString().split("T")[0]}.pdf`);

    toast({
      title: "Export PDF completato",
      description: "Il file è stato scaricato con successo",
    });
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportToCSV} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Esporta CSV
      </Button>
      <Button onClick={exportToPDF} variant="outline">
        <FileText className="mr-2 h-4 w-4" />
        Esporta PDF
      </Button>
    </div>
  );
};
