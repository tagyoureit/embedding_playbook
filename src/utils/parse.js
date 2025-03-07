import { JSONPath } from 'jsonpath-plus';

/*
defines utilities for parsing JSON objects used throughout the project
parsing functions are designed for reuse
*/

// return an minimal representation of subscriptions
export const parseSubscriptions = (subscriptionsResponse) => {
  const subscriptions = {};

  // Retrieve properties using JSONPath
  const subscription_ids = JSONPath({ path: '$.subscriptions[*].id', json: subscriptionsResponse }); // indexing array
  const metric_ids = JSONPath({ path: '$.subscriptions[*].metric_id', json: subscriptionsResponse });
  const create_times = JSONPath({ path: '$.subscriptions[*].create_time', json: subscriptionsResponse });
  const update_times = JSONPath({ path: '$.subscriptions[*].update_time', json: subscriptionsResponse });


  // Iterate through indexing array and create leaves in the return object
  subscription_ids.forEach((subscription, index) => {
    subscriptions[index] = {
      subscription_id: subscription,
      metric_id: metric_ids[index], // Add the corresponding properties by index
      create_time: create_times[index],
      update_time: update_times[index],
    };
  });
  return subscriptions;
}

// return an minimal representation of specifications
export const parseSpecifications = (specificationsResponse) => {
  const specifications = {};

  // Retrieve properties using JSONPath
  const ids = JSONPath({ path: '$.[*].id', json: specificationsResponse }); // indexing array
  const specification = JSONPath({ path: '$.[*].specification', json: specificationsResponse });
  const definition_id = JSONPath({ path: '$.[*].definition_id', json: specificationsResponse });
  const is_default = JSONPath({ path: '$.[*].is_default', json: specificationsResponse });

  // Iterate through indexing array and create leaves in the return object
  ids.forEach((id, index) => {
    specifications[index] = {
      specification_id: id,
      specification: specification[index], // Add the corresponding properties by index
      definition_id: definition_id[index],
      is_default: is_default[index],
    }
  });
  return specifications;
}

// return an minimal representation of core metrics
export const parseDefinitions = (definitionsResponse) => {
  const definitions = {};

  // Retrieve properties using JSONPath
  const names = JSONPath({ path: '$.[*].metadata.name', json: definitionsResponse }); // indexing array
  const descriptions = JSONPath({ path: '$.[*].metadata.description', json: definitionsResponse });
  const id = JSONPath({ path: '$.[*].metadata.id', json: definitionsResponse });
  const definition = JSONPath({ path: '$.[*].specification', json: definitionsResponse });
  const extension_options = JSONPath({ path: '$.[*].extension_options', json: definitionsResponse });
  const representation_options = JSONPath({ path: '$.[*].representation_options', json: definitionsResponse });
  const insights_options = JSONPath({ path: '$.[*].insights_options', json: definitionsResponse });
  const comparisons = JSONPath({ path: '$.[*].comparisons.comparisons', json: definitionsResponse });


  // Iterate through indexing array and create leaves in the return object
  names.forEach((name, index) => {
    definitions[index] = {
      name: name,
      description: descriptions[index], // Add the corresponding properties by index
      id: id[index],
      definition: definition[index],
      extension_options: extension_options[index],
      representation_options: representation_options[index],
      insights_options: insights_options[index],
      comparisons: { comparisons: [comparisons[index]] },
    };
  });
  return definitions;
}

// finds the matching specification from the array
export const matchSpecification = (specificationsObj, definitionObj) => {
  for (const [key, specificationObj] of Object.entries(specificationsObj)) {
    if (specificationObj.definition_id === definitionObj.id) {
      return {
        specification_id: specificationObj.specification_id,
        specification: specificationObj.specification,
      };
    }
  }
}

// finds the matching subscription from the array
export const matchSubscription = (subscriptionsObj, specification_id) => {
  for (const [key, subscriptionObj] of Object.entries(subscriptionsObj)) {
    if (subscriptionObj.metric_id === specification_id) {
      return {
        subscription_id: subscriptionObj.subscription_id,
        created: subscriptionObj.create_time,
        updated: subscriptionObj.update_time,
      }
    }
  }
}

