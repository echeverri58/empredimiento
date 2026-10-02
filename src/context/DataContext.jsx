import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // Índice ligero (años + totales) y caché de años ya descargados
  const [yearIndex, setYearIndex] = useState(null);
  const [yearCache, setYearCache] = useState({});
  const [historyMap, setHistoryMap] = useState({});
  const [historyTried, setHistoryTried] = useState(false);
  const [publicEntities, setPublicEntities] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedPublicSector, setSelectedPublicSector] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [publicSearchQuery, setPublicSearchQuery] = useState('');
  const [rankLimit, setRankLimit] = useState(1000);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedPublicEntity, setSelectedPublicEntity] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const base = import.meta.env.BASE_URL;

  // 1) Carga inicial ligera: índice de años + entidades públicas
  useEffect(() => {
    let cancelado = false;

    Promise.all([
      fetch(`${base}data/index.json`).then((res) => {
        if (!res.ok) throw new Error('Error al cargar el índice de datos');
        return res.json();
      }),
      fetch(`${base}public_entities.json`).then((res) => {
        if (!res.ok) throw new Error('Error al cargar entidades públicas');
        return res.json();
      })
    ])
      .then(([indice, publicData]) => {
        if (cancelado) return;
        setYearIndex(indice);
        setPublicEntities(publicData);

        // Abrir siempre en el año fiscal más reciente del dataset
        if (indice.years && indice.years.length) {
          setSelectedYear(indice.years[0]);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        if (cancelado) return;
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelado = true; };
  }, [base]);

  // 2) Año seleccionado: se descarga una sola vez y queda en caché
  useEffect(() => {
    if (!selectedYear) return;
    if (yearCache[selectedYear]) {
      setLoading(false);
      return;
    }

    let cancelado = false;
    setLoading(true);

    fetch(`${base}data/${selectedYear}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Error al cargar el año ${selectedYear}`);
        return res.json();
      })
      .then((rows) => {
        if (cancelado) return;
        setYearCache((prev) => ({ ...prev, [selectedYear]: rows }));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelado) return;
        console.error('Error fetching year:', err);
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelado = true; };
  }, [selectedYear, base, yearCache]);

  // 3) Historial multi-año en segundo plano (solo lo usa la ficha de empresa).
  //    Se pide después del primer render para no competir con el año activo.
  useEffect(() => {
    if (!yearIndex || historyTried) return;

    const timer = setTimeout(() => {
      fetch(`${base}data/history.json`)
        .then((res) => (res.ok ? res.json() : {}))
        .then((data) => setHistoryMap(data || {}))
        .catch(() => { /* el historial es opcional */ })
        .finally(() => setHistoryTried(true));
    }, 1500);

    return () => clearTimeout(timer);
  }, [yearIndex, historyTried, base]);

  const years = useMemo(() => yearIndex?.years || [], [yearIndex]);

  const currentYearData = useMemo(() => yearCache[selectedYear] || [], [yearCache, selectedYear]);

  const sectorsList = useMemo(() => {
    if (!currentYearData.length) return [];
    const set = new Set(currentYearData.map((d) => d.sector).filter(Boolean));
    return Array.from(set).sort();
  }, [currentYearData]);

  const publicSectorsList = useMemo(() => {
    if (!publicEntities.length) return [];
    const set = new Set(publicEntities.map((d) => d.sector).filter(Boolean));
    return Array.from(set).sort();
  }, [publicEntities]);

  const citiesList = useMemo(() => {
    if (!currentYearData.length) return [];
    const set = new Set(currentYearData.map((d) => d.city).filter(Boolean));
    return Array.from(set).sort();
  }, [currentYearData]);

  const filteredCompanies = useMemo(() => {
    let result = currentYearData;

    if (selectedSector !== 'ALL') {
      result = result.filter((c) => c.sector === selectedSector);
    }

    if (selectedCity !== 'ALL') {
      result = result.filter((c) => c.city === selectedCity);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nit.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q)
      );
    }

    return result;
  }, [currentYearData, selectedSector, selectedCity, searchQuery]);

  const filteredPublicEntities = useMemo(() => {
    let result = publicEntities;

    if (selectedPublicSector !== 'ALL') {
      result = result.filter((e) => e.sector === selectedPublicSector);
    }

    if (publicSearchQuery.trim() !== '') {
      const q = publicSearchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.sector.toLowerCase().includes(q) ||
          e.clasificacion.toLowerCase().includes(q)
      );
    }

    return result;
  }, [publicEntities, selectedPublicSector, publicSearchQuery]);

  const top100All = useMemo(() => {
    return currentYearData.slice(0, 100);
  }, [currentYearData]);

  const historyLoaded = useMemo(() => Object.keys(historyMap).length > 0, [historyMap]);

  const resetFilters = () => {
    setSelectedSector('ALL');
    setSelectedPublicSector('ALL');
    setSelectedCity('ALL');
    setSearchQuery('');
    setPublicSearchQuery('');
  };

  // Historial compacto [año, rank, ingresos, ganancias, empleados] -> objetos
  const getCompanyHistory = useCallback((nit) => {
    const filas = nit ? historyMap[nit] : null;
    if (!filas) return [];
    return filas
      .map(([year, rank, ingresos, ganancias, empleados]) => ({
        year: String(year),
        rank,
        ingresos,
        ganancias,
        empleados
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [historyMap]);

  return (
    <DataContext.Provider
      value={{
        loading,
        error,
        years,
        yearIndex,
        historyLoaded,
        selectedYear,
        setSelectedYear,
        selectedSector,
        setSelectedSector,
        selectedPublicSector,
        setSelectedPublicSector,
        selectedCity,
        setSelectedCity,
        searchQuery,
        setSearchQuery,
        publicSearchQuery,
        setPublicSearchQuery,
        rankLimit,
        setRankLimit,
        selectedCompany,
        setSelectedCompany,
        selectedPublicEntity,
        setSelectedPublicEntity,
        activeTab,
        setActiveTab,
        sectorsList,
        publicSectorsList,
        citiesList,
        currentYearData,
        publicEntities,
        filteredCompanies,
        filteredPublicEntities,
        top100All,
        resetFilters,
        getCompanyHistory
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
