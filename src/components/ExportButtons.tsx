import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Movement {
  id: string;
  tipo: "entrata" | "uscita";
  descrizione: string;
  importo: number;
  categoria: string;
  data: string;
}

interface ExportButtonsProps {
  movements: Movement[];
  totalEntrate: number;
  totalUscite: number;
  saldo: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  donazioni: "Donazioni",
  affitto: "Affitto",
  utenze: "Utenze",
  stipendi: "Stipendi",
  forniture: "Forniture",
  manutenzione: "Manutenzione",
  eventi: "Eventi",
  altro: "Altro",
};

export const ExportButtons = ({ movements, totalEntrate, totalUscite, saldo }: ExportButtonsProps) => {
  const { toast } = useToast();

  const exportToCSV = () => {
    const headers = ["Data", "Tipo", "Descrizione", "Categoria", "Importo"];
    const rows = movements.map((m) => [
      new Date(m.data).toLocaleDateString("it-IT"),
      m.tipo === "entrata" ? "Entrata" : "Uscita",
      m.descrizione,
      CATEGORY_LABELS[m.categoria],
      m.importo.toFixed(2),
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n") +
      `\n\nTotale Entrate,${totalEntrate.toFixed(2)}\nTotale Uscite,${totalUscite.toFixed(2)}\nSaldo,${saldo.toFixed(2)}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
    toast({
      title: "Funzionalità in sviluppo",
      description: "L'export PDF sarà disponibile a breve",
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