// return an minimal representation of Detail insight bundles
export const parseDetail = (bundle) => {
  const details = [];

  // Retrieve properties using JSONPath
  const ids = JSONPath({ path: '$.bundle_response.result.insight_groups[*].insights[*].result.id', json: bundle }); // indexing array
  const types = JSONPath({ path: '$.bundle_response.result.insight_groups[*].type', json: bundle });
  const markups = JSONPath({ path: '$.bundle_response.result.insight_groups[*].insights[*].result.markup', json: bundle });
  const vizzes = JSONPath({ path: '$.bundle_response.result.insight_groups[*].insights[*].result.viz', json: bundle });
  const facts = JSONPath({ path: '$.bundle_response.result.insight_groups[*].insights[*].result.facts', json: bundle });
  const characterizations = JSONPath({ path: '$.bundle_response.result.insight_groups[*].insights[*].result.characterization', json: bundle });
  const questions = JSONPath({ path: '$.bundle_response.result.insight_groups[*].insights[*].result.question', json: bundle });
  const scores = JSONPath({ path: '$.bundle_response.result.insight_groups[*].insights[*].result.score', json: bundle });


  if (Array.isArray(ids)) {
    // Iterate through indexing array and create leaves in the return object
    ids.forEach((id, index) => {
      // Using splice to insert the element at the specified index
      details.splice(index, 0, {
        id: id,
        type: types[index], // Add the corresponding properties by index
        markup: markups[index],
        viz: vizzes[index],
        fact: facts[index],
        characterization: characterizations[index],
        question: questions[index],
        score: scores[index],
      });
    });

    // sorts the array based on the "score" property
    details.sort((a, b) => b.score - a.score);

    // remove elements with type === 'ban'
    const filteredDetails = details.filter(item => item.type !== 'ban');

    return filteredDetails;
  } else {
    throw new Error(`Error parsing detail bundle, could not form an array: ${bundle}`);
  }
}

export const parseGranularity = (granularity, range) => {
  if (granularity === "GRANULARITY_BY_DAY" && range === "RANGE_CURRENT_PARTIAL") {
    return "Today";
  } else if (granularity === "GRANULARITY_BY_DAY" && range === "RANGE_LAST_COMPLETE") {
    return "Yesterday";
  } else if (granularity === "GRANULARITY_BY_DAY" && range === "RANGE_CURRENT_PARTIAL") {
    return "Week to date";
  } else if (granularity === "GRANULARITY_BY_WEEK" && range === "RANGE_LAST_COMPLETE") {
    return "Last week";
  } else if (granularity === "GRANULARITY_BY_MONTH" && range === "RANGE_CURRENT_PARTIAL") {
    return "Month to date";
  } else if (granularity === "GRANULARITY_BY_MONTH" && range === "RANGE_LAST_COMPLETE") {
    return "Last month";
  } else if (granularity === "GRANULARITY_BY_QUARTER" && range === "RANGE_CURRENT_PARTIAL") {
    return "Quarter to date";
  } else if (granularity === "GRANULARITY_BY_QUARTER" && range === "RANGE_LAST_COMPLETE") {
    return "Last quarter";
  } else if (granularity === "GRANULARITY_BY_YEAR" && range === "RANGE_CURRENT_PARTIAL") {
    return "Year to date";
  } else if (granularity === "GRANULARITY_BY_YEAR" && range === "RANGE_LAST_COMPLETE") {
    return "Last year";
  } else {
    return "Unknown";
  }
}

