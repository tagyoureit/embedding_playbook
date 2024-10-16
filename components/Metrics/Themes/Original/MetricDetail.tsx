import { useState, useEffect, useContext } from 'react';
import {
  IconSparkles,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowNarrowRight,
} from '@tabler/icons-react';
import Filters from '../../Filters';

import { Card, CardContent, CardHeader, CardTitle } from '../../../ui';
import { Skeleton } from '../../../ui';
import { Badge } from '../../../ui';
import { Dialog, DialogTrigger } from '../../../ui';

import { useInsights } from '../../../../hooks';
import { parseInsights } from '../../../../utils';
import { InsightsModal, VegaLiteViz } from '../../..';
import { ExtensionDataContext } from '../../../ExtensionDataProvider';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { InsightsModel } from 'models';

export const MetricDetail: React.FC<{
  metric: InsightsModel;
  propogateMetricFilter: (datasourceId: string, filterId: string, fields: string[]) => {};
  selectedValues: DatasourceFieldData[];
}> = (props) => {
  const { metric, propogateMetricFilter, selectedValues } = props;
  const datasourceId = metric?.definition?.datasource.id || '';
  const extension_options: ExtensionOptions = metric.extension_options || {
    allowed_dimensions: [],
    allowed_granularities: [],
    offset_from_today: 0,
  };
  // distinct count of insights
  const [bundleCount, setBundleCount] = useState<number | null>(null);
  // const [datasourceIds, setDatasourceIds] = useState<DatasourceFieldData[]>([]);
  let result; // contains question, markup and facts
  let facts; // contains values, absolute and relative changes
  let stats: any = { sentiment: undefined }; // prop storing key facts
  // tanstack query hook
  const { data, error, isError, isSuccess, failureCount, failureReason } = useInsights(metric);
  const { contextData, updateContextData } = useContext(ExtensionDataContext);
  const [filterReady, setFilterReady] = useState<boolean>(false);
  const [appliedFilters, setAppliedFilters] = useState<React.ReactNode>(() => <div></div>);
  // const [mergedFieldData, setMergedFieldData] = useState<FieldResult[]>([]);
  // const [currDatasourceFilterFields, setCurrDatasourceFilterFields] = useState<any[]>([]);
  const [filtersApplied, setFiltersApplied] = useState<'flex' | 'hidden'>('hidden');
  const currDatasourceFilterFields = extension_options.allowed_dimensions;
  const [insights, setInsights] = useState<InsightsModel[]>([]);

  useEffect(() => {
    let mff = contextData?.datasourceCollection?.getDatasource(datasourceId)?.metricFilterFields;
    if (mff && mff.length > 0) {
      setFilterReady(true);
    }
  }, [() => contextData.datasourceCollection.getDatasource(datasourceId)?.metricFilterFields]);

  useEffect(() => {
    if (metric?.specification?.filters && metric?.specification?.filters?.length > 0) {
      let filters = '';
      metric.specification.filters.forEach((f) => {
        let str = `${f.field}: ${f.values.join(', ')}`;
        filters += str + '<br/>';
      });

      const filtersHtml = <div dangerouslySetInnerHTML={{ __html: filters }} />;
      if (appliedFilters !== filters) {
        setAppliedFilters(filtersHtml);
      }
      setFiltersApplied('flex');
    } else setFiltersApplied('hidden');
  }, [metric?.specification?.filters]);

  useEffect(() => {
    if (isSuccess) {
      // main data found in insight groups
      const details = parseInsights(data);
      setInsights(details);
      setBundleCount(details.length);
    }
  }, [isSuccess, data]);

  if (isError) {
    console.debug(error);
  }

  if (isSuccess) {
    const insight_groups = data?.bundle_response?.result.insight_groups;

    if (Array.isArray(insight_groups)) {
      insight_groups.forEach((insight) => {
        // uses the ban insight to generate stats
        if (insight.type === 'ban') {
          // BAN responses only have 1 insight_groups and 1 insights
          result = data?.bundle_response?.result.insight_groups[0].insights[0].result;
          facts = result?.facts;
          // formatted current value
          stats.value = facts?.target_period_value.formatted;
          // control for plural or singular values
          if (stats.value === 1) {
            stats.plural = false;
          } else {
            stats.plural = true;
          }
          if (stats.plural === true) {
            stats.units = metric.representation_options.number_units.plural_noun;
          } else {
            stats.units = metric.representation_options.number_units.singular_noun;
          }
          // absolute difference in unit of measurement
          stats.absolute = facts?.difference.absolute.formatted;
          // always a percentage
          stats.relative = facts?.difference.relative.formatted;
          // show a plus sign for increments
          if (stats.absolute) {
            if (!stats?.absolute.startsWith('-')) {
              stats.absolute = '+' + stats.absolute;
              stats.relative = '+' + stats.relative;
            }
          }

          // direction of the arrow icon -- new Logical/sentimental version dschober
          const dir = facts?.difference.direction;
          const sent = facts?.sentiment;

          if (dir === 'up') {
            stats.direction = <IconTrendingUp />;
          } else if (dir === 'down') {
            stats.direction = <IconTrendingDown />;
          } else if (dir === 'flat') {
            stats.direction = <IconArrowNarrowRight />;
          }

          if (sent === 'positive') {
            stats.color = 'text-metricsPositive';
            stats.badge = 'bg-metricsPositive';
          } else if (sent === 'neutral') {
            stats.color = 'text-metricsNeutral';
            stats.badge = 'bg-metricsNeutral';
          } else if (sent === 'negative') {
            stats.color = 'text-metricsNegative';
            stats.badge = 'bg-metricsNegative';
          }
        }
      });
    }
  }

  const myIcon: IconProp = faFilter;

  async function handleMetricFilter(datasourceId: string, filterId: string, fields: string[]) {
    console.log(
      `field passed to handleMetricFilter: ${datasourceId} ${filterId} ${fields} in metric ${metric.name}${metric.nameFilters}`
    );
    propogateMetricFilter(datasourceId, filterId, fields);
  }

  // fully loaded state
  return (
    // tslint: disable-next-line
    <Card className="flex flex-col flex-grow rounded-xl border border-stone-200 bg-white text-stone-950 shadow dark:border-stone-800 dark:text-stone-50 min-h-[111px] max-w-[350px] dark:bg-stone-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-0">
        <CardTitle className="text-stone-500 dark:text-stone-300 leading-5 font-bold pl-3 overflow-hidden">
          {metric.name}
          <span className="font-normal text-xs block mt-[-3px]">
            {metric.namePeriod}
            {contextData.currentFiltersDisplayMode === 'top' &&
              metric.nameFilters &&
              ` - ${metric.nameFilters}`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Stats
          isSuccess={isSuccess}
          stats={stats}
          bundleCount={bundleCount}
          metric={metric}
          insights={insights}
          viz={data?.bundle_response?.result?.insight_groups[1]?.summaries[0]?.result?.viz}
        />
        {contextData.currentFiltersDisplayMode === 'bottom' && (
          <div
            className={`text-stone-500 dark:text-stone-300 leading-5 pl-3 overflow-hidden ${filtersApplied}`}
          >
            <FontAwesomeIcon icon={myIcon} />
            {appliedFilters}
          </div>
        )}
        {filterReady &&
          contextData.showPulseFilters === 'true' &&
          currDatasourceFilterFields.map((filter: string) => {
            return (
              <Filters
                key={datasourceId + '-' + metric.id + '-' + filter}
                datasourceId={datasourceId}
                filterId={filter}
                handleMetricFilter={handleMetricFilter}
                passedValues={selectedValues}
                metric={metric}
              />
            );
          })}
      </CardContent>
    </Card>
  );
};

const Stats: React.FC<StatsProps> = (props) => {
  const { isSuccess, stats, bundleCount, metric, viz, insights } = props;
  const { contextData, updateContextData } = useContext(ExtensionDataContext);
  let popupWindowRef: Window | null = null;

  if (isSuccess) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="grid grid-cols-12">
          <div className="col-span-8 grid grid-rows-2">
            <div className="flex items-center justify-end col-span-7 text-2xl font-bold text-right mr-1">
              {stats.value ? stats.value : null}
            </div>
            <Dialog>
              <DialogTrigger>
                <Badge
                  className={`${stats.badge} text-stone-50 h-6 w-full ml-6 flex items-center justify-center`}
                  variant={undefined}
                >
                  <IconSparkles width={15} height={15} className="mr-1" />
                  {bundleCount}
                </Badge>
              </DialogTrigger>
              <InsightsModal metric={metric} stats={stats} />
            </Dialog>
          </div>
          <div
            className={`col-span-4 grid justify-evenly items-end text-xs text-muted-foreground ${stats.color}`}
          >
            <div>{stats.units}&nbsp;</div>
            <div>{stats.direction}</div>
            <div>{stats.absolute}&nbsp;</div>
            <div>{stats.relative ? `${stats.relative} △` : null}&nbsp;</div>
          </div>
        </div>
        {viz && contextData.showPulseAnchorChart === 'true' && (
          <VegaLiteViz height={'140'} width={'100%'} spec={viz} testId={undefined} />
        )}
        {insights && insights.length > 0 && contextData.showPulseTopInsight === 'true' && (
          <div className="flex flex-row flex-grow-0 mt-2">
            <div className="w-full h-full">
              <div className="inline-block text-white py-0 px-2 rounded-full bg-[#003a6ae0] ml-1 text-[0.8rem]">
                {insights[0].typeText}
              </div>
              <div className="text-[#030303e0] mt-0 mx-1 text-[0.9rem] font-medium">
                {insights[0].question}
              </div>
              <div className="text-[#003a6ae0] mt-0 mx-2 mb-1 text-[0.9rem] font-medium">
                {insights[0].markup.includes('<span') ? (
                  <p dangerouslySetInnerHTML={{ __html: insights[0].markup }} />
                ) : (
                  <p>{insights[0].markup}</p>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-row">
          <Dialog>
            <DialogTrigger
              // onClick={() => {
              //   console.log(`calling handleSetVal with ${(metric as any).specification_id}`);
              //   // handleSetVal(metric.id);
              //   contextData.companionMode === 'source' ? contextData.handleSetVal((metric as any).specification_id) : null;
              // }}
              onClick={() => {
                const metricId = (metric as any).specification_id;
                console.log(`calling handleSetVal with ${metricId}`);

                if (contextData.companionMode === 'source') {
                  contextData.handleSetVal(metricId);
                } else if (contextData.companionMode === 'popup') {
                  // Define the popup URL
                  const popupUrl = `/pulseExtension/pulseExtensionInsightsPopup?metricId=${metricId}`;

                  // Check if the popup window is already open and valid
                  if (!popupWindowRef || popupWindowRef.closed) {
                    // Open a new popup window and store the reference
                    popupWindowRef = window.open(
                      popupUrl,
                      'insightsPopup',
                      'width=1225,height=645'
                    );
                  } else {
                    // If the popup is already open, just update the URL and bring it to focus
                    popupWindowRef.location.href = popupUrl;
                    popupWindowRef.focus();
                  }
                }
              }}
            ></DialogTrigger>
            {contextData.companionMode === 'none' || contextData.companionMode === 'target' ? (
              <InsightsModal metric={metric} stats={stats} />
            ) : null}
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-8 grid grid-rows-3">
        <div className="text-stone-500 dark:text-stone-300 leading-5 font-bold pl-3 whitespace-nowrap overflow-hidden p-3 pb-0">
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="flex items-center justify-end col-span-7 text-2xl font-bold text-right mr-1">
          <Skeleton className="h-7 w-20" />
        </div>
        <Skeleton className="h-5 w-24 my-auto ml-6" />
      </div>
      <div
        className={`col-span-4 grid justify-evenly items-end text-xs text-muted-foreground ${stats.color} py-2`}
      >
        <div>
          <Skeleton className="h-4 w-7" />
        </div>
        <div>
          <Skeleton className="h-4 w-7" />
        </div>
        <div>
          <Skeleton className="h-4 w-7" />
        </div>
        <div>
          <Skeleton className="h-4 w-7" />
        </div>
      </div>
    </div>
  );
};