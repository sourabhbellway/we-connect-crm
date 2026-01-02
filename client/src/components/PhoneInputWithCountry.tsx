import React, { useState, useRef, useEffect } from 'react';
import { Phone, ChevronDown, Search, X } from 'lucide-react';
import { countries, Country, getDefaultCountry } from '../data/countries';

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (value: string, countryCode: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export const PhoneInputWithCountry: React.FC<PhoneInputWithCountryProps> = ({
  value,
  onChange,
  label = 'Phone',
  error,
  required = false,
  placeholder = 'Enter number',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());
  const [phoneNumber, setPhoneNumber] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Parse initial value to extract country code and phone number
  useEffect(() => {
    if (value) {
      // Try to extract country code from the value
      const country = countries.find(c => value.startsWith(c.phoneCode));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.substring(country.phoneCode.length).trim());
      } else {
        setPhoneNumber(value);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter countries based on search query
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.phoneCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    // Update the full phone value
    const fullPhone = phoneNumber ? `${country.phoneCode} ${phoneNumber}` : '';
    onChange(fullPhone, country.code);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setPhoneNumber(inputValue);
    // Combine country code with phone number
    const fullPhone = inputValue ? `${selectedCountry.phoneCode} ${inputValue}` : '';
    onChange(fullPhone, selectedCountry.code);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Phone Input Container */}
        <div className={`flex items-stretch rounded-lg border ${error
            ? 'border-red-300 dark:border-red-600'
            : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all`}>

          {/* Country Code Selector Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 border-r border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-l-lg bg-gray-50/30 dark:bg-gray-800/30"
          >
            <span className="text-2xl leading-none">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {selectedCountry.phoneCode}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Phone Number Input */}
          <div className="flex-1 flex items-center">
            <Phone className="h-4 w-4 text-gray-400 ml-3" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Country Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-80 overflow-hidden"
          >
            {/* Search Box */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country or code..."
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Countries List */}
            <div className="overflow-y-auto max-h-64 custom-scrollbar">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedCountry.code === country.code
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                      }`}
                  >
                    <span className="text-2xl leading-none">{country.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {country.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {country.code}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {country.phoneCode}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No countries found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-600 dark:bg-red-400"></span>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Select country code and enter your phone number
        </p>
      )}
    </div>
  );
};

export default PhoneInputWithCountry;
