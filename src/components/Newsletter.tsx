import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Inscription réussie !",
        description: "Vous recevrez bientôt nos meilleures offres de crédit.",
      });
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="py-16 bg-gradient-accent">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-background/10 rounded-full">
              <Mail className="h-8 w-8 text-accent-foreground" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-accent-foreground mb-4">
            Restez informé des meilleures offres
          </h2>
          <p className="text-lg text-accent-foreground/90 mb-8">
            Inscrivez-vous à notre newsletter et recevez en exclusivité nos meilleurs taux, conseils financiers et offres spéciales.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <Input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-background/90 border-0 h-12 text-base"
              disabled={loading}
            />
            <Button 
              type="submit" 
              size="lg"
              className="bg-background text-accent hover:bg-background/90 h-12 px-8"
              disabled={loading}
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>
          
          <p className="text-sm text-accent-foreground/80 mt-4">
            Pas de spam. Désinscription possible à tout moment.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
