interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
  startDate?: string;
  endDate?: string;
  targetSegments: string[];
  isActive: boolean;
  createdAt: string;
}

interface BannerListProps {
  banners: Banner[];
  onReorder: (reorderedBanners: Banner[]) => Promise<void>;
  onEdit: (banner: Banner) => void;
  onDelete: (bannerId: string) => Promise<void>;
}

export function BannerList({ banners, onEdit, onDelete }: BannerListProps) {
  return (
    <div className="space-y-4">
      {banners.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-600">No banners found. Create your first banner to get started.</p>
        </div>
      ) : (
        banners.map((banner) => (
          <div key={banner.id} className="p-4 bg-white border rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={banner.imageUrl} alt={banner.title} className="w-20 h-20 object-cover rounded" />
              <div>
                <h3 className="font-semibold">{banner.title}</h3>
                <p className="text-sm text-gray-500">Order: {banner.displayOrder}</p>
                <span className={`text-xs px-2 py-1 rounded ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(banner)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(banner.id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
