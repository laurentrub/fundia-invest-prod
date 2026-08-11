import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consent) {
      toast({
        variant: "destructive",
        title: t('contact.form.consentRequired'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: inserted, error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          consent_given: consent,
        })
        .select()
        .single();

      if (error) throw error;

      if (inserted) {
        try {
          await supabase.functions.invoke('send-contact-notification', {
            body: { contactMessageId: inserted.id },
          });
        } catch (emailError) {
          console.error('Error sending contact notification email:', emailError);
        }
      }

      toast({
        title: t('contact.form.success'),
        description: t('contact.form.successDesc'),
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setConsent(false);
    } catch (error) {
      console.error('Error submitting contact message:', error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('contact.form.errorDesc'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t('contact.email')}</h3>
              <p className="text-muted-foreground">{t('contact.emailAddress')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('contact.emailResponse')}</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t('contact.address')}</h3>
              <p className="text-muted-foreground">{t('contact.addressLine1')}</p>
              <p className="text-muted-foreground">{t('contact.addressLine2')}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">{t('contact.form.title')}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('contact.form.name')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t('contact.form.email')} *</Label>
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
                  <Label htmlFor="subject">{t('contact.form.subject')} *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message">{t('contact.form.message')} *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked === true)}
                    className="mt-1"
                  />
                  <Label htmlFor="consent" className="text-sm font-normal leading-snug text-muted-foreground">
                    {t('contact.form.consentPrefix')}{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      {t('contact.form.consentLink')}
                    </Link>
                    . *
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
                </Button>
              </form>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{t('contact.sidebar.hours')}</h3>
                    <div className="space-y-1 text-muted-foreground">
                      <p>{t('contact.sidebar.weekdays')}</p>
                      <p>{t('contact.sidebar.saturday')}</p>
                      <p>{t('contact.sidebar.sunday')}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-subtle border-none">
                <h3 className="text-lg font-bold text-foreground mb-3">{t('contact.sidebar.faqLink')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('contact.sidebar.faqDesc')}
                </p>
                <Button variant="outline" asChild className="w-full">
                  <a href="/resources/faq">{t('footer.faq')}</a>
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
