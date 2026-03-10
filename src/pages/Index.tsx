import { useState, useMemo } from "react";
import { CoffeeMap } from "@/components/CoffeeMap";
import { FilterBar } from "@/components/FilterBar";
import { LocationBar } from "@/components/LocationBar";
import { AppHeader } from "@/components/AppHeader";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useNearbyShops } from "@/hooks/useNearbyShops";
import { useAllShops } from "@/hooks/useAllShops";

const Index = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const locationState = useUserLocation();
  const { shops: nearbyShops, loading: nearbyLoading, error: nearbyError } = useNearbyShops(locationState.location);

  const allShops = useAllShops(nearbyShops, locationState.location, locationState.status);

  const filteredShops = useMemo(() => {
    if (activeFilters.length === 0) return allShops;
    return allShops.filter((shop) =>
      activeFilters.every((f) => {
        if (f === "openNow") return shop.isOpen;
        return shop.attributes[f as keyof typeof shop.attributes];
      })
    );
  }, [activeFilters, allShops]);

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <FilterBar
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
        onClearAll={() => setActiveFilters([])}
        matchCount={filteredShops.length}
        totalCount={allShops.length}
      />
      <div className="flex-1 relative">
        <LocationBar locationState={locationState} />
        {/* DEBUG PANEL — remove after diagnosis */}
        <div style={{position:"fixed",bottom:8,right:8,zIndex:9999,fontFamily:"monospace"}}>
          {debugOpen ? (
            <div style={{background:"rgba(0,0,0,0.85)",color:"white",fontSize:11,padding:8,borderRadius:8,lineHeight:1.6,maxWidth:320}}>
              <button onClick={() => setDebugOpen(false)} style={{float:"right",background:"none",border:"none",color:"white",cursor:"pointer",fontSize:13}}>✕</button>
              <div>status: {locationState.status}</div>
              <div>loc: {locationState.location ? `${locationState.location.lat.toFixed(4)}, ${locationState.location.lng.toFixed(4)}` : "null"}</div>
              <div>allShops: {allShops.length} | nearbyShops: {nearbyShops.length}</div>
              <div>nearbyLoading: {String(nearbyLoading)}</div>
              <div style={{marginTop:4}}><b>API raw:</b> {nearbyShops.map(s => s.name).join(', ') || '—'}</div>
              <div style={{marginTop:4}}><b>final:</b> {allShops.map(s => s.name).join(', ') || '—'}</div>
              {nearbyError && <div style={{color:'#f87'}}>nearbyErr: {nearbyError}</div>}
              {locationState.error && <div style={{color:'#f87'}}>locErr: {locationState.error}</div>}
            </div>
          ) : (
            <button onClick={() => setDebugOpen(true)} style={{background:"rgba(0,0,0,0.7)",color:"white",border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,cursor:"pointer"}}>
              🐛 debug
            </button>
          )}
        </div>
        {nearbyLoading && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[1000] bg-background/90 backdrop-blur px-3 py-1.5 rounded-full text-xs text-muted-foreground shadow-sm border border-border">
            Loading nearby shops…
          </div>
        )}
        <CoffeeMap
          filteredShops={filteredShops}
          selectedShop={selectedShop}
          onSelectShop={setSelectedShop}
          userLocation={locationState.location}
          locationStatus={locationState.status}
        />
      </div>
    </div>
  );
};

export default Index;
