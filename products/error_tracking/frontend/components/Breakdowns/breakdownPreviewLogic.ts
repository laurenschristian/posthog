import { connect, kea, key, path, props, selectors } from 'kea'

import { DataNodeLogicProps, dataNodeLogic } from '~/queries/nodes/DataNode/dataNodeLogic'

import type { breakdownPreviewLogicType } from './breakdownPreviewLogicType'

export interface BreakdownSinglePropertyStat {
    label: string
    count: number
}

export interface BreakdownPreviewLogicProps {
    dataNodeLogicProps: DataNodeLogicProps
}

export const breakdownPreviewLogic = kea<breakdownPreviewLogicType>([
    path(['products', 'error_tracking', 'components', 'Breakdowns', 'breakdownPreviewLogic']),
    props({} as BreakdownPreviewLogicProps),
    key((props) => props.dataNodeLogicProps.key || 'default'),
    connect((props: BreakdownPreviewLogicProps) => ({
        values: [dataNodeLogic(props.dataNodeLogicProps), ['response', 'responseLoading']],
    })),
    selectors(({ props }) => ({
        properties: [
            (s) => [s.response],
            (response): BreakdownSinglePropertyStat[] => {
                const breakdownData: BreakdownSinglePropertyStat[] = []

                if (response && 'results' in response && typeof response.results === 'object') {
                    // Get the breakdown property from the query
                    const breakdownProperty = props.dataNodeLogicProps.query?.breakdownProperties?.[0]
                    if (breakdownProperty && response.results[breakdownProperty]) {
                        const propertyData = response.results[breakdownProperty]
                        propertyData.values.forEach((value: any) => {
                            breakdownData.push({
                                label: value.breakdown_value,
                                count: value.count,
                            })
                        })
                    }
                }

                return breakdownData
            },
        ],
        totalCount: [
            (s) => [s.response],
            (response): number => {
                if (response && 'results' in response && typeof response.results === 'object') {
                    // Get the breakdown property from the query
                    const breakdownProperty = props.dataNodeLogicProps.query?.breakdownProperties?.[0]
                    if (breakdownProperty && response.results[breakdownProperty]) {
                        return response.results[breakdownProperty].total_count || 0
                    }
                }
                return 0
            },
        ],
    })),
])
