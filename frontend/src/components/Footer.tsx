import * as React from 'react';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from './icons';
import { useLanguage } from '@/i18n/LanguageContext';
import { EditableText } from './ui/editable-text';
import { EditableSection } from './ui/editable-section';
import { useSiteSettings } from '@/config/SiteSettingsContext';
import { useToast } from '@/hooks/use-toast';

interface FooterProps {
  onNavigate: (category: string | null) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();
  const { toast } = useToast();
  const social = settings.socialLinks || {};
  const [newsletterEmail, setNewsletterEmail] = React.useState('');

  const handleLinkClick = (e: React.MouseEvent, category: string | null) => {
    e.preventDefault();
    onNavigate(category);
  };

  const handleNewsletterSubscribe = () => {
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast({ title: t('invalid_email'), description: t('invalid_email_desc'), variant: "destructive" });
      return;
    }
    const existing = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
    existing.push({ email: newsletterEmail, subscribedAt: new Date().toISOString() });
    localStorage.setItem('newsletter_subscribers', JSON.stringify(existing));
    setNewsletterEmail('');
    toast({ title: t('subscribed_title'), description: t('subscribed_desc') });
  };

  return (
    <EditableSection id="footer" title="Footer">
      <footer className="bg-primary text-primary-foreground pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

            <div className="space-y-6">
              <h3 className="text-2xl font-black tracking-tighter uppercase ltr">
                X<span className="text-accent">CRAFT</span>
              </h3>
              <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
                <EditableText k="footer_brandParagraph" as="span" />
              </p>
              <div className="flex space-x-4 rtl:space-x-reverse">
                {/* Dynamic Social Links */}
                {(Array.isArray(social) ? social : []).map((link) => {
                  const IconComponent = (
                    link.icon === 'Facebook' ? Facebook :
                      link.icon === 'Instagram' ? Instagram :
                        link.icon === 'Twitter' ? Twitter :
                          link.icon === 'Youtube' ? Youtube :
                            link.icon === 'MapPin' ? MapPin : // For Location
                              link.icon === 'Phone' ? Phone :
                                link.icon === 'Mail' ? Mail :
                                  Twitter // Default fallback
                  );

                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-primary-foreground/10 text-primary-foreground rounded-full hover:bg-secondary transition-all"
                      aria-label={link.platform}
                      title={link.platform}
                    >
                      <IconComponent size={18} />
                    </a>
                  );
                })}
              </div>
            </div>



            {/* Dynamic Footer Columns */}
            {settings.footer?.columns.map((column) => (
              <div key={column.id}>
                <h4 className="text-sm font-bold uppercase tracking-widest text-accent mb-6">
                  {column.title}
                </h4>
                <ul className="space-y-4 text-primary-foreground/70 text-xs font-medium uppercase tracking-widest">
                  {column.links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        onClick={(e) => {
                          if (!link.href.startsWith('/')) {
                            // External or anchor
                          } else {
                            // If it's a shop link, we might want to handle it?
                            // For now, standard link behavior is fine or use Link from react-router-dom if available.
                            // But this project uses hrefs in Footer usually.
                          }
                        }}
                        className="hover:text-accent transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-accent mb-6">
                <EditableText k="footer_stayConnected" as="span" />
              </h4>
              <p className="text-primary-foreground/60 text-xs mb-4 uppercase tracking-wider">
                <EditableText k="footer_subscribeText" as="span" />
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={t('footer_emailPlaceholder')}
                  className="bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-[10px] font-bold px-4 py-3 outline-none focus:border-secondary transition-colors uppercase"
                />
                <button
                  onClick={handleNewsletterSubscribe}
                  className="bg-secondary text-secondary-foreground py-3 font-bold uppercase text-[10px] tracking-widest hover:bg-primary-foreground hover:text-primary transition-all">
                  <EditableText k="footer_subscribeBtn" as="span" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest gap-4 text-center">
            <p><EditableText k="footer_copyright" as="span" /></p>
            <div className="flex gap-6">
              <a href="/privacy-policy" className="hover:text-primary-foreground"><EditableText k="footer_privacy" as="span" /></a>
              <a href="/terms-of-service" className="hover:text-primary-foreground"><EditableText k="footer_terms" as="span" /></a>
              <a href="/about-us" className="hover:text-primary-foreground"><EditableText k="footer_aboutUs" as="span" /></a>
            </div>
          </div>
        </div>
      </footer >
    </EditableSection >
  );
};

export default Footer;
