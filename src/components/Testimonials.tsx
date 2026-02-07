import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

const Testimonials = () => {
  const { t } = useTranslation();
  
  const testimonials = [
    {
      name: "Marie Dubois",
      location: "Paris",
      rating: 5,
      text: "Excellent service ! J'ai obtenu mon prêt personnel en 48h pour financer les travaux de ma maison. Le processus était simple et transparent, et le conseiller était très professionnel.",
      project: "Crédit travaux - 15 000€",
      initials: "MD",
      color: "bg-accent"
    },
    {
      name: "Pierre Martin",
      location: "Lyon",
      rating: 5,
      text: "Après avoir comparé plusieurs banques, Fundia Invest m'a proposé le meilleur taux pour mon crédit auto. La simulation en ligne est très pratique et l'approbation a été rapide.",
      project: "Crédit auto - 22 000€",
      initials: "PM",
      color: "bg-primary"
    },
    {
      name: "Sophie Laurent",
      location: "Marseille",
      rating: 5,
      text: "Je recommande vivement ! Le rachat de mes crédits m'a permis de réduire considérablement mes mensualités. L'équipe a été à l'écoute et m'a bien accompagnée.",
      project: "Rachat de crédit - 35 000€",
      initials: "SL",
      color: "bg-secondary"
    },
    {
      name: "Thomas Bernard",
      location: "Toulouse",
      rating: 5,
      text: "Service impeccable du début à la fin. La plateforme en ligne est intuitive, et j'ai pu faire toutes mes démarches sans me déplacer. Mon prêt a été validé en moins de 24h.",
      project: "Prêt personnel - 8 000€",
      initials: "TB",
      color: "bg-accent"
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover:shadow-xl transition-shadow relative">
              <Quote className="absolute top-4 right-4 h-8 w-8 text-accent/20" />
              
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarFallback className={`${testimonial.color} text-white font-semibold`}>
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-foreground mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>

              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-accent">{testimonial.project}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
