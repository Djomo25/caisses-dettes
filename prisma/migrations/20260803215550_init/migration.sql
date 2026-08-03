-- CreateTable
CREATE TABLE "Commercant" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commercant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeConnexion" (
    "id" TEXT NOT NULL,
    "commercantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "utilise" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeConnexion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionCaisse" (
    "id" TEXT NOT NULL,
    "commercantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "libelle" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionCaisse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetteClient" (
    "id" TEXT NOT NULL,
    "commercantId" TEXT NOT NULL,
    "nomClient" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "dateEcheance" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'due',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "DetteClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Commercant_email_key" ON "Commercant"("email");

-- AddForeignKey
ALTER TABLE "CodeConnexion" ADD CONSTRAINT "CodeConnexion_commercantId_fkey" FOREIGN KEY ("commercantId") REFERENCES "Commercant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionCaisse" ADD CONSTRAINT "TransactionCaisse_commercantId_fkey" FOREIGN KEY ("commercantId") REFERENCES "Commercant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetteClient" ADD CONSTRAINT "DetteClient_commercantId_fkey" FOREIGN KEY ("commercantId") REFERENCES "Commercant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
