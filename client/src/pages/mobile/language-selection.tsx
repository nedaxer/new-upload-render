import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Check } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages, searchLanguages, Language } from '@/data/languages';

export default function LanguageSelection() {
  const [, setLocation] = useLocation();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState<Language[]>(languages);

  // Filter languages based on search query
  useEffect(() => {
    const filtered = searchLanguages(searchQuery);
    setFilteredLanguages(filtered);
  }, [searchQuery]);

  const handleLanguageSelect = (language: Language) => {
    changeLanguage(language);
    
    // Show success message
    toast({
      title: t("language_updated") || "Language updated",
      description: `${t("switched_to") || "Switched to"} ${language.name} (${language.nativeName})`
    });

    // Navigate back to settings
    setTimeout(() => {
      setLocation('/mobile/settings');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/mobile/settings')}
          className="text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{t('select_language')}</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t('search') + ' languages...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Language List */}
      <div className="flex-1 overflow-y-auto">
        {filteredLanguages.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">No languages found</div>
            <div className="text-sm text-gray-500">Try searching with different keywords</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{language.flag}</span>
                  <div className="text-left">
                    <div className="text-white font-medium">{language.name}</div>
                    <div className="text-gray-400 text-sm">{language.nativeName}</div>
                  </div>
                </div>
                {currentLanguage.code === language.code && (
                  <Check className="h-5 w-5 text-orange-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-center text-sm text-gray-400">
          {filteredLanguages.length} language{filteredLanguages.length !== 1 ? 's' : ''} available
        </div>
      </div>
    </div>
  );
}