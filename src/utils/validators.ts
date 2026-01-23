export const validators = {
  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'E-mail inválido';
  },

  required: (value: string): string | null => {
    return value.trim() ? null : 'Campo obrigatório';
  },

  minLength: (min: number) => (value: string): string | null => {
    return value.length >= min ? null : `Mínimo ${min} caracteres`;
  },

  maxLength: (max: number) => (value: string): string | null => {
    return value.length <= max ? null : `Máximo ${max} caracteres`;
  },

  cpf: (value: string): string | null => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 11) return 'CPF inválido';

    // Check for known invalid CPFs
    if (/^(\d)\1+$/.test(cleaned)) return 'CPF inválido';

    // Validate CPF algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) return 'CPF inválido';

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(10))) return 'CPF inválido';

    return null;
  },

  password: (value: string): string | null => {
    if (value.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(value)) return 'Deve conter pelo menos uma letra maiúscula';
    if (!/[a-z]/.test(value)) return 'Deve conter pelo menos uma letra minúscula';
    if (!/[0-9]/.test(value)) return 'Deve conter pelo menos um número';
    return null;
  },

  date: (value: string): string | null => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 8) return 'Data inválida';

    const day = parseInt(cleaned.substring(0, 2));
    const month = parseInt(cleaned.substring(2, 4));
    const year = parseInt(cleaned.substring(4, 8));

    if (day < 1 || day > 31) return 'Dia inválido';
    if (month < 1 || month > 12) return 'Mês inválido';
    if (year < 1900 || year > new Date().getFullYear()) return 'Ano inválido';

    return null;
  },

  phone: (value: string): string | null => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 11 && cleaned.length !== 10) return 'Telefone inválido';
    return null;
  },

  number: (value: string): string | null => {
    return isNaN(Number(value)) ? 'Deve ser um número' : null;
  },

  min: (min: number) => (value: string): string | null => {
    const num = Number(value);
    return isNaN(num) || num < min ? `Valor mínimo: ${min}` : null;
  },

  max: (max: number) => (value: string): string | null => {
    const num = Number(value);
    return isNaN(num) || num > max ? `Valor máximo: ${max}` : null;
  },
};
