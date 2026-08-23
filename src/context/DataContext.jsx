import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [rawMapData, setRawMapData] = useState({});
  const [publicEntities, setPublicEntities] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2024');
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

  useEffect(() => {
    Promise.all([
      fetch('/data.json').then((res) => {
        if (!res.ok) throw new Error('Error al cargar empresas privadas');
        return res.json();
      }),
      fetch('/public_entities.json').then((res) => {
        if (!res.ok) throw new Error('Error al cargar entidades públicas');
        return res.json();
      })
    ])
      .then(([privateData, publicData]) => {
        setRawMapData(privateData);
        setPublicEntities(publicData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const years = useMemo(() => {
    return Object.keys(rawMapData).sort().reverse();
  }, [rawMapData]);

  const currentYearData = useMemo(() => {
    return rawMapData[selectedYear] || [];
  }, [rawMapData, selectedYear]);

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

  const resetFilters = () => {
    setSelectedSector('ALL');
    setSelectedPublicSector('ALL');
    setSelectedCity('ALL');
    setSearchQuery('');
    setPublicSearchQuery('');
  };

  const getCompanyHistory = (nit) => {
    const history = [];
    years.forEach((yr) => {
      const item = (rawMapData[yr] || []).find((c) => c.nit === nit);
      if (item) {
        history.push(item);
      }
    });
    return history.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  };

  return (
    <DataContext.Provider
      value={{
        loading,
        error,
        years,
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
