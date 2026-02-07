import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const DynamicHead = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Update document language
    document.documentElement.lang = i18n.language?.split("-")[0] || "fr";

    // Update title
    document.title = t("seo.title");

    // Update meta tags
    const metaUpdates: Record<string, string> = {
      description: t("seo.description"),
      author: t("seo.author"),
    };

    const ogUpdates: Record<string, string> = {
      "og:title": t("seo.ogTitle"),
      "og:description": t("seo.ogDescription"),
    };

    // Update standard meta tags
    Object.entries(metaUpdates).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (meta) {
        meta.setAttribute("content", content);
      }
    });

    // Update OG meta tags
    Object.entries(ogUpdates).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (meta) {
        meta.setAttribute("content", content);
      }
    });
  }, [t, i18n.language]);

  return null;
};

export default DynamicHead;
