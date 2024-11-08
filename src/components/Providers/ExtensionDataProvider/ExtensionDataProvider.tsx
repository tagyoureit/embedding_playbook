"use client"
import React, { createContext, useState, useContext, useCallback } from 'react';
import { DatasourceModelCollection, MetricCollection } from 'models';

// Create a context
export const ExtensionDataContext = createContext<ContextDataWrapper>({
  contextData: {
    companionMode: 'none',
    displayMode: 'carousel',
    currentFiltersDisplayMode: 'top',
    handleSetVal: () => {},
    metricIdParamIsValid: false,
    currentMetric: '',
    pulseFilters: [],
    dashboardFilters: [],
    debug: 'false',
    showPulseFilters: 'false',
    showPulseAnchorChart: 'false',
    showPulseTopInsight: 'false',
    timeComparisonMode: 'primary',
    datasourceCollection: new DatasourceModelCollection([]),
    metricCollection: new MetricCollection([]),
    increment: 0,
    loginData: {
      tableauUrl: '',
      site_id: '',
      userName: '',
      caClientId: '',
      caSecretId: '',
      caSecretValue: '',
      isDashboardExtension: 'true',
    },
    positiveSentimentColor: '#00FF00',
    negativeSentimentColor: '#FF0000',
    cardBackgroundColor: '#FFFFFF',
    backgroundColor: '#FFFFFF', 
    options: {
      cardTitleText: {
        fontFamily: "'Tableau Book','Tableau',Arial,sans-serif",
        fontSize: "18pt",
        color: "#333333"
      },
      cardBANText: {
        fontFamily: "'Tableau Light','Tableau',Arial,sans-serif",
        fontSize: "15pt",
        color: "#333333"
      },
      cardText: {
        fontFamily: "'Tableau Book','Tableau',Arial,sans-serif",
        fontSize: "9pt",
        color: "#666666"
      },
    },
  },
  updateContextData: () => {},
});

export const ExtensionDataProvider: React.FC<any> = ({ children }) => {
  // Define state variables for secure data
  const [contextData, setContextData] = useState<ContextData>({
    companionMode: 'none',
    displayMode: 'carousel',
    currentFiltersDisplayMode: 'top',
    handleSetVal: (metricId: string) => { },
    metricIdParamIsValid: false,
    currentMetric: '',
    pulseFilters: [],
    dashboardFilters: [],
    debug: 'false',
    showPulseFilters: 'false',
    showPulseAnchorChart: 'false',
    showPulseTopInsight: 'false',
    timeComparisonMode: 'primary',
    datasourceCollection: new DatasourceModelCollection([]),
    metricCollection: new MetricCollection([]),
    increment: 0,
    loginData: {
      tableauUrl: '',
      site_id: '',
      userName: '',
      caClientId: '',
      caSecretId: '',
      caSecretValue: '',
      isDashboardExtension: 'true',
    },
    positiveSentimentColor: '#00FF00',
    negativeSentimentColor: '#FF0000',
    cardBackgroundColor: '#FFFFFF',
    backgroundColor: '#FFFFFF', 
    options: {
      cardTitleText: {
        fontFamily: "'Tableau Book','Tableau',Arial,sans-serif",
        fontSize: "18pt",
        color: "#333333"
      },
      cardBANText: {
        fontFamily: "'Tableau Light','Tableau',Arial,sans-serif",
        fontSize: "15pt",
        color: "#333333"
      },
      cardText: {
        fontFamily: "'Tableau Book','Tableau',Arial,sans-serif",
        fontSize: "9pt",
        color: "#666666"
      },
    },
  });

  // Function to update secure data
  const updateContextData = useCallback((newData: Partial<ContextData>) => {
    if (typeof newData.increment === 'undefined') newData.increment = contextData.increment + 1;
    setContextData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  }, [contextData]);

  return (
    <ExtensionDataContext.Provider value={{ contextData, updateContextData }}>
      {children}
    </ExtensionDataContext.Provider>
  );
};

export const useExtensionData = () => useContext(ExtensionDataContext);
