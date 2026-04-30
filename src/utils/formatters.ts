export const formatCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCNPJ = (text: string | null | undefined): string => {
  if (!text) return 'Não informado';
  const cleaned = text.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/);
  if (match) {
    let formatted = '';
    if (match[1]) formatted += match[1];
    if (match[2]) formatted += '.' + match[2];
    if (match[3]) formatted += '.' + match[3];
    if (match[4]) formatted += '/' + match[4];
    if (match[5]) formatted += '-' + match[5];
    return formatted;
  }
  return text;
};

export const formatCPF = (text: string | null | undefined): string => {
  if (!text) return 'Não informado';
  const cleaned = text.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
  if (match) {
    let formatted = '';
    if (match[1]) formatted += match[1];
    if (match[2]) formatted += '.' + match[2];
    if (match[3]) formatted += '.' + match[3];
    if (match[4]) formatted += '-' + match[4];
    return formatted;
  }
  return text;
};

export const formatDate = (text: string | null | undefined): string => {
  if (!text) return 'Não informado';
  const cleaned = text.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
  if (match) {
    let formatted = '';
    if (match[1]) formatted += match[1];
    if (match[2]) formatted += '/' + match[2];
    if (match[3]) formatted += '/' + match[3];
    return formatted;
  }
  return text;
};

export const formatPhone = (text: string | null | undefined): string => {
  if (!text) return 'Não informado';
  const cleaned = text.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  if (match) {
    let formatted = '';
    if (match[1]) formatted += '(' + match[1];
    if (match[2]) formatted += ') ' + match[2];
    if (match[3]) formatted += '-' + match[3];
    return formatted;
  }
  return text;
};

export const formatDateToISO = (dateString: string): string => {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
};

export const formatISOToDate = (isoString: string): string => {
  // Strings YYYY-MM-DD (DATE do Postgres) sao interpretadas como UTC midnight pelo JS.
  // Criamos como data local para evitar deslocamento de fuso (UTC-3 mostraria dia anterior).
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    const [year, month, day] = isoString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  }
  // TIMESTAMPTZ: converter explicitamente para Brasilia
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
};

export const formatDateTimeShort = (isoString: string): string => {
  // DATE sem hora: retorna so a data
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    const [year, month, day] = isoString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  }
  const date = new Date(isoString);
  const datePart = date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const timePart = date.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  return `${datePart}\n${timePart}`;
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Hoje';
  if (diffInDays === 1) return 'Ontem';
  if (diffInDays < 7) return `${diffInDays} dias atrás`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`;
  return `${Math.floor(diffInDays / 365)} anos atrás`;
};
