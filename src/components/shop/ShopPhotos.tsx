interface ShopPhotosProps {
  photos: string[];
  shopName: string;
}

export function ShopPhotos({ photos, shopName }: ShopPhotosProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-xl">Photos</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {photos.map((photo, i) => (
          <img
            key={i}
            src={photo}
            alt={`${shopName} photo ${i + 1}`}
            className="h-40 w-56 rounded-lg object-cover shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
