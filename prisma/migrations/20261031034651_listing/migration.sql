-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_storeId_idx" ON "Listing"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_partId_storeId_key" ON "Listing"("partId", "storeId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
