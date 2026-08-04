export interface SoldeJour {
  entrees: number
  sorties: number
  solde: number
}

export interface Transaction {
  id: string
  commercantId: string
  type: 'entree' | 'sortie'
  montant: number
  libelle: string | null
  date: string
  createdAt: string
}

export interface Dette {
  id: string
  commercantId: string
  nomClient: string
  montant: number
  dateEcheance: string | null
  statut: 'due' | 'payee'
  createdAt: string
  paidAt: string | null
}
