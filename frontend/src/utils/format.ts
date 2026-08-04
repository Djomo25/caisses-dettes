export function formatMontant(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ') + ' FC'
}

export function formatHeure(iso: string): string {
  const d = new Date(iso)
  const heures = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${heures}h${minutes}`
}

export function getInitiales(nom: string | null, email: string | null): string {
  if (nom) {
    const mots = nom.trim().split(/\s+/).filter(Boolean)
    const initiales = mots
      .slice(0, 2)
      .map((mot) => mot[0])
      .join('')
    return initiales.toUpperCase() || '?'
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return '?'
}
