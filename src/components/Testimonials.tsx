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
      textKey: "testimonials.items.marie.text",
      projectKey: "testimonials.items.marie.project",
      initials: "MD",
      color: "bg-accent"
    },
    {
      name: "Pierre Martin",
      location: "Lyon",
      rating: 5,
      textKey: "testimonials.items.pierre.text",
      projectKey: "testimonials.items.pierre.project",
      initials: "PM",
      color: "bg-primary"
    },
    {
      name: "Sophie Laurent",
      location: "Marseille",
      rating: 5,
      textKey: "testimonials.items.sophie.text",
      projectKey: "testimonials.items.sophie.project",
      initials: "SL",
      color: "bg-secondary"
    },
    {
      name: "Thomas Bernard",
      location: "Toulouse",
      rating: 5,
      textKey: "testimonials.items.thomas.text",
      projectKey: "testimonials.items.thomas.project",
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
                "{t(testimonial.textKey)}"
              </p>

              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-accent">{t(testimonial.projectKey)}</p>
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