export const parseStats = (data, metric) => {
  const insight_groups = data?.bundle_response?.result.insight_groups;
  let result; // contains question, markup and facts
  let facts; // contains values, absolute and relative changes
  let stats = {};



  if (Array.isArray(insight_groups)) {
    insight_groups.forEach((insight) => {
      // uses the ban insight to generate stats
      if (insight.type === 'ban') {
        // BAN responses only have 1 insight_groups and 2 insights; 2nd insight group is requested separately
        // for time comparison purposes
        result = data?.bundle_response?.result.insight_groups[0].insights[0].result;
        facts = result?.facts;
        // formatted current value
        stats.value = facts?.target_period_value.formatted;
        stats.target_time_period_range = facts?.target_time_period.range; // dates within the current period
        stats.target_time_period_label = facts?.target_time_period.label; // label for the current period
        // control for plural or singular values
        if (stats.value === 1) {
          stats.plural = false;
        }
        else {
          stats.plural = true;
        }
        if (stats.plural === true) {
          stats.units = metric.representation_options.number_units.plural_noun;
        }
        else {
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
        const sentiment = facts?.sentiment;

        stats.dir = dir; // need to add react icon back in jsx/tsx files
        stats.sentiment = sentiment;

        if (sentiment === 'positive') {
          stats.color = 'text-metricsPositive';
          stats.badge = 'bg-metricsPositive';
        } else if (sentiment === 'neutral') {
          stats.color = 'text-metricsNeutral';
          stats.badge = 'bg-metricsNeutral';
        } else if (sentiment === 'negative') {
          stats.color = 'text-metricsNegative';
          stats.badge = 'bg-metricsNegative';
        }
      }
    });
    stats.comparisons = parseTimeComparisons(data, metric)

  }
  return stats;
};

const parseTimeComparisons = (data, metric) => {
  const insights = data.bundle_response.result.insight_groups.filter(group => group.type === 'ban')[0].insights;

  const formatComparison = (comparison, ban) => {
    // if (!ban.result.)
    try {
      const { absolute, relative, direction } = ban.result.facts.difference;
      const { target_period_value, comparison_period_value, comparison_time_period, sentiment } = ban.result.facts;
      const { markup } = ban.result;

      // if the value of is_nan in true, that means there was no data for that period available.
      if (absolute.is_nan) {
        comparison.absolute = '';
        comparison.relative = '';
        comparison.direction = '';
        comparison.range = '';
        comparison.markup = `No data for prior ${comparison.comparison_name}`;
        comparison.target_period_value = '';
        comparison.comparison_period_value = '';
        comparison.color = 'text-metricsNeutral';
        comparison.badge = 'bg-metricsNeutral';
        comparison.text = `No data for prior ${comparison.comparison_name}`;
        comparison.is_nan = true;
        comparison.sentiment = sentiment;
      }
      else {
        comparison.absolute = absolute.formatted;
        comparison.relative = relative.formatted;
        // Add plus sign for increments
        if (absolute.formatted && !absolute.formatted.startsWith('-')) {
          comparison.absolute = `+${absolute.formatted}`;
          comparison.relative = `+${relative.formatted}`;
        }
        comparison.range = comparison_time_period.range;
        comparison.target_period_value = target_period_value.formatted;
        comparison.comparison_period_value = comparison_period_value.formatted;
        comparison.markup = markup;
        comparison.direction = direction;
        comparison.sentiment = sentiment;
        if (sentiment === 'positive') {
          comparison.color = 'text-metricsPositive';
          comparison.badge = 'bg-metricsPositive';
        } else if (sentiment === 'neutral') {
          comparison.color = 'text-metricsNeutral';
          comparison.badge = 'bg-metricsNeutral';
        } else if (sentiment === 'negative') {
          comparison.color = 'text-metricsNegative';
          comparison.badge = 'bg-metricsNegative';
        }
        if (absolute.formatted.includes('%')) {
          const directionText = target_period_value.raw > comparison_period_value.raw ? 'Up' : 'Down';
          comparison.text = `${directionText} from ${comparison.comparison_period_value} ${comparison.comparison} (${comparison.range})`;
          comparison.markup = `\u003cspan data-direction\u003d\"${direction}\" data-sentiment\u003d\"${sentiment}\" className=\"${comparison.color} ${comparison.badge}\"\u003e${directionText}\u003c/span\u003e from ${comparison.comparison_period_value} ${comparison.comparison} (${comparison.range})`
        } else {
          comparison.text = `${comparison.relative} (${comparison.absolute}) ${comparison.comparison} (${comparison.range})`;
          comparison.markup = `\u003cspan data-direction\u003d\"${direction}\" data-sentiment\u003d\"${sentiment}\" className=\"${comparison.color} ${comparison.badge}\"\u003e${comparison.relative}\u003c/span\u003e (${comparison.absolute}) \u003c/span\u003e ${comparison.comparison} (${comparison.range})`;
        }
      }
    } catch (error) {

      comparison = {
        absolute: '',
        relative: '',
        direction: '',
        range: '',
        markup: '',
        target_period_value: '',
        comparison_period_value: '',
        color: 'text-metricsNeutral',
        badge: 'bg-metricsNeutral',
        text: '',
        sentiment: 'neutral',
      };
    }
  };

  let comparisons = metric.comparisons.comparisons[0].map(item => ({
    comparison: item.compare_config.comparison.includes('YEAR') ? 'vs. prior year' : 'vs. prior period',
    comparison_name: item.compare_config.comparison.includes('YEAR') ? 'year' : 'period',
  }));

  // Format the first comparison
  formatComparison(comparisons[0], insights[0]);

  // If there are two comparisons, format the second one if ban exists
  if (insights.length === 2) {
    formatComparison(comparisons[1], insights[1]);
  }
  else {
    comparisons.splice(1, 1);
  }

  return comparisons;
};



// return an minimal representation for insights
export const parseInsights = (bundle) => {
  const insights = [];
  // get all insight groups using JSONPath
  const insightGroups = JSONPath({ path: '$.bundle_response.result.insight_groups[*]', json: bundle });

  if (Array.isArray(insightGroups)) {
    // iterate through insight groups
    insightGroups.forEach(group => {
      const groupName = group.type; // ban, anchor, breakdown, followup, etc
      // iterate through each insight in group
      group.insights.forEach(insight => {
        if (insight?.result) {
          // get insight properties
          const { result: { id, type, markup, viz, facts, characterization, question, score } } = insight;
          let typeText = type;
          switch (type) {
            case 'ban':
              typeText = 'Big ass number';
              break;
            case 'unusualchange':
              typeText = 'Unusual change';
              break;
            case 'popC':
              typeText = 'Period over period';
              break;
            case 'currenttrend':
              typeText = 'Current trend';
              break;
            case "top-contributors":
              typeText = "Top contributors";
              break;
            case "bottom-contributors":
              typeText = "Bottom contributors";
              break;
            case "top-detractors":
              typeText = "Top detractors";
              break;
            case "bottom-detractors":
              typeText = "Bottom detractors";
              break;
            case "top-drivers":
              typeText = "Top drivers";
              break;
            case "bottom-drivers":
              typeText = "Bottom drivers";
              break;
            case "recordleveloutlier":
              typeText = "Record level outlier";
              break;
            case "newtrend":
              typeText = "New trend";
              break;
            case "riskmo":
              typeText = "Risky monopoly";
              break;
            default:
              typeText = type;
          }
          // push insights into array
          insights.push({
            id,
            group: groupName,
            type,
            typeText,
            markup,
            viz,
            fact: facts,
            characterization,
            question,
            score,
          });
        }
      });
    });

    // Sort the array based on the "score" property
    insights.sort((a, b) => b.score - a.score);

    return insights;
  } else {
    throw new Error(`Error parsing insights bundle, could not form an array: ${bundle}`);
  }
}

// returns a content map used for dynamic display
export const parseMetadata = (rawMetadata) => {
  const contentMap = {};
  const projectWorkbooks = parseWorkbooks(rawMetadata);
  const workbookDashboards = parseDashboards(rawMetadata, projectWorkbooks);
  const dashboardSheets = parseSheets(rawMetadata, workbookDashboards);
  const projectDataSources = parseDataSources(rawMetadata);

  contentMap.projects = workbookDashboards;

  return workbookDashboards;
}

// creates a tree of workbooks using projects as their root
const parseWorkbooks = (rawMetadata) => {
  const projectWorkbooks = [];

  // extract all projects using JSONPath
  const projectIds = JSONPath({ path: '$.data.workbooks.*.projectVizportalUrlId', json: rawMetadata }); // indexing array
  const workbooks = JSONPath({ path: '$.data.workbooks.*.', json: rawMetadata });
  const projectNames = JSONPath({ path: '$.data.workbooks.*.projectName', json: rawMetadata });
  const projectLuids = JSONPath({ path: '$.data.workbooks.*.projectLuid', json: rawMetadata });

  // first form a tree of projects to contain everything else
  if (Array.isArray(projectIds)) {
    const projects = [];
    // loop through ids to create a project definition from jsonpath arrays
    projectIds.forEach((projectId, index) => {
      projects.splice(index, 0, {
        id: projectId,
        name: projectNames[index], // Add the corresponding properties by index
        luid: projectLuids[index],
      });
    });

    // convert array to Set removes duplicates, then convert back to array
    const distinctProjects = [...new Set(projects)];

    // loop through all unique projects and find their child workbooks
    for (const project of distinctProjects) {
      // keep all workbooks whose ids match the project
      const matchingWorkbooks = workbooks.filter(workbook => workbook.projectVizportalUrlId === project.id);
      // new object with current project's properties
      const newProject = project;
      // adds matching workbooks to the new object
      newProject.workbooks = matchingWorkbooks;
      // Push the new object to return array
      projectWorkbooks.push(newProject);
    }

    return projectWorkbooks;
  }
}

// creates a tree of dashboards using workbooks as their root
const parseDashboards = (rawMetadata, projects) => {
  const workbookDashboards = [];

  // extract all dashboards using JSONPath
  const dashboardsData = JSONPath({ path: '$.data.dashboards.*', json: rawMetadata }); // indexing array

  if (Array.isArray(dashboardsData)) {
    // loop through projects
    projects.forEach((project, index) => {
      // loop through workbooks in project
      project.workbooks.forEach(workbook => {
        const projectDashboards = [];
        // loop through dashboards in workbook
        workbook.dashboards.forEach(dashboard => {
          dashboardsData.forEach(dashboardFull => {
            if (dashboard.id === dashboardFull.id && dashboard.luid === dashboardFull.luid) {
              projectDashboards.push(dashboardFull);
            }
          })
        });

        const newWorkbook = workbook;
        newWorkbook.dashboards = projectDashboards;
        workbookDashboards.push(newWorkbook);
      })
    });
  }

  return workbookDashboards;
}

// creates a tree of sheets using dashboards as their root
const parseSheets = (rawMetadata, workbookDashboards) => {
  const dashboardSheets = [];

  // Retrieve properties using JSONPath
  const dashboards = JSONPath({ path: '$.data.workbooks.*.projectName', json: rawMetadata }); // indexing array

  if (Array.isArray(dashboards)) {
    dashboards.forEach(dashboard => {

    });
  }

  return dashboardSheets;
}

// creates a tree of data sources using projects as their root
const parseDataSources = (rawMetadata) => {
  const dataSourceProjects = [];

  // Retrieve properties using JSONPath
  const projects = JSONPath({ path: '$.data.workbooks.*.projectName', json: rawMetadata }); // indexing array

  if (Array.isArray(projects)) {
    projects.forEach(project => {

    });
  }

  return dataSourceProjects;
}

export const applyVizFormatting = (viz, contextData) => {
  if (!viz || Object.keys(viz).length === 0) {
    return {};
  }

    const setVizParam = (paramName, value) => {
      if (viz.params) {
        const param = viz.params.find(param => param.name === paramName);
        if (param) {
          param.value = value;
        }
      }
    };
  if (!viz?.config) {
    viz.config = {};
  }
  if (contextData?.options?.cardBackgroundColor) {
    viz.config.background = contextData.options.cardBackgroundColor;
  }
/*   if (contextData?.options?.cardText?.fontFamily) {
    setVizParam('font', contextData.options.cardText.fontFamily);
  }
  if (!viz.title) viz.title = {};
  if (contextData?.options?.cardText?.color) {
    setVizParam('titleColor', contextData.options.cardText.color);
  }
  if (!viz.config.axis) viz.config.axis = {};
  if (contextData?.options?.cardText?.fontFamily) {
    setVizParam('axisLabelFont', contextData.options.cardText.fontFamily);
  } */
  if (contextData?.options?.cardText?.fontFamily) {
    setVizParam('axisTitleFont', contextData.options.cardText.fontFamily);
    setVizParam('barValueLabelFontFace', contextData.options.cardText.fontFamily);
    setVizParam('contributorAxisLabelFontFace', contextData.options.cardText.fontFamily);
    setVizParam('axisLabelFontFace', contextData.options.cardText.fontFamily);
    setVizParam('currentValueFontFace', contextData.options.cardText.fontFamily);
  }
  if (contextData?.options?.cardText?.color) {
    setVizParam('labelColor', contextData.options.cardText.color);
  }
  if (contextData?.options?.cardText?.color) {
    setVizParam('titleColor', contextData.options.cardText.color);
  }



  if (contextData?.options?.chart?.axis) {
    setVizParam('xAxisGridColorDefault', contextData.options.chart.axis);
    setVizParam('xAxisGridColorActive', contextData.options.chart.axis);
    setVizParam('contributorAxisColor', contextData.options.chart.axis);
    setVizParam('contributorAxisDomainColor', contextData.options.chart.axis);
  }
  if (contextData?.options?.chart?.axisLabels) {
    setVizParam('axisLabelColor', contextData.options.chart.axisLabels);
    setVizParam('contributorAxisLabelColor', contextData.options.chart.axisLabels);
  }
  if (contextData?.options?.chart?.primary) {
    setVizParam('contributorBarColor', contextData.options.chart.primary);
    setVizParam('currentValueCircleColor2', contextData.options.chart.primary);
    setVizParam('lineColor', contextData.options.chart.primary);
    setVizParam('colorDefault', contextData.options.chart.primary);
  }
  if (contextData?.options?.chart?.primaryLabel) {
    setVizParam('barValueLabelColor', contextData.options.chart.primaryLabel);
    setVizParam('currentValueColor', contextData.options.chart.primaryLabel);
  }
  if (contextData?.options?.chart?.average) {
    setVizParam('averageBarColor', contextData.options.chart.average);
    setVizParam('contributorBarColorAverage', contextData.options.chart.average);
  }
  if (contextData?.options?.chart?.averageLabel) {
    setVizParam('barValueLabelColorAverage', contextData.options.chart.averageLabel);
  }
  if (contextData?.options?.chart?.cumulative) {
    setVizParam('cumulativeBarColor', contextData.options.chart.cumulative);
  }
  if (contextData?.options?.chart?.cumulativeLabel) {
    setVizParam('cumulativeValueLabelColor', contextData.options.chart.cumulativeLabel);
  }
  if (contextData?.options?.chart?.favorable) {
    setVizParam('contributorBarColorFavorable', contextData.options.chart.favorable);
    setVizParam('colorDesiredTrend', contextData.options.chart.favorable);
    setVizParam('colorDesiredChange', contextData.options.chart.favorable);
  }
  if (contextData?.options?.chart?.favorableLabel) {
    setVizParam('barValueLabelColorFavorable', contextData.options.chart.favorableLabel);
    setVizParam('barValueLabelColorPositive', contextData.options.chart.favorableLabel);
  }
  if (contextData?.options?.chart?.unfavorable) {
    setVizParam('contributorBarColorUnfavorable', contextData.options.chart.unfavorable);
    setVizParam('colorUndesiredTrend', contextData.options.chart.unfavorable);
    setVizParam('colorUndersiredChange', contextData.options.chart.unfavorable);
  }
  if (contextData?.options?.chart?.unfavorableLabel) {
    setVizParam('barValueLabelColorUnfavorable', contextData.options.chart.unfavorableLabel);
    setVizParam('barValueLabelColorNegative', contextData.options.chart.unfavorableLabel);
  }
  if (contextData?.options?.chart?.unspecified) {
    setVizParam('contributorBarColorUnspecified', contextData.options.chart.unspecified);
  }
  if (contextData?.options?.chart?.unspecifiedLabel) {
    setVizParam('barValueLabelColorUnspecified', contextData.options.chart.unspecifiedLabel);
  }
  if (contextData?.options?.chart?.sum) {
    setVizParam('sumBarColor', contextData.options.chart.sum);
  }
  if (contextData?.options?.chart?.projection) {
    setVizParam('colorProjection', contextData.options.chart.projection);
  }
  if (contextData?.options?.chart?.range) {
    setVizParam('normalRangeColor', contextData.options.chart.range);
  }
  if (contextData?.options?.chart?.currentValueDotBorder) {
    setVizParam('currentValueCircleColor1', contextData.options.chart.currentValueDotBorder);
  }
  if (contextData?.options?.chart?.dotBorder) {
    setVizParam('pointStrokeColor', contextData.options.chart.dotBorder);
  }
  if (contextData?.options?.chart?.hoverDot) {
    setVizParam('hoverDotColor', contextData.options.chart.hoverDot);
  }
  if (contextData?.options?.chart?.hoverLine) {
    setVizParam('hoverVerticalLineColor', contextData.options.chart.hoverLine);
  }

  return viz;

}
