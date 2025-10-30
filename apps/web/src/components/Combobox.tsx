import React, { useState, useRef, useEffect } from 'react'
import Icon from './Icon'

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
  allowCustom?: boolean
}

export const Combobox: React.FC<ComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar o escribir...',
  className = '',
  allowCustom = true
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Actualizar inputValue cuando value cambia externamente
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Actualizar opciones filtradas cuando cambia el input o las opciones
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      )
      setFilteredOptions(filtered)
    }
  }, [inputValue, options])

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsOpen(true)
    
    if (allowCustom) {
      onChange(newValue)
    }
  }

  const handleSelectOption = (option: string) => {
    setInputValue(option)
    onChange(option)
    setIsOpen(false)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && allowCustom && inputValue.trim()) {
      e.preventDefault()
      onChange(inputValue.trim())
      setIsOpen(false)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const showCreateOption = allowCustom && 
    inputValue.trim() !== '' && 
    !options.some(opt => opt.toLowerCase() === inputValue.toLowerCase())

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 && !showCreateOption ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              No hay opciones disponibles
            </div>
          ) : (
            <>
              {filteredOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm focus:outline-none focus:bg-blue-50 transition-colors"
                >
                  {option}
                </button>
              ))}
              
              {showCreateOption && (
                <button
                  type="button"
                  onClick={() => handleSelectOption(inputValue.trim())}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm focus:outline-none focus:bg-green-50 transition-colors border-t border-gray-200 text-green-700 font-medium"
                >
                  <Icon name="plus" /> Crear "{inputValue.trim()}"
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
