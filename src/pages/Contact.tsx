import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les plus brefs délais.",
    });
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90">
            Notre équipe est à votre disposition pour répondre à toutes vos questions
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Téléphone</h3>
              <p className="text-muted-foreground">01 23 45 67 89</p>
              <p className="text-sm text-muted-foreground mt-1">Lun-Sam: 9h-18h</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground">contact@privatequity.fr</p>
              <p className="text-sm text-muted-foreground mt-1">Réponse sous 24h</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Adresse</h3>
              <p className="text-muted-foreground">123 Avenue des Champs-Élysées</p>
              <p className="text-muted-foreground">75008 Paris, France</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="mt-1"
                  />
                </div>

                <Button type="submit" className="w-full">Envoyer le message</Button>
              </form>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Horaires d'ouverture</h3>
                    <div className="space-y-1 text-muted-foreground">
                      <p>Lundi - Vendredi: 9h00 - 18h00</p>
                      <p>Samedi: 10h00 - 16h00</p>
                      <p>Dimanche: Fermé</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-subtle border-none">
                <h3 className="text-lg font-bold text-foreground mb-3">Questions fréquentes</h3>
                <p className="text-muted-foreground mb-4">
                  Avant de nous contacter, consultez notre page FAQ qui contient les réponses aux questions 
                  les plus courantes sur nos services, les demandes de crédit et les conditions.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <a href="/resources/faq">Consulter la FAQ</a>
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">Besoin d'aide immédiate ?</h3>
                <p className="text-muted-foreground mb-4">
                  Pour toute urgence ou question sur une demande en cours, n'hésitez pas à nous appeler 
                  directement. Notre équipe est disponible pour vous assister.
                </p>
                <Button className="w-full" asChild>
                  <a href="tel:0123456789">Appeler maintenant</a>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
