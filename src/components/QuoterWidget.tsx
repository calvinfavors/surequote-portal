import { useState, useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { MAPBOX_TOKEN } from '../lib/constants';
import { supabase } from '../lib/supabase';
import { queryBuildingAtPoint } from '../lib/buildingFootprint';
import type { Quoter } from '../lib/types';
import { INDUSTRY_META } from '../lib/types';
import type { Position } from 'geojson';
import { MapPin, Loader2, ChevronRight, ChevronLeft, Check, Pencil, RotateCcw } from 'lucide-react';

mapboxgl.accessToken = MAPBOX_TOKEN;

interface Props {
  quoter: Quoter;
  onEvent: (type: string, meta?: Record<string, unknown>) => void;
}

type Step = 'address' | 'measure' | 'options' | 'contact' | 'result';
type MeasureMode = 'loading' | 'auto' | 'draw';

export default function QuoterWidget({ quoter, onEvent }: Props) {
  const { config, branding, industry } = quoter;
  const meta = INDUSTRY_META[industry || 'gutters'];
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawPointsRef = useRef<Position[]>([]);
  const drawMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const measureModeRef = useRef<MeasureMode>('loading');

  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ place_name: string; center: [number, number] }>>([]);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [linearFeet, setLinearFeet] = useState(0);
  const [measureMode, setMeasureMode] = useState<MeasureMode>('loading');
  const [selectedMaterial, setSelectedMaterial] = useState(config.materials[0]?.name || '');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const setMeasureModeSync = (mode: MeasureMode) => {
    measureModeRef.current = mode;
    setMeasureMode(mode);
  };

  const btnStyle = {
    backgroundColor: branding.primary_color,
    color: branding.text_color,
    borderRadius: `${branding.button_radius}px`,
    fontFamily: branding.font_family,
  };

  const searchAddress = useCallback((query: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=us&types=address&limit=5`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    }, 300);
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  const selectAddress = (place: { place_name: string; center: [number, number] }) => {
    setAddress(place.place_name);
    setSelectedCoords(place.center);
    setSuggestions([]);
    onEvent('click', { address: place.place_name });
  };

  const updateMapSource = (sourceId: string, data: GeoJSON.GeoJSON) => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
    if (source) source.setData(data);
  };

  const calcPerimeterFromPoints = useCallback((points: Position[]) => {
    if (points.length < 3) {
      setLinearFeet(0);
      return;
    }
    const closed = [...points, points[0]];
    const poly = turf.polygon([closed]);
    const line = turf.polygonToLine(poly);
    const km = turf.length(line, { units: 'kilometers' });
    setLinearFeet(Math.round(km * 3280.84));
    updateMapSource('roof-outline', poly);
    updateMapSource('roof-fill', poly);
  }, []);

  const clearDrawing = useCallback(() => {
    drawPointsRef.current = [];
    drawMarkersRef.current.forEach((m) => m.remove());
    drawMarkersRef.current = [];
    setLinearFeet(0);
    updateMapSource('roof-outline', { type: 'FeatureCollection', features: [] });
    updateMapSource('roof-fill', { type: 'FeatureCollection', features: [] });
  }, []);

  const startDrawMode = useCallback(() => {
    clearDrawing();
    setMeasureModeSync('draw');
    const map = mapRef.current;
    if (!map || !selectedCoords) return;
    map.flyTo({ center: selectedCoords, zoom: 19, duration: 500 });
  }, [clearDrawing, selectedCoords]);

  useEffect(() => {
    if (step !== 'measure' || !selectedCoords || !mapContainer.current) return;

    const shouldAutoMeasure = meta.autoMeasure;
    setMeasureModeSync(shouldAutoMeasure ? 'loading' : 'draw');
    setLinearFeet(0);
    drawPointsRef.current = [];
    drawMarkersRef.current = [];

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: selectedCoords,
      zoom: 18,
      pitch: 0,
    });

    mapRef.current = map;

    map.on('load', () => {
      if (shouldAutoMeasure) {
        map.addSource('building-data', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-streets-v8',
        });
        map.addLayer({
          id: 'building-footprint',
          type: 'fill',
          source: 'building-data',
          'source-layer': 'building',
          paint: {
            'fill-color': branding.primary_color,
            'fill-opacity': 0,
          },
        });
      }

      map.addSource('roof-fill', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'roof-fill-layer',
        type: 'fill',
        source: 'roof-fill',
        paint: { 'fill-color': branding.primary_color, 'fill-opacity': 0.2 },
      });

      map.addSource('roof-outline', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'roof-outline-line',
        type: 'line',
        source: 'roof-outline',
        paint: { 'line-color': branding.primary_color, 'line-width': 3 },
      });

      if (shouldAutoMeasure) {
        map.once('idle', () => {
          if (!mapRef.current) return;

          const result = queryBuildingAtPoint(map, selectedCoords);

          if (result.polygon && result.perimeterFeet > 0) {
            setLinearFeet(result.perimeterFeet);
            setMeasureModeSync('auto');

            updateMapSource('roof-outline', result.polygon);
            updateMapSource('roof-fill', result.polygon);

            const bbox = turf.bbox(result.polygon);
            map.fitBounds(
              [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
              { padding: 60, maxZoom: 20, duration: 800 }
            );
          } else {
            setMeasureModeSync('draw');
          }
        });
      }

      map.on('click', (e) => {
        if (measureModeRef.current !== 'draw') return;

        const points = drawPointsRef.current;
        const newPoint: Position = [e.lngLat.lng, e.lngLat.lat];
        points.push(newPoint);

        const idx = drawMarkersRef.current.length;
        const marker = new mapboxgl.Marker({
          color: branding.primary_color,
          scale: 0.6,
          draggable: true,
        })
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map);

        marker.on('drag', () => {
          const pos = marker.getLngLat();
          drawPointsRef.current[idx] = [pos.lng, pos.lat];
          if (drawPointsRef.current.length >= 3) {
            calcPerimeterFromPoints(drawPointsRef.current);
          }
        });

        drawMarkersRef.current.push(marker);

        if (points.length >= 3) {
          calcPerimeterFromPoints(points);
        } else if (points.length === 2) {
          updateMapSource('roof-outline', turf.lineString(points));
        }
      });
    });

    return () => {
      drawMarkersRef.current.forEach((m) => m.remove());
      drawMarkersRef.current = [];
      drawPointsRef.current = [];
      mapRef.current = null;
      map.remove();
    };
  }, [step, selectedCoords]);

  const calculateFinalPrice = () => {
    const mat = config.materials.find((m) => m.name === selectedMaterial);
    const baseCost = (mat?.pricePerFoot || 0) * linearFeet;
    let addonCost = 0;
    for (const addonName of selectedAddons) {
      const addon = config.add_ons.find((a) => a.name === addonName);
      if (addon) {
        addonCost += (addon.pricePerFoot || 0) * linearFeet;
        addonCost += addon.priceEach || 0;
      }
    }
    return Math.max(baseCost + addonCost, config.minimum_charge);
  };

  const submitQuote = async () => {
    setLoading(true);
    const finalPrice = Math.round(calculateFinalPrice());
    setTotalPrice(finalPrice);

    await supabase.from('leads').insert({
      quoter_id: quoter.id,
      user_id: quoter.user_id,
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      address,
      estimated_linear_feet: linearFeet,
      quoted_price: finalPrice,
      selected_material: selectedMaterial,
      selected_addons: selectedAddons,
      status: 'new',
    });

    onEvent('quote_completed', {
      address,
      linear_feet: linearFeet,
      material: selectedMaterial,
      price: finalPrice,
    });

    setStep('result');
    setLoading(false);
  };

  const containerStyle = {
    fontFamily: branding.font_family,
    '--primary': branding.primary_color,
    '--secondary': branding.secondary_color,
  } as React.CSSProperties;

  const stepOrder: Step[] = ['address', 'measure', 'options', 'contact', 'result'];
  const currentIndex = stepOrder.indexOf(step);

  return (
    <div className="min-h-screen bg-white" style={containerStyle}>
      <div className="max-w-lg mx-auto px-4 py-6">
        {branding.logo_url && (
          <div className="text-center mb-4">
            <img src={branding.logo_url} alt={branding.company_name} className="h-10 mx-auto" />
          </div>
        )}
        {branding.company_name && !branding.logo_url && (
          <h2 className="text-center text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: branding.font_family }}>
            {branding.company_name}
          </h2>
        )}

        <div className="flex items-center justify-center gap-2 mb-6">
          {stepOrder.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s ? 'text-white' : (currentIndex > i ? 'text-white' : 'bg-gray-200 text-gray-400')
                }`}
                style={step === s || currentIndex > i ? { backgroundColor: branding.primary_color } : undefined}
              >
                {currentIndex > i ? <Check size={14} /> : i + 1}
              </div>
              {i < 4 && <div className="w-6 h-0.5 bg-gray-200 rounded" />}
            </div>
          ))}
        </div>

        {step === 'address' && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Enter Your Address</h3>
            <p className="text-sm text-gray-500 mb-4">{meta.addressSubtext}</p>
            <div className="relative">
              <MapPin size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => { setAddress(e.target.value); searchAddress(e.target.value); }}
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ '--tw-ring-color': branding.primary_color } as React.CSSProperties}
                placeholder="Start typing your address..."
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => selectAddress(s)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <MapPin size={14} className="inline mr-2 text-gray-400" />
                      {s.place_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedCoords && (
              <button
                onClick={() => setStep('measure')}
                className="mt-4 w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={btnStyle}
              >
                Continue <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}

        {step === 'measure' && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{meta.measureTitle}</h3>

            {measureMode === 'loading' && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Loader2 size={14} className="animate-spin" style={{ color: branding.primary_color }} />
                Detecting building footprint...
              </div>
            )}

            {measureMode === 'auto' && linearFeet > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                We detected approximately <strong className="text-gray-900">{linearFeet} {meta.measurementUnit}</strong> of {meta.measurementLabel.toLowerCase()}.
              </p>
            )}

            {measureMode === 'draw' && (
              <div className="mb-4">
                {linearFeet > 0 ? (
                  <p className="text-sm text-gray-500">
                    Your outline: <strong className="text-gray-900">{linearFeet} {meta.measurementUnit}</strong>. Click to add more points or drag to adjust.
                  </p>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-sm text-amber-800 font-medium mb-0.5">Draw your outline</p>
                    <p className="text-xs text-amber-600">{meta.drawInstructions} You can drag points to adjust.</p>
                  </div>
                )}
              </div>
            )}

            <div
              ref={mapContainer}
              className="w-full h-72 rounded-xl overflow-hidden border border-gray-200 mb-3"
              style={measureMode === 'draw' ? { cursor: 'crosshair' } : undefined}
            />

            <div className="flex items-center gap-2 mb-4">
              {measureMode === 'auto' && (
                <button
                  onClick={startDrawMode}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <Pencil size={12} /> Draw manually instead
                </button>
              )}
              {measureMode === 'draw' && drawPointsRef.current.length > 0 && (
                <button
                  onClick={clearDrawing}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <RotateCcw size={12} /> Clear & redraw
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('address')}
                className="flex-1 py-3 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep('options')}
                disabled={linearFeet === 0}
                className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                style={btnStyle}
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 'options' && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Choose Your Options</h3>
            <p className="text-sm text-gray-500 mb-4">{config.options_description || meta.optionsDescription}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{config.material_label || meta.materialLabel}</label>
              <div className="grid grid-cols-2 gap-2">
                {config.materials.map((mat) => (
                  <button
                    key={mat.name}
                    onClick={() => setSelectedMaterial(mat.name)}
                    className={`text-left p-3 rounded-xl border text-sm transition-all ${
                      selectedMaterial === mat.name ? 'border-2' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={selectedMaterial === mat.name ? { borderColor: branding.primary_color, backgroundColor: `${branding.primary_color}08` } : undefined}
                  >
                    <span className="font-medium text-gray-900">{mat.name}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">${mat.pricePerFoot}/ft</span>
                  </button>
                ))}
              </div>
            </div>

            {config.add_ons.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add-Ons (optional)</label>
                <div className="space-y-2">
                  {config.add_ons.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.name);
                    return (
                      <button
                        key={addon.name}
                        onClick={() => {
                          setSelectedAddons(
                            isSelected ? selectedAddons.filter((a) => a !== addon.name) : [...selectedAddons, addon.name]
                          );
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                          isSelected ? 'border-2' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={isSelected ? { borderColor: branding.primary_color, backgroundColor: `${branding.primary_color}08` } : undefined}
                      >
                        <span className="text-gray-900 font-medium">{addon.name}</span>
                        <span className="text-xs text-gray-500">
                          {addon.pricePerFoot ? `$${addon.pricePerFoot}/ft` : ''}
                          {addon.pricePerFoot && addon.priceEach ? ' + ' : ''}
                          {addon.priceEach ? `$${addon.priceEach}` : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('measure')}
                className="flex-1 py-3 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep('contact')}
                className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={btnStyle}
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 'contact' && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Your Contact Info</h3>
            <p className="text-sm text-gray-500 mb-4">Enter your details to receive your instant quote.</p>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': branding.primary_color } as React.CSSProperties}
                placeholder="Your name"
              />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': branding.primary_color } as React.CSSProperties}
                placeholder="Email address"
              />
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': branding.primary_color } as React.CSSProperties}
                placeholder="Phone number"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('options')}
                className="flex-1 py-3 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={submitQuote}
                disabled={loading || !contactName || !contactEmail}
                className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={btnStyle}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <>Get My Quote <ChevronRight size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="animate-fade-in text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${branding.primary_color}15` }}
            >
              <Check size={32} style={{ color: branding.primary_color }} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Your Estimate</h3>
            <p className="text-sm text-gray-500 mb-6">{address}</p>
            <div className="text-5xl font-extrabold mb-2" style={{ color: branding.primary_color }}>
              ${totalPrice.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {linearFeet} linear feet &middot; {selectedMaterial}
              {selectedAddons.length > 0 && ` + ${selectedAddons.length} add-on${selectedAddons.length > 1 ? 's' : ''}`}
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Material ({selectedMaterial})</span>
                <span className="font-medium text-gray-900">
                  ${((config.materials.find((m) => m.name === selectedMaterial)?.pricePerFoot || 0) * linearFeet).toLocaleString()}
                </span>
              </div>
              {selectedAddons.map((addonName) => {
                const addon = config.add_ons.find((a) => a.name === addonName);
                if (!addon) return null;
                const cost = (addon.pricePerFoot || 0) * linearFeet + (addon.priceEach || 0);
                return (
                  <div key={addonName} className="flex justify-between">
                    <span className="text-gray-500">{addonName}</span>
                    <span className="font-medium text-gray-900">${cost.toLocaleString()}</span>
                  </div>
                );
              })}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span className="text-gray-900">Total Estimate</span>
                <span style={{ color: branding.primary_color }}>${totalPrice.toLocaleString()}</span>
              </div>
            </div>
            {branding.company_phone && (
              <p className="text-sm text-gray-500">
                Questions? Call us at <a href={`tel:${branding.company_phone}`} className="font-medium" style={{ color: branding.primary_color }}>{branding.company_phone}</a>
              </p>
            )}
          </div>
        )}

        {branding.show_powered_by && (
          <p className="text-center text-xs text-gray-400 mt-8">
            Powered by <span className="font-semibold" style={{ color: branding.primary_color }}>SureQuote AI</span>
          </p>
        )}
      </div>
    </div>
  );
}
