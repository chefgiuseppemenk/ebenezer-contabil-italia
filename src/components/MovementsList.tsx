import { CircleArrowDown as ArrowDownCircle, CircleArrowUp as ArrowUpCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Movement, CATEGORY_LABELS, SETTORE_LABELS, METODO_LABELS } from "@/types/movement";

interface MovementsListProps {
  movements: Movement[];
  onUpdate: () => void;
}

export const MovementsList = ({ movements, onUpdate }: MovementsListProps) => {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("movimenti").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Movimento eliminato",
        description: "Il movimento è stato eliminato con successo",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimenti Recenti</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {movements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessun movimento registrato
            </p>
          ) : (
            movements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {movement.tipo === "entrata" ? (
                    <ArrowUpCircle className="h-5 w-5 text-success flex-shrink-0" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{movement.descrizione}</p>
                    <p className="text-sm text-muted-foreground">
                      {SETTORE_LABELS[movement.settore]} • {METODO_LABELS[movement.metodo_pagamento]} • {CATEGORY_LABELS[movement.categoria]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(movement.data).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        movement.tipo === "entrata" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {movement.tipo === "entrata" ? "+" : "-"}€{movement.importo.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(movement.id)}
                  className="ml-2 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
