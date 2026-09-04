import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { COUNTRY_DATA } from './CountryFlags';

export function CountryCodeDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCountry = COUNTRY_DATA.find(c => c.code === value) || COUNTRY_DATA[0];
  const SelectedFlag = selectedCountry.flagComponent;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Country Code Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          boxSizing: 'border-box',
          padding: '8px 10px',
          borderRadius: '8px',
          border: '1.5px solid #CBD0C0',
          backgroundColor: '#FFFFFF',
          color: '#20231F',
          fontSize: '0.84rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          outline: 'none',
          minWidth: '95px',
          justifyContent: 'space-between',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SelectedFlag width={18} height={12} />
          <span>{selectedCountry.code}</span>
        </div>
        <ChevronDown size={13} color="#64748B" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </button>

      {/* Floating Options Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 110,
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #CBD0C0',
          boxShadow: '0 12px 30px rgba(32, 35, 31, 0.15)',
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          width: '240px',
          maxHeight: '230px',
          overflowY: 'auto'
        }}>
          {COUNTRY_DATA.map((country) => {
            const Flag = country.flagComponent;
            const isSelected = country.code === value;
            return (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onChange(country.code);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isSelected ? 'rgba(48, 72, 59, 0.08)' : 'transparent',
                  color: '#20231F',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.82rem',
                  gap: '8px',
                  transition: 'background 0.1s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flag width={18} height={12} />
                  <span style={{ fontWeight: '600' }}>{country.country}</span>
                  <span style={{ color: '#64748B', fontWeight: '500', fontSize: '0.78rem' }}>({country.code})</span>
                </div>
                {isSelected && <Check size={14} color="#30483B" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CountryCodeDropdown;
