import { useState, useEffect } from "react";
import { Search, MapPin, Clock, ShoppingBag } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { ProviderCard } from "@/components/shared/ProviderCard";
import { EmptyState } from "@/components/ui/empty-state";
import * as api from "@/lib/api";
import { customerTabHandler } from "@/lib/nav";
import type { Route } from "@/lib/router";
import type { BusinessListing, Product } from "@/lib/api";
import { useApp } from "@/state/AppContext";

interface ProductsProps {
  navigate: (route: Route) => void;
}

interface ProductCardProps {
  product: Product;
  business: BusinessListing;
}

function ProductCard({ product, business }: ProductCardProps) {
  return (
    <div className="group rounded-lg border border-deep-slate/10 bg-white p-4 transition-colors hover:border-electric-mint/50">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
          <ShoppingBag className="size-6" />
        </div>
        <div className="flex min-w-0 flex-1 gap-2">
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-primary">{product.name}</h3>
            <p className="mt-0.5 text-[13px] text-on-surface-variant">{business.name}</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-[16px] font-bold text-primary">{product.price.toLocaleString()} PKR</span>
              {product.etaMinutes && (
                <span className="flex items-center gap-1 text-[12px] text-on-surface-variant">
                  <Clock className="size-3.5" />
                  {product.etaMinutes} min
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Products({ navigate }: ProductsProps) {
  const { showToast } = useApp();
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listBusinesses()
      .then(list => {
        if (!cancelled) {
          setBusinesses(list);
          setLoaded(true);
        }
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!selectedBusiness) {
      setProducts({});
      return;
    }
    api
      .getCatalog(selectedBusiness)
      .then(result => {
        if (!cancelled) {
          setProducts(prev => ({ ...prev, [selectedBusiness]: result.products }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedBusiness]);

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = !searchQuery || business.name.toLowerCase().includes(searchQuery.toLowerCase()) || business.category.toLowerCase().includes(searchQuery.toLowerCase()) || business.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || business.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onTab = customerTabHandler(navigate, showToast);

  return (
    <DeviceFrame>
      <TopAppBar title={<h1 className="text-lg font-bold tracking-tight text-primary">Products</h1>} />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-24 pt-3">
        {!selectedBusiness ? (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products or providers..."
                className="w-full rounded-md border border-deep-slate/10 bg-white py-3 pl-11 pr-4 text-[15px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-electric-mint"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["bakery", "restaurant"].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(prev => (prev === category ? null : category))}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    selectedCategory === category
                      ? "border-electric-mint bg-electric-mint/10 text-deep-slate"
                      : "border-deep-slate/10 bg-white text-on-surface-variant hover:border-electric-mint/50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {loaded && filteredBusinesses.length > 0 ? (
                filteredBusinesses.map(business => (
                  <button
                    key={business.id}
                    onClick={() => setSelectedBusiness(business.id)}
                    className="text-left"
                  >
                    <ProviderCard provider={business} onClick={() => {}} />
                  </button>
                ))
              ) : (
                <EmptyState icon={Search} title={loaded ? "No matching providers" : "Loading providers..."} description="Try a different category or search term." />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setSelectedBusiness(null)}
              className="flex items-center gap-2 text-[15px] font-medium text-secondary hover:text-secondary-fixed"
            >
              ← Back to providers
            </button>

            {selectedBusiness && businesses.find(b => b.id === selectedBusiness) && (
              <div className="rounded-lg border border-deep-slate/10 bg-white p-4">
                {(() => {
                  const business = businesses.find(b => b.id === selectedBusiness);
                  if (!business) return null;
                  return (
                    <div className="flex items-start gap-4">
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
                        <ShoppingBag className="size-8" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-[20px] font-bold text-primary">{business.name}</h2>
                        <p className="mt-0.5 text-[14px] text-on-surface-variant capitalize">{business.category}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[13px] text-on-surface-variant">
                            <MapPin className="size-3.5" />
                            {business.neighborhood}, {business.city}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {selectedBusiness && products[selectedBusiness] && (
              <div className="flex flex-col gap-3">
                <h2 className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Available items</h2>
                {products[selectedBusiness].length === 0 ? (
                  <p className="rounded-lg border border-deep-slate/10 bg-white p-4 text-[14px] text-on-surface-variant">
                    This shop has no items available right now.
                  </p>
                ) : (
                  products[selectedBusiness].map(product => (
                    <ProductCard key={product.id} product={product} business={businesses.find(b => b.id === selectedBusiness)!} />
                  ))
                )}
              </div>
            )}

            {selectedBusiness && !products[selectedBusiness] && loaded && (
              <EmptyState icon={ShoppingBag} title="Loading products..." description="Please wait." />
            )}
          </div>
        )}
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="customer" active="products" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}
