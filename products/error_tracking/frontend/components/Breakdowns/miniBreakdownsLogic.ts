import { connect, kea, key, path, props, selectors } from 'kea'

import { dataNodeLogic } from '~/queries/nodes/DataNode/dataNodeLogic'
import { ErrorTrackingBreakdownsQuery } from '~/queries/schema/schema-general'

import { errorTrackingBreakdownsQuery } from '../../queries'
import { breakdownFiltersLogic } from './breakdownFiltersLogic'
import { BREAKDOWN_PRESETS, ERROR_TRACKING_BREAKDOWNS_DATA_COLLECTION_NODE_ID } from './consts'
import type { miniBreakdownsLogicType } from './miniBreakdownsLogicType'

export interface MiniBreakdownsLogicProps {
    issueId: string
}

export interface BreakdownSinglePropertyStat {
    label: string
    count: number
}

export const miniBreakdownsLogic = kea<miniBreakdownsLogicType>([
    path(['products', 'error_tracking', 'components', 'Breakdowns', 'miniBreakdownsLogic']),
    props({} as MiniBreakdownsLogicProps),
    key(({ issueId }: MiniBreakdownsLogicProps) => issueId),
    connect((props: MiniBreakdownsLogicProps) => ({
        values: [
            breakdownFiltersLogic,
            ['dateRange', 'filterTestAccounts'],
            dataNodeLogic({
                query: errorTrackingBreakdownsQuery({
                    issueId: props.issueId,
                    breakdownProperties: BREAKDOWN_PRESETS.map((preset) => preset.property),
                    dateRange: breakdownFiltersLogic.values.dateRange,
                    filterTestAccounts: breakdownFiltersLogic.values.filterTestAccounts,
                }),
                key: `mini-breakdowns-${props.issueId}`,
                dataNodeCollectionId: ERROR_TRACKING_BREAKDOWNS_DATA_COLLECTION_NODE_ID,
            }),
            ['response', 'responseLoading'],
        ],
    })),
    selectors(({ props }) => ({
        // Single query for ALL breakdown properties
        allBreakdownsQuery: [
            (s) => [s.dateRange, s.filterTestAccounts],
            (dateRange: any, filterTestAccounts: any): ErrorTrackingBreakdownsQuery => {
                return errorTrackingBreakdownsQuery({
                    issueId: props.issueId,
                    breakdownProperties: BREAKDOWN_PRESETS.map((preset) => preset.property),
                    dateRange,
                    filterTestAccounts,
                })
            },
        ],
        // Helper to get breakdown data for a specific property
        getBreakdownForProperty: [
            (s) => [s.response],
            (response: any) => {
                return (property: string): { properties: BreakdownSinglePropertyStat[]; totalCount: number } => {
                    const properties: BreakdownSinglePropertyStat[] = []
                    let totalCount = 0

                    if (response && 'results' in response && typeof response.results === 'object') {
                        if (property && response.results[property]) {
                            const propertyData = response.results[property]
                            propertyData.values.forEach((value: any) => {
                                properties.push({
                                    label: value.breakdown_value,
                                    count: value.count,
                                })
                            })
                            totalCount = propertyData.total_count || 0
                        }
                    }

                    return { properties, totalCount }
                }
            },
        ],
    })),
])
