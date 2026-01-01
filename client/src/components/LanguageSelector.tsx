import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "react-i18next";

const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  // RTL languages
  const rtlLanguages = ["ar", "he", "fa", "ur"];
  const isRtl = rtlLanguages.includes(currentLanguage);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all hover:scale-105 border border-transparent hover:border-gray-200 dark:hover:border-slate-600"
        title={t("common.language")}
      >
        <Globe className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${isRtl ? "left-0" : "right-0"
            } mt-3 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-slate-700 z-[150] max-h-[32rem] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top`}
        >
          <div className="px-4 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <Globe className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                {t("common.selectLanguage", "Select Language")}
              </p>
            </div>
          </div>
          <div className="py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group ${currentLanguage === language.code
                  ? "bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300"
                  }`}
                dir={rtlLanguages.includes(language.code) ? "rtl" : "ltr"}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${currentLanguage === language.code
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-slate-600"
                    }`}>
                    {language.code.toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{language.nativeName}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                      {language.name}
                    </span>
                  </div>
                </div>
                {currentLanguage === language.code && (
                  <div className="bg-blue-100 dark:bg-blue-800/40 p-1 rounded-full">
                    <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
