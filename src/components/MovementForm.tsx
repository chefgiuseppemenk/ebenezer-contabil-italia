import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface MovementFormProps {
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: "donazioni", label: "Donazioni" },
  { value: "affitto", label: "Affitto" },
  { value: "utenze", label: "Utenze" },
  { value: "stipendi", label: "Stipendi" },
  { value: "forniture", label: "Forniture" },
  { value: "manutenzione", label: "Manutenzione" },
  { value: "eventi", label: "Eventi" },
  { value: "altro", label: "Altro" },
];

export const MovementForm = ({ onSuccess }: MovementFormProps) => {
  const [tipo, setTipo] = useState<"entrata" | "uscita">("entrata");
  const [descrizione, setDescrizione] = useState("");
  const [importo, setImporto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Utente non autenticato");

      const { error } = await supabase.from("movimenti").insert([{
        user_id: userData.user.id,
        tipo,
        descrizione,
        importo: parseFloat(importo),
        categoria,
        data,
      }] as any);

      if (error) throw error;

      toast({
        title: "Movimento aggiunto",
        description: "Il movimento è stato registrato con successo",
      });

      setDescrizione("");
      setImporto("");
      setCategoria("");
      setData(new Date().toISOString().split("T")[0]);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuovo Movimento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(value: "entrata" | "uscita") => setTipo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrata">Entrata</SelectItem>
                  <SelectItem value="uscita">Uscita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="importo">Importo (€)</Label>
              <Input
                id="importo"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={importo}
                onChange={(e) => setImporto(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descrizione">Descrizione</Label>
            <Input
              id="descrizione"
              type="text"
              placeholder="Es: Donazione mensile"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Aggiungi Movimento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
