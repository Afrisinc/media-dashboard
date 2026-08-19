import { useState, useEffect } from "react";
import { listBrandAssets, type BrandAsset } from "@/services/brandAssetService";
import { AlertCircle, Upload } from "lucide-react";
import "./AssetSelector.css";

interface AssetSelectorProps {
  selectedAssets?: string[];
  onChange?: (assetIds: string[]) => void;
  label?: string;
  maxSelection?: number;
  showUpload?: boolean;
}

export const AssetSelector = ({
  selectedAssets = [],
  onChange,
  label = "Brand Assets",
  maxSelection,
  showUpload = false,
}: AssetSelectorProps) => {
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(selectedAssets),
  );

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await listBrandAssets();
      // Only show approved assets in selector
      setAssets(data.filter((a) => a.approved));
      setError(null);
    } catch (err) {
      setError("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const handleAssetToggle = (assetId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      if (maxSelection && newSelected.size >= maxSelection) {
        setError(`Maximum ${maxSelection} assets allowed`);
        return;
      }
      newSelected.add(assetId);
    }
    setSelected(newSelected);
    onChange?.(Array.from(newSelected));
  };

  return (
    <div className="asset-selector">
      <div className="asset-selector-header">
        <label className="asset-selector-label">{label}</label>
        {maxSelection && (
          <span className="asset-selector-count">
            {selected.size}/{maxSelection}
          </span>
        )}
      </div>

      {error && (
        <div className="asset-selector-error">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="asset-selector-loading">Loading assets...</div>
      ) : assets.length === 0 ? (
        <div className="asset-selector-empty">
          {showUpload ? (
            <>
              <Upload className="w-6 h-6" />
              <p>No brand assets available</p>
              <p className="text-sm">Upload assets first to use them</p>
            </>
          ) : (
            <p>No brand assets available</p>
          )}
        </div>
      ) : (
        <div className="asset-selector-grid">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className={`asset-selector-item ${
                selected.has(asset.id) ? "selected" : ""
              }`}
              onClick={() => handleAssetToggle(asset.id)}
            >
              <div className="asset-selector-image">
                <img src={asset.url} alt={asset.reference} />
                {selected.has(asset.id) && (
                  <div className="asset-selector-checkmark">✓</div>
                )}
              </div>
              <div className="asset-selector-info">
                <p className="asset-selector-reference">{asset.reference}</p>
                {asset.subjects && asset.subjects.length > 0 && (
                  <div className="asset-selector-subjects">
                    {asset.subjects.slice(0, 2).map((s) => (
                      <span key={s} className="subject-chip">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
