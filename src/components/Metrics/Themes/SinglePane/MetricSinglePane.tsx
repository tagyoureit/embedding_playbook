"use client"
import { useState, useEffect, useContext } from 'react';


import { ExtensionDataContext } from '../../../Providers';
import React from 'react';
import { MetricSinglePaneDetails } from './MetricSinglePaneDetails';
import { InsightsModel } from 'models';

export const MetricSinglePane: React.FC<{
  metrics: InsightsModel[];
  propogateMetricFilter: (datasourceId: string, filterId: string, fields: string[]) => {};
  selectedValues: DatasourceFieldData[];

}> = (props) => {
  const { metrics, propogateMetricFilter, selectedValues } = props;
  const { contextData, updateContextData } = useContext(ExtensionDataContext);
const [metricOptions, setMetricOptions] = useState(contextData.metricCollection.metricOptions);
useEffect(() => {
  if (JSON.stringify(contextData.metricCollection.metricOptions) !== JSON.stringify(metricOptions)) {
    setMetricOptions(contextData.metricCollection.metricOptions);
  }
}, [contextData.metricCollection.metricOptions]);

return (
  <div className="min-h-[111px] px-16">
    <div className="grid-container" >
    {Array.isArray(metrics) ? (
      <ul className="grid gap-[1.5rem_1rem] grid-cols-[repeat(auto-fit,minmax(20.75rem,1fr))] m-0 py-6">
        {Array.isArray(metrics)
          ? metrics.map((metric) => {
              if (metricOptions[metric.id] && !(metricOptions[metric.specification_id].show || metricOptions[metric?.original_specification_id]?.show)) {
                return null;
              }
              return (
                <li
                  key={metric.specification_id}
                  style={{ backgroundColor: contextData.options.cardBackgroundColor }}
                  className="border border-[#e9f2fe] rounded-xl shadow-sm hover:shadow-lg hover:cursor-pointer active:shadow-none focus:outline-none focus:ring-2 focus:ring-[#3277d9] p-2.5 max-w-[28.5rem] flex flex-col list-none"
                >
                  <MetricSinglePaneDetails
                    key={metric.specification_id}
                    metric={metric}
                    propogateMetricFilter={propogateMetricFilter}
                    selectedValues={selectedValues}
                  />
                </li>
              );
            })
          : null}
      </ul>
    ) : null}
    </div>
  </div>
);
}
