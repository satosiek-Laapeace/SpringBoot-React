import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, LocateFixed, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CAMBODIA_CENTER = { lat: 11.5564, lng: 104.9282 };
const CAMBODIA_BOUNDS = { north: 14.8, south: 9.5, east: 107.7, west: 102.3 };
const isInCambodiaBounds = (lat, lng) => lat >= CAMBODIA_BOUNDS.south && lat <= CAMBODIA_BOUNDS.north && lng >= CAMBODIA_BOUNDS.west && lng <= CAMBODIA_BOUNDS.east;

const loadGoogleMaps = (apiKey, language) => {
  if (window.google?.maps) return Promise.resolve(window.google);
  if (window.__craftFarmMapsPromise) return window.__craftFarmMapsPromise;
  window.__craftFarmMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=${language === 'km' ? 'km' : 'en'}&region=KH`;
    script.async = true;
    script.defer = true;
    script.onload = () => window.google?.maps ? resolve(window.google) : reject(new Error('Google Maps could not be initialized.'));
    script.onerror = () => reject(new Error('Google Maps failed to load.'));
    document.head.appendChild(script);
  });
  return window.__craftFarmMapsPromise;
};

const getAddressParts = components => {
  const value = types => {
    const component = components.find(item => types.some(type => item.types.includes(type)));
    return component?.longText || component?.long_name || '';
  };
  return {
    street: [value(['street_number']), value(['route'])].filter(Boolean).join(' '),
    city: value(['locality', 'administrative_area_level_2', 'sublocality']),
    state: value(['administrative_area_level_1']),
    zip: value(['postal_code']),
    country: 'Cambodia',
  };
};

export const GoogleAddressPicker = ({ address, onLocationSelect }) => {
  const { t, language } = useLanguage();
  const mapElement = useRef(null);
  const autocompleteContainer = useRef(null);
  const mapState = useRef(null);
  const [search, setSearch] = useState(address.formattedAddress || '');
  const [mapError, setMapError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const initialLat = Number(address.latitude);
  const initialLng = Number(address.longitude);
  const initialCenter = isInCambodiaBounds(initialLat, initialLng) ? { lat: initialLat, lng: initialLng } : CAMBODIA_CENTER;

  useEffect(() => {
    if (!apiKey || !mapElement.current) return undefined;
    let active = true;
    loadGoogleMaps(apiKey, language).then(google => {
      if (!active || !mapElement.current) return;
      const map = new google.maps.Map(mapElement.current, {
        center: initialCenter,
        zoom: address.latitude && address.longitude ? 16 : 12,
        restriction: { latLngBounds: CAMBODIA_BOUNDS, strictBounds: true },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        clickableIcons: false,
      });
      const marker = new google.maps.Marker({ map, position: address.latitude && address.longitude ? initialCenter : null, draggable: true });
      const geocoder = new google.maps.Geocoder();
      const applyPlace = (place, location) => {
        if (!location) return;
        const lat = location.lat();
        const lng = location.lng();
        const formattedAddress = place.formatted_address || '';
        const components = place.address_components || [];
        const countryComponent = components.find(component => component.types.includes('country'));
        const country = countryComponent?.shortText || countryComponent?.short_name;
        if (country && country !== 'KH') {
          setMapError(t('addressMapCambodiaOnly'));
          return;
        }
        const parts = getAddressParts(components);
        const result = {
          ...parts,
          latitude: lat,
          longitude: lng,
          googlePlaceId: place.id || place.place_id || '',
          formattedAddress,
        };
        onLocationSelect(result);
        setSearch(formattedAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setMapError('');
        map.setCenter(location);
        map.setZoom(16);
        marker.setPosition(location);
      };
      const reverseGeocode = location => geocoder.geocode({ location, region: 'KH' }, (results, status) => {
        const place = status === 'OK' && results?.find(result => result.address_components?.some(component => component.types.includes('country') && component.short_name === 'KH'));
        if (!place) {
          setMapError(t('addressMapCambodiaOnly'));
          return;
        }
        applyPlace(place, location);
      });
      map.addListener('click', event => {
        if (event.latLng) reverseGeocode(event.latLng);
      });
      marker.addListener('dragend', event => reverseGeocode(event.latLng));
      if (autocompleteContainer.current) {
        google.maps.importLibrary('places').then(({ PlaceAutocompleteElement }) => {
          if (!active || !autocompleteContainer.current) return;
          const autocomplete = new PlaceAutocompleteElement();
          autocomplete.includedRegionCodes = ['kh'];
          autocomplete.placeholder = t('addressSearchPlaces');
          autocomplete.locationRestriction = new google.maps.LatLngBounds(
            { lat: CAMBODIA_BOUNDS.south, lng: CAMBODIA_BOUNDS.west },
            { lat: CAMBODIA_BOUNDS.north, lng: CAMBODIA_BOUNDS.east },
          );
          autocompleteContainer.current.replaceChildren(autocomplete);
          autocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
            const place = placePrediction.toPlace();
            await place.fetchFields({ fields: ['addressComponents', 'formattedAddress', 'location', 'id'] });
            if (!place.location) {
              setMapError(t('addressMapNoResult'));
              return;
            }
            applyPlace({
              address_components: place.addressComponents || [],
              formatted_address: place.formattedAddress || '',
              id: place.id,
            }, place.location);
          });
        }).catch(() => setMapError(t('addressMapNoResult')));
      }
      mapState.current = { map, marker, reverseGeocode };
      setMapReady(true);
    }).catch(error => {
      if (active) setMapError(t('addressMapLoadError'));
    });
    return () => { active = false; };
  }, [apiKey]);

  const useCurrentLocation = () => {
    setMapError('');
    if (!navigator.geolocation) {
      setMapError(t('addressMapLocationUnavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      const location = { lat: position.coords.latitude, lng: position.coords.longitude };
      if (!isInCambodiaBounds(location.lat, location.lng)) {
        setMapError(t('addressMapCambodiaOnly'));
        return;
      }
      if (mapState.current) mapState.current.reverseGeocode(new window.google.maps.LatLng(location.lat, location.lng));
      else {
        setSearch(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
        onLocationSelect({ latitude: location.lat, longitude: location.lng, country: 'Cambodia' });
      }
    }, () => setMapError(t('addressMapLocationDenied')), { enableHighAccuracy: true, timeout: 12000 });
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(search || 'Cambodia')}`;
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(search || 'Cambodia')}&output=embed`;

  return (
    <section className="space-y-2.5 sm:col-span-2" aria-label={t('addressChooseOnMap')}>
      <div className="flex flex-col gap-2 sm:flex-row">
        {apiKey ? <div ref={autocompleteContainer} className="min-h-11 min-w-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950" /> : <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t('addressSearchPlaces')}</span>
          <MapPin aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('addressSearchPlaces')} className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </label>}
        <button type="button" onClick={useCurrentLocation} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-emerald-500 dark:border-slate-700 dark:text-slate-200"><LocateFixed className="h-4 w-4" />{t('addressUseCurrentLocation')}</button>
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-emerald-500 dark:border-slate-700 dark:text-slate-200"><ExternalLink className="h-4 w-4" />{t('addressOpenGoogleMaps')}</a>
      </div>
      {apiKey ? <div ref={mapElement} className="h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700" role="application" aria-label={t('addressChooseOnMap')} /> : <iframe title={t('addressChooseOnMap')} src={embedUrl} className="h-64 w-full rounded-xl border border-slate-200 dark:border-slate-700" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
      {!apiKey && <p className="text-xs leading-5 text-slate-500">{t('addressMapKeyRequired')}</p>}
      {mapError && <p role="alert" className="text-xs leading-5 text-rose-700">{mapError}</p>}
      {mapReady && address.latitude && address.longitude && <p className="text-xs text-emerald-700">{t('addressMapPinSelected')}: {Number(address.latitude).toFixed(6)}, {Number(address.longitude).toFixed(6)}</p>}
    </section>
  );
};
