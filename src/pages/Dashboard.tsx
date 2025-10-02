import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FinanceStats } from "@/components/FinanceStats";
import { MovementForm } from "@/components/MovementForm";
import { MovementsList } from "@/components/MovementsList";
import { CategoryChart } from "@/components/CategoryChart";
import { ExportButtons } from "@/components/ExportButtons";
import { LogOut, DollarSign } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { Movement } from "@/types/movement";

const Dashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        fetchMovements();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchMovements = async () => {
    try {
      const { data, error } = await supabase
        .from("movimenti")
        .select("*")
        .order("data", { ascending: false });

      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error("Error fetching movements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const totalEntrate = movements
    .filter((m) => m.tipo === "entrata")
    .reduce((sum, m) => sum + Number(m.importo), 0);

  const totalUscite = movements
    .filter((m) => m.tipo === "uscita")
    .reduce((sum, m) => sum + Number(m.importo), 0);

  const saldo = totalEntrate - totalUscite;

  if (!session || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ebenezer</h1>
              <p className="text-sm text-muted-foreground">Gestione Finanziaria</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Esci
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <ExportButtons
            movements={movements}
            totalEntrate={totalEntrate}
            totalUscite={totalUscite}
            saldo={saldo}
          />
        </div>

        <FinanceStats totalEntrate={totalEntrate} totalUscite={totalUscite} saldo={saldo} />

        <div className="grid gap-8 lg:grid-cols-2">
          <MovementForm onSuccess={fetchMovements} />
          <CategoryChart movements={movements.filter((m) => m.tipo === "uscita")} />
        </div>

        <MovementsList movements={movements} onUpdate={fetchMovements} />
      </main>
    </div>
  );
};

export default Dashboard;
