import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Phone, Search, X } from 'lucide-react';
import { countries, Country, getDefaultCountry, findCountryByPhoneCode } from '../data/countries';

interface PhoneInputFieldProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  label,
  value = '',
  onChange,
  error,
  required,
  placeholder = "Enter  number",
  disabled,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [inputColor, setInputColor] = useState<string>('#111827');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Track theme to ensure text is visible in both light and dark modes
  useEffect(() => {
    const update = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setInputColor(isDark ? '#ffffff' : '#111827');
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Parse initial value to extract country code and phone number
  useEffect(() => {
    if (value && value.startsWith('+')) {
      // Find the longest matching country code
      let matchedCountry: Country | undefined;
      let matchedPhoneCode = '';

      for (const country of countries) {
        if (value.startsWith(country.phoneCode) && country.phoneCode.length > matchedPhoneCode.length) {
          matchedCountry = country;
          matchedPhoneCode = country.phoneCode;
        }
      }

      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setPhoneNumber(value.slice(matchedCountry.phoneCode.length));
      } else {
        // If no country code matched, set the full value as phone number
        setPhoneNumber(value);
      }
    } else if (value) {
      // If value doesn't start with +, treat it as a plain phone number
      setPhoneNumber(value);
      // Keep default country (usually US +1)
    } else {
      // If no value, clear the phone number but keep country
      setPhoneNumber('');
    }
  }, [value]);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.phoneCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm('');

    // Update the full phone number
    const fullNumber = country.phoneCode + phoneNumber;
    onChange(fullNumber);

    // Focus back to phone input
    setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 100);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    // Allow only digits, spaces, parentheses, plus and hyphen
    const sanitized = inputVal.replace(/[^\d\s()+-]/g, '');

    // If user pasted/typed a full international number starting with +, honor it
    if (sanitized.startsWith('+')) {
      // Find best matching country for the given code
      let matched: Country | undefined;
      let matchedCode = '';
      for (const c of countries) {
        if (sanitized.startsWith(c.phoneCode) && c.phoneCode.length > matchedCode.length) {
          matched = c;
          matchedCode = c.phoneCode;
        }
      }
      if (matched) {
        setSelectedCountry(matched);
        const localPart = sanitized.slice(matched.phoneCode.length);
        setPhoneNumber(localPart);
      } else {
        // Unknown code, keep current country and store as local part without +
        setPhoneNumber(sanitized.replace(/^\+/, ''));
      }
      onChange(sanitized);
      return;
    }

    // Otherwise treat as local/national part; remove country code if user included it
    let local = sanitized.replace(/\+/g, '');
    if (local.startsWith(selectedCountry.phoneCode.replace('+', ''))) {
      local = local.slice(selectedCountry.phoneCode.replace('+', '').length);
    }
    setPhoneNumber(local);
    onChange(selectedCountry.phoneCode + local);
  };

  const handleClearPhone = () => {
    setPhoneNumber('');
    onChange(selectedCountry.phoneCode);
    phoneInputRef.current?.focus();
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const displayValue = selectedCountry.phoneCode + phoneNumber;

  return (
    <div className={`relative ${className || ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex">
        {/* Country Code Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={toggleDropdown}
            disabled={disabled}
            className={`
              relative flex items-center space-x-2 px-3 h-12 rounded-l-lg border border-r-0 transition-all duration-200
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${error
                ? 'border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }
              ${isOpen
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : 'cursor-pointer'}
            `}
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium min-w-[3rem]">{selectedCountry.phoneCode}</span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} />
          </button>

          {/* Country Dropdown */}
          {isOpen && (
            <div className="absolute z-50 left-0 mt-1 w-80 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search countries..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Country List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredCountries.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No countries found
                  </div>
                ) : (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`
                        w-full text-left px-4 py-3 text-sm transition-colors duration-150
                        flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-600
                        ${country.code === selectedCountry.code
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-900 dark:text-gray-100'
                        }
                      `}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{country.name}</div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {country.phoneCode}
                      </span>
                      {country.code === selectedCountry.code && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-4 w-4 text-gray-400" />
          </div>
          <input
            ref={phoneInputRef}
            type="tel"
            name="phone"
            id="lead-phone"
            inputMode="tel"
            autoComplete="tel-national"
            autoCorrect="off"
            spellCheck={false}
            value={displayValue}
            onChange={handlePhoneNumberChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              block w-full h-12 pl-10 pr-10 rounded-r-lg border text-sm md:text-base transition-all duration-200
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              placeholder:text-gray-500 dark:placeholder:text-gray-400
              ${error
                ? 'border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''}
            `}
            style={{ color: inputColor, WebkitTextFillColor: inputColor, caretColor: inputColor }}
          />

          {/* Clear Button */}
          {phoneNumber && !disabled && (
            <button
              type="button"
              onClick={handleClearPhone}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
