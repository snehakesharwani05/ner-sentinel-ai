import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { ROLE_OPTIONS } from './RoleIcons';

export function RoleSelectDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedRole = ROLE_OPTIONS.find(r => r.id === value) || ROLE_OPTIONS[0];
  const SelectedIcon = selectedRole.icon;

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
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1.5px solid #CBD0C0',
          backgroundColor: '#FFFFFF',
          color: '#20231F',
          fontSize: '0.86rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          outline: 'none',
          gap: '8px',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            backgroundColor: 'rgba(48, 72, 59, 0.08)',
            flexShrink: 0
          }}>
            <SelectedIcon size={16} color={selectedRole.color} />
          </div>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedRole.label}
          </span>
        </div>
        <ChevronDown size={14} color="#64748B" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </button>

      {/* Floating Options Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #CBD0C0',
          boxShadow: '0 12px 30px rgba(32, 35, 31, 0.15)',
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          maxHeight: '260px',
          overflowY: 'auto'
        }}>
          {ROLE_OPTIONS.map((role) => {
            const Icon = role.icon;
            const isSelected = role.id === value;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  onChange(role.id);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isSelected ? 'rgba(48, 72, 59, 0.08)' : 'transparent',
                  color: '#20231F',
                  cursor: 'pointer',
                  textAlign: 'left',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(48, 72, 59, 0.08)',
                    flexShrink: 0
                  }}>
                    <Icon size={17} color={role.color} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.84rem' }}>{role.label}</span>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: '800',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: role.id === 'admin' ? '#FEF3C7' : '#EDE8DC',
                        color: role.id === 'admin' ? '#92400E' : '#30483B'
                      }}>
                        {role.badge}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>
                      {role.description}
                    </span>
                  </div>
                </div>
                {isSelected && <Check size={15} color="#30483B" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RoleSelectDropdown;
